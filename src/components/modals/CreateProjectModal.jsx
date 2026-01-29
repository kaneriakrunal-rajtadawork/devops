import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';

const visibilityOptions = [
  {
    label: 'Public',
    value: 'public',
    disabled: true,
    icon: (
      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" /><path d="M2 12h20" stroke="currentColor" strokeWidth="2" /></svg>
    ),
    description: 'Anyone on the internet can view the project. Certain features like TFVC are not supported.'
  },
  {
    label: 'Private',
    value: 'private',
    disabled: false,
    icon: (
      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="2" fill="none" /><path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" /></svg>
    ),
    description: 'Only people you give access to will be able to view this project.'
  }
];

const versionControlOptions = ['Git', 'TFVC'];
const workItemProcessOptions = ['Agile', 'Basic', 'CMMI', 'Scrum'];

const CreateProjectModal = ({ isOpen, onClose, onProjectCreated }) => {
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('private');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [versionControl, setVersionControl] = useState('Git');
  const [workItemProcess, setWorkItemProcess] = useState('Agile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const modalRef = useRef(null);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (isOpen) {
      setProjectName('');
      setDescription('');
      setVisibility('private');
      setShowAdvanced(false);
      setVersionControl('Git');
      setWorkItemProcess('Agile');
      setError(null);
    }
  }, [isOpen]);

  // Trap focus inside modal
  useEffect(() => {
    if (!isOpen) return;
    const focusableEls = modalRef.current?.querySelectorAll(
      'input, textarea, button, select, [tabindex]:not([tabindex="-1"])'
    );
    const firstEl = focusableEls?.[0];
    const lastEl = focusableEls?.[focusableEls.length - 1];
    function handleTab(e) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    }
    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!user || !user.id) {
        setError('You must be logged in to create a project.');
        return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: projectName,
          user_id: user.id,
          description:description,
          status: 'active',
          technologies: [],
          featured: false,
          images: [],
        })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create project');
      }
      const project = await res.json();
      setSuccess(true);
      onProjectCreated(project);
      setSuccess(false);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      aria-modal="true"
      role="dialog"
      aria-labelledby="create-project-modal-title"
      className="fixed bottom-0 right-0 z-50 flex items-end justify-end p-6"
      style={{ background: 'rgba(0,0,0,0.01)' }}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-xl bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col max-h-[90vh]"
        style={{ minWidth: 400 }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 border-b border-gray-200 px-8 py-6 flex items-center justify-between">
          <h2 id="create-project-modal-title" className="text-2xl font-semibold">Create new project</h2>
          <button
            aria-label="Close modal"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 cursor-pointer p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        {/* Content & Footer in Form */}
        <form className="flex-1 overflow-y-auto px-8 py-6 flex flex-col" style={{ maxHeight: 'calc(90vh - 120px)' }} onSubmit={handleCreate}>
          {/* Project Name */}
          <div className="mb-5">
            <label htmlFor="project-name" className="block text-base font-medium text-gray-800 mb-1">Project name <span className="text-red-500">*</span></label>
            <input
              id="project-name"
              name="project-name"
              type="text"
              required
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              aria-required="true"
              aria-label="Project name"
              autoFocus
            />
          </div>
          {/* Description */}
          <div className="mb-5">
            <label htmlFor="project-description" className="block text-base font-medium text-gray-800 mb-1">Description</label>
            <textarea
              id="project-description"
              name="project-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px] text-base"
              aria-label="Project description"
            />
          </div>
          {/* Visibility */}
          <div className="mb-2">
            <div className="flex flex-row gap-4">
              {visibilityOptions.map(opt => (
                <label
                  key={opt.value}
                  className={`flex-1 border rounded-lg px-4 py-3 flex flex-col cursor-pointer transition-all duration-150 ${
                    visibility === opt.value ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50' : 'border-gray-200 bg-white'
                  } ${opt.disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center mb-1">
                    {opt.icon}
                    <span className="font-medium text-base">{opt.label}</span>
                    <input
                      type="radio"
                      name="visibility"
                      value={opt.value}
                      checked={visibility === opt.value}
                      onChange={() => setVisibility(opt.value)}
                      disabled={opt.disabled}
                      className="ml-auto accent-blue-500 cursor-pointer"
                      aria-checked={visibility === opt.value}
                      aria-disabled={opt.disabled}
                    />
                  </div>
                  <span className="text-xs text-gray-600 mb-1 pl-7">{opt.description}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="mb-5 mt-1 text-xs text-gray-600">
            Public projects are disabled for your organization. You can turn on public visibility with{' '}
            <a href="#" className="text-blue-600 underline cursor-pointer">organization policies</a>.
          </div>
          {/* Advanced Toggle */}
          <div className="mb-5">
            <button
              type="button"
              className="w-full flex items-center justify-between px-3 py-2 border border-gray-200 rounded bg-gray-50 hover:bg-gray-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-expanded={showAdvanced}
              aria-controls="advanced-section"
              onClick={() => setShowAdvanced(v => !v)}
            >
              <span className="font-medium text-base">Advanced</span>
              <svg className={`w-4 h-4 transform transition-transform ${showAdvanced ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
            </button>
            {showAdvanced && (
              <div id="advanced-section" className="mt-3 flex flex-row gap-3">
                <div className="flex-1">
                  <label htmlFor="version-control" className="block text-xs font-medium text-gray-600 mb-1">Version control</label>
                  <select
                    id="version-control"
                    value={versionControl}
                    onChange={e => setVersionControl(e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    aria-label="Version control"
                  >
                    {versionControlOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label htmlFor="work-item-process" className="block text-xs font-medium text-gray-600 mb-1">Work item process</label>
                  <select
                    id="work-item-process"
                    value={workItemProcess}
                    onChange={e => setWorkItemProcess(e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    aria-label="Work item process"
                  >
                    {workItemProcessOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
          {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
          {success && <div className="text-green-600 text-sm mb-2">Project created successfully!</div>}
          {/* Spacer for fixed footer */}
          <div className="h-20" />
          {/* Action Buttons (sticky footer inside form) */}
          <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-8 py-4 flex justify-end gap-2 z-20 mt-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded border border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!projectName || loading}
              className={`px-5 py-2 rounded bg-blue-600 text-white font-semibold shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base cursor-pointer ${(!projectName || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? <span className="flex items-center"><svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>Creating...</span> : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal; 