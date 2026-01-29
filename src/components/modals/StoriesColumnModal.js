import React, { useState } from 'react';

const StoriesColumnModal = ({ isOpen, onClose, position }) => {
  const [settings, setSettings] = useState({
    parents: true,
    forecasting: false,
    inProgressItems: true,
    completedChildItems: true,
    keepHierarchy: false,
    sidePane: 'off' // 'mapping', 'planning', or 'off'
  });

  if (!isOpen) return null;

  const handleToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleSidePaneChange = (value) => {
    setSettings(prev => ({
      ...prev,
      sidePane: value
    }));
  };

  return (
    <div 
      className="absolute bg-white rounded-lg shadow-lg border border-gray-200 w-64 z-50"
      style={{ 
        top: position?.y || 0,
        left: position?.x || 0
      }}
    >
      <div className="p-4 space-y-4">
        <div className="space-y-4">
          {/* Toggle Options */}
          <div className="flex justify-between items-center">
            <span className="text-sm">Parents</span>
            <button 
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${settings.parents ? 'bg-blue-500' : 'bg-gray-300'}`}
              onClick={() => handleToggle('parents')}
            >
              <div className={`w-4 h-4 rounded-full bg-white transform transition-transform duration-200 ${settings.parents ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm">Forecasting</span>
            <button 
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${settings.forecasting ? 'bg-blue-500' : 'bg-gray-300'}`}
              onClick={() => handleToggle('forecasting')}
            >
              <div className={`w-4 h-4 rounded-full bg-white transform transition-transform duration-200 ${settings.forecasting ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm">In Progress Items</span>
            <button 
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${settings.inProgressItems ? 'bg-blue-500' : 'bg-gray-300'}`}
              onClick={() => handleToggle('inProgressItems')}
            >
              <div className={`w-4 h-4 rounded-full bg-white transform transition-transform duration-200 ${settings.inProgressItems ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm">Completed Child Items</span>
            <button 
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${settings.completedChildItems ? 'bg-blue-500' : 'bg-gray-300'}`}
              onClick={() => handleToggle('completedChildItems')}
            >
              <div className={`w-4 h-4 rounded-full bg-white transform transition-transform duration-200 ${settings.completedChildItems ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm">Keep hierarchy with filters</span>
            <button 
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${settings.keepHierarchy ? 'bg-blue-500' : 'bg-gray-300'}`}
              onClick={() => handleToggle('keepHierarchy')}
            >
              <div className={`w-4 h-4 rounded-full bg-white transform transition-transform duration-200 ${settings.keepHierarchy ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        {/* Side Pane Section */}
        <div className="border-t pt-4">
          <h3 className="text-sm font-medium mb-2">Side Pane</h3>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="sidePane"
                value="mapping"
                checked={settings.sidePane === 'mapping'}
                onChange={(e) => handleSidePaneChange(e.target.value)}
                className="form-radio text-blue-500"
              />
              <span className="text-sm">Mapping</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="sidePane"
                value="planning"
                checked={settings.sidePane === 'planning'}
                onChange={(e) => handleSidePaneChange(e.target.value)}
                className="form-radio text-blue-500"
              />
              <span className="text-sm">Planning</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="sidePane"
                value="off"
                checked={settings.sidePane === 'off'}
                onChange={(e) => handleSidePaneChange(e.target.value)}
                className="form-radio text-blue-500"
              />
              <span className="text-sm">Off</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoriesColumnModal; 