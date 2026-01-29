'use client';

import React, { useState, useEffect } from 'react';
import { Plus, X, ChevronDown, Trash2, Search } from 'lucide-react';
import Dropdown from '@/utils/Dropdown';

const FIELD_OPTIONS = [
  { id: 'activity', label: 'Activity' },
  { id: 'application_type', label: 'Application type' }
];

const OPERATOR_OPTIONS = [
  { id: 'equals', label: '=' },
  { id: 'not_equals', label: '<>' },
  { id: 'not_equals_alt', label: '!=' }
];

const VALUE_OPTIONS = [
  { id: 'design', label: 'Design' },
  { id: 'development', label: 'Development' }
];

const NewPlanModal = ({ isOpen, onClose, onCreatePlan }) => {
  const initialFormState = {
    name: '',
    description: '',
    teams: [{ project: 'Synxa', team: 'Synxa Team', backlog: '' }],
    criteria: []
  };

  const [formData, setFormData] = useState(initialFormState);
  const [criteriaError, setCriteriaError] = useState('');

  // Reset form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormState);
      setCriteriaError('');
    }
  }, [isOpen]);

  const handleAddTeam = () => {
    setFormData(prev => ({
      ...prev,
      teams: [...prev.teams, { project: '', team: '', backlog: '' }]
    }));
  };

  const handleRemoveTeam = (index) => {
    setFormData(prev => ({
      ...prev,
      teams: prev.teams.filter((_, i) => i !== index)
    }));
  };

  const handleTeamChange = (e, index, field, value) => {
    e.stopPropagation();
    setFormData(prev => {
      const newTeams = [...prev.teams];
      newTeams[index] = { ...newTeams[index], [field]: value };
      return { ...prev, teams: newTeams };
    });
  };

  const handleAddCriteria = () => {
    const newCriteria = { field: '', operator: '', value: '' };
    setFormData(prev => ({
      ...prev,
      criteria: [...prev.criteria, newCriteria]
    }));
  };

  const handleRemoveCriteria = (index) => {
    setFormData(prev => ({
      ...prev,
      criteria: prev.criteria.filter((_, i) => i !== index)
    }));
    setCriteriaError('');
  };

  const handleCriteriaChange = (e, index, field, value) => {
    e.stopPropagation();
    setFormData(prev => {
      const newCriteria = [...prev.criteria];
      newCriteria[index] = { ...newCriteria[index], [field]: value };
      
      // Check for duplicates
      const fields = newCriteria.map(c => c.field).filter(Boolean);
      const hasDuplicates = fields.length !== new Set(fields).size;
      setCriteriaError(hasDuplicates ? 'You cannot select duplicate field criteria.' : '');
      
      return { ...prev, criteria: newCriteria };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!formData.name.trim() || criteriaError) {
      return;
    }
    
    onCreatePlan({
      ...formData,
      id: Date.now(),
      created_by: 'kummithifamily0889',
      lastconfigured: new Date().toISOString(),
      lastaccessed: new Date().toISOString()
    });
    onClose();
  };

  return (
    <div 
      className={`fixed inset-y-0 right-0 w-[800px] bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } z-50 flex flex-col`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Fixed Header */}
      <div className="flex items-center justify-between p-6">
        <h2 className="text-xl font-semibold">New delivery plan</h2>
        <button onClick={(e) => {
          e.stopPropagation();
          onClose();
        }} className="text-gray-500 hover:text-gray-700">
          <X size={20} />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <form 
          id="planForm" 
          onSubmit={handleSubmit}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6">
            <p className="text-sm text-gray-600 mb-4">
              A delivery plan shows you when work will be delivered across your teams. The plan overlays each team sprint onto a familiar calendar view. You can view multiple backlogs and multiple teams across your whole organization.
              <a href="#" className="text-blue-600 hover:underline ml-1">Learn more</a>
            </p>

            <div className="space-y-6">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Name <span className="text-red-500">*</span>
                  <span className="float-right text-gray-500 text-sm">Required</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter a plan name"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 transition-colors"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              {/* Description Field */}
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  placeholder="Add a description to make finding plans simpler and faster"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 transition-colors h-24"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              {/* Teams Section */}
              <div>
                <div className="grid grid-cols-3 gap-4 mb-2">
                  <div className="text-sm font-medium">Project</div>
                  <div className="text-sm font-medium">Team</div>
                  <div className="text-sm font-medium">Backlog</div>
                </div>
                {formData.teams.map((team, index) => (
                  <div key={index} className="flex gap-4 mb-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex-1">
                      <Dropdown
                        options={[{ id: 'synxa', label: 'Synxa' }]}
                        initialValue="Synxa"
                        onSelect={(option, e) => handleTeamChange(e, index, 'project', option.label)}
                        className="border border-gray-300 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div className="flex-1">
                      <Dropdown
                        options={[{ id: 'synxa_team', label: 'Synxa Team' }]}
                        initialValue="Synxa Team"
                        onSelect={(option, e) => handleTeamChange(e, index, 'team', option.label)}
                        className="border border-gray-300 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div className="flex-1 flex gap-2">
                      <div className="flex-1">
                        <Dropdown
                          options={[
                            { id: 'features', label: 'Features' },
                            { id: 'stories', label: 'Stories' }
                          ]}
                          initialValue="Select backlog..."
                          onSelect={(option, e) => handleTeamChange(e, index, 'backlog', option.label)}
                          className="border border-gray-300 focus:border-blue-500 transition-colors"
                        />
                      </div>
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveTeam(index);
                          }}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddTeam();
                  }}
                  className="mt-2 cursor-pointer inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded"
                >
                  <Plus size={16} className="mr-1" /> Add team
                </button>
              </div>

              {/* Field Criteria Section */}
              <div>
                <h3 className="text-sm font-medium mb-1">Field criteria</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Use field criteria to limit the work items appearing on your plan. This criteria applies to all users of the plan.
                </p>
                {criteriaError && (
                  <p className="text-red-500 text-sm mb-2">❌ {criteriaError}</p>
                )}
                {formData.criteria.map((criteria, index) => (
                  <div key={index} className="flex gap-4 mb-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex-1">
                      <Dropdown
                        options={FIELD_OPTIONS}
                        initialValue="Select field..."
                        onSelect={(option, e) => handleCriteriaChange(e, index, 'field', option.id)}
                        className="border border-gray-300 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div className="flex-1">
                      <Dropdown
                        options={OPERATOR_OPTIONS}
                        initialValue="Select operator..."
                        onSelect={(option, e) => handleCriteriaChange(e, index, 'operator', option.id)}
                        className="border border-gray-300 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div className="flex-1 flex gap-2">
                      <div className="flex-1">
                        <Dropdown
                          options={VALUE_OPTIONS}
                          initialValue="Select value..."
                          onSelect={(option, e) => handleCriteriaChange(e, index, 'value', option.id)}
                          className="border border-gray-300 focus:border-blue-500 transition-colors"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveCriteria(index);
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="inline-flex cursor-pointer items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddCriteria();
                  }}
                >
                  <Plus size={16} className="mr-1" /> Add criteria
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Fixed Footer */}
      <div className="p-6">
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="cursor-pointer px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
          >
            Cancel
          </button>
          <button
            form="planForm"
            type="submit"
            className="cursor-pointer px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50"
            disabled={!formData.name.trim() || !!criteriaError}
            onClick={(e) => e.stopPropagation()}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

const DeliveryPlans = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [plans, setPlans] = useState([]);

  const handleCreatePlan = (newPlan) => {
    setPlans(prev => [...prev, newPlan]);
  };

  const filteredPlans = plans.filter(plan => 
    plan.name.toLowerCase().includes(filterText.toLowerCase()) ||
    plan.description.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-gray-100 px-6 py-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Delivery Plans</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="cursor-pointer inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded"
        >
          <Plus size={16} className="mr-1" /> New plan
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="flex justify-between items-center px-8 py-4">
          <h2 className="text-lg font-medium">Delivery Plans</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Filter plans..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 transition-colors text-sm"
            />
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {plans.length === 0 || (filterText && filteredPlans.length === 0) ? (
          <div className="p-8 text-center">
            <div className="max-w-lg mx-auto">
              <img
                src="/_assets/image/placeholder-delivery-plans.svg"
                alt="Delivery Plans"
                className="w-48 h-48 mx-auto mb-4"
              />
              <h2 className="text-xl font-semibold mb-2">You have not created a plan yet!</h2>
              <p className="text-gray-600 mb-4">
                Once you create a plan you will be able to visualize and track work across all your teams.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="cursor-pointer inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded"
              >
                New plan
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm">
                  <th className="px-4 py-2 font-medium text-gray-600">Name</th>
                  <th className="px-4 py-2 font-medium text-gray-600">Created By</th>
                  <th className="px-4 py-2 font-medium text-gray-600">Description</th>
                  <th className="px-4 py-2 font-medium text-gray-600">Last Configured</th>
                  <th className="px-4 py-2 font-medium text-gray-600">Last Accessed</th>
                  <th className="px-4 py-2 font-medium text-gray-600"></th>
                </tr>
              </thead>
              <tbody>
                {filteredPlans.map((plan) => (
                    <tr key={plan.id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <a href="#" className="text-blue-600 hover:underline">{plan.name}</a>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{plan.created_by}</td>
                    <td className="px-4 py-3 text-gray-600">{plan.description}</td>
                    <td className="px-4 py-3 text-gray-600">
                        {new Date(plan.lastconfigured).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(plan.lastaccessed).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-gray-400 hover:text-gray-600">
                        <ChevronDown size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <NewPlanModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreatePlan={handleCreatePlan}
      />
    </div>
  );
};

export default DeliveryPlans; 