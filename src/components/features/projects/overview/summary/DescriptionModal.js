import React, { useState, useRef, useEffect } from 'react';

const DUMMY_REPOS = [
  'Select a repository',
  'frontend-repo',
  'backend-repo',
  'devops-repo',
];

const DescriptionModal = ({ open, onClose, initialValue = '', initialTags = [], initialAbout = 'readme', initialRepository = 'Select a repository', onSave, loading = false }) => {
  const [description, setDescription] = useState(initialValue);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [tags, setTags] = useState(initialTags);
  const [tagInput, setTagInput] = useState('');
  const [about, setAbout] = useState(initialAbout);
  const [repository, setRepository] = useState(initialRepository);
  const modalRef = useRef(null);

  useEffect(() => {
    setDescription(initialValue);
    setTags(initialTags);
    setTagInput('');
    setAbout(initialAbout);
    setRepository(initialRepository);
    setError(null);
    setSuccess(false);
  }, [initialValue, initialTags, initialAbout, initialRepository, open]);

  // Trap focus inside modal
  useEffect(() => {
    if (!open) return;
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
  }, [open]);

  const handleSave = async (e) => {
    e.preventDefault();
    // Validation
    if (tags.length > 10) {
      setError('Maximum 10 tags allowed');
      return;
    }
    if (!repository || repository === 'Select a repository') {
      setError('Please select a repository');
      return;
    }
    setError(null);
    setSuccess(false);
    try {
      await onSave({ description, tags, about, repository });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to save description');
    }
  };

  const handleTagInput = (e) => {
    setTagInput(e.target.value);
  };
  const handleTagKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim()) && tags.length < 10) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    } else if (e.key === 'Backspace' && !tagInput && tags.length) {
      setTags(tags.slice(0, -1));
    }
  };
  const removeTag = (tag) => {
    setTags(tags.filter(t => t !== tag));
  };

  if (!open) return null;

  return (
    <div
      aria-modal="true"
      role="dialog"
      aria-labelledby="description-modal-title"
      className="fixed bottom-0 right-0 flex items-end justify-end p-6 z-50"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col h-full max-h-[95vh]"
        style={{ minWidth: 650 }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 border-b border-gray-200 px-8 py-6 flex items-center justify-between rounded-t-2xl">
          <h2 id="description-modal-title" className="text-2xl font-bold">About this project</h2>
          <button
            aria-label="Close modal"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 cursor-pointer p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        {/* Content & Footer in Form */}
        <form className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-6" style={{ maxHeight: 'calc(95vh - 120px)' }} onSubmit={handleSave}>
          {/* Description */}
          <div>
            <label htmlFor="project-description" className="block text-base font-semibold text-gray-800 mb-1">Description</label>
            <div className="relative">
              <textarea
                id="project-description"
                name="project-description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe your project and make it easier for other people to understand it..."
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px] text-base pr-10"
                aria-label="Project description"
                autoFocus
                disabled={loading}
              />
              {/* Grammarly icon placeholder */}
              <span className="absolute right-3 top-3">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="14" fill="#15C39A"/><path d="M19.5 9.5l-5.5 9-2.5-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
            </div>
          </div>
          {/* Tags */}
          <div>
            <label className="block text-base font-semibold text-gray-800 mb-1">Tags</label>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              {tags.map(tag => (
                <span key={tag} className="flex items-center bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm">
                  {tag}
                  <button type="button" className="ml-1 text-gray-400 hover:text-red-500" onClick={() => removeTag(tag)} aria-label={`Remove tag ${tag}`}>&times;</button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={handleTagInput}
                onKeyDown={handleTagKeyDown}
                className="border-none focus:ring-0 text-sm px-1 py-1 min-w-[60px] bg-transparent outline-none"
                placeholder="Add tags"
                disabled={loading || tags.length >= 10}
              />
            </div>
            <div className="text-xs text-gray-500">Max 10 tags</div>
          </div>
          {/* About radio group */}
          <div>
            <label className="block text-base font-semibold text-gray-800 mb-1">About</label>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="about"
                  value="readme"
                  checked={about === 'readme'}
                  onChange={() => setAbout('readme')}
                  className="accent-blue-600"
                  disabled={loading}
                />
                <span>Readme file</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="about"
                  value="wiki"
                  checked={about === 'wiki'}
                  onChange={() => setAbout('wiki')}
                  className="accent-blue-600"
                  disabled={loading}
                />
                <span>Wiki</span>
              </label>
            </div>
          </div>
          {/* Repository dropdown */}
          <div>
            <label className="block text-base font-semibold text-gray-800 mb-1">Repository</label>
            <select
              value={repository}
              onChange={e => setRepository(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              disabled={loading}
            >
              {DUMMY_REPOS.map(repo => (
                <option key={repo} value={repo}>{repo}</option>
              ))}
            </select>
          </div>
          {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
          {success && <div className="text-green-600 text-sm mb-2">Description saved successfully!</div>}
          {/* Footer */}
          <div className="flex justify-end gap-2 mt-8">
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
              disabled={loading}
              className={`px-5 py-2 rounded bg-blue-600 text-white font-semibold shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base cursor-pointer ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DescriptionModal; 