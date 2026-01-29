'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, Star, Users, Edit, RotateCw, Maximize2, MoreVertical, Plus, ChevronDown, Minimize2 } from 'lucide-react';

const DashboardPage = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedDashboard, setSelectedDashboard] = useState('Synxa Team - Overview');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const dropdownRef = useRef(null);
  const containerRef = useRef(null);

  const dashboards = [
    { id: 'synxa_team', label: 'Synxa Team' },
    { id: 'synxa_team_overview', label: 'Synxa Team - Overview' },
  ];

  const handleAddWidget = () => {
    console.log('Add widget clicked');
    // Future implementation for adding widgets
  };

  const handleDashboardSelect = (dashboard) => {
    setSelectedDashboard(dashboard);
    setIsDropdownOpen(false);
  };

  const toggleFullscreen = async () => {
    if (!isFullscreen) {
      try {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        } else if (containerRef.current.webkitRequestFullscreen) {
          await containerRef.current.webkitRequestFullscreen();
        } else if (containerRef.current.msRequestFullscreen) {
          await containerRef.current.msRequestFullscreen();
        }
      } catch (err) {
        console.error('Error attempting to enable fullscreen:', err);
      }
    } else {
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          await document.msExitFullscreen();
        }
      } catch (err) {
        console.error('Error attempting to exit fullscreen:', err);
      }
    }
  };

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
      );
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredDashboards = dashboards.filter(dashboard =>
    dashboard.label.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div 
      ref={containerRef} 
      className={`flex flex-col h-full bg-white ${isFullscreen ? '!bg-gray-100' : ''}`}
      style={{ minHeight: isFullscreen ? '100vh' : 'auto' }}
    >
      {/* Top Header */}
      <div className={`flex justify-between items-center px-4 py-2 ${isFullscreen ? 'bg-white' : ''}`}>
        {/* Left Section */}
        <div className="flex items-center gap-2">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 p-2 bg-gray-50 hover:bg-gray-100 rounded min-w-[200px] cursor-pointer"
            >
              <img
                src="/_assets/image/dashboard-icon.svg"
                alt="Dashboard"
                className="w-5 h-5"
              />
              <span className="font-medium flex-1 text-left">{selectedDashboard}</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {isDropdownOpen && (
              <div className="absolute left-0 top-full mt-1 w-full bg-white rounded-md shadow-lg z-50">
                <div className="p-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search dashboards"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      className="w-full pl-8 pr-4 py-1.5 border rounded text-sm"
                    />
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <div className="py-1">
                  <div className="px-3 py-2">
                    <h3 className="font-medium text-sm text-blue-600">Synxa Team</h3>
                  </div>
                  {filteredDashboards.map((dashboard) => (
                    <button
                      key={dashboard.id}
                      onClick={() => handleDashboardSelect(dashboard.label)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer ${
                        selectedDashboard === dashboard.label ? 'bg-gray-100' : ''
                      }`}
                    >
                      {dashboard.label}
                    </button>
                  ))}
                  <button
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    New dashboard
                  </button>
                  <div className="border-t border-gray-200 mt-1">
                    <button
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-gray-700 cursor-pointer"
                    >
                      Browse all dashboards
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <button className="text-gray-400 hover:text-gray-600 p-1 rounded-sm hover:bg-gray-50 cursor-pointer">
            <Star className="w-5 h-5" />
          </button>
          <button className="text-gray-400 hover:text-gray-600 p-1 rounded-sm hover:bg-gray-50 cursor-pointer">
            <Users className="w-5 h-5" />
          </button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            Modified 3m ago by subbaramireddy kummithi
          </span>
          <button className="flex items-center gap-1 text-gray-700 hover:bg-gray-50 px-2 py-1 rounded cursor-pointer">
            <Edit className="w-4 h-4" />
            <span className="text-sm">Edit</span>
          </button>
          <button className="text-gray-400 hover:text-gray-600 p-1 rounded-sm hover:bg-gray-50 cursor-pointer">
            <RotateCw className="w-5 h-5" />
          </button>
          <button 
            onClick={toggleFullscreen}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-sm hover:bg-gray-50 cursor-pointer"
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5" />
            ) : (
              <Maximize2 className="w-5 h-5" />
            )}
          </button>
          <button className="text-gray-400 hover:text-gray-600 p-1 rounded-sm hover:bg-gray-50 cursor-pointer">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content - Empty State */}
      <div className={`flex-1 flex flex-col items-center justify-center px-8 ${isFullscreen ? 'bg-gray-100' : ''}`}>
        <img
          src="/_assets/image/empty-dashboard.svg"
          alt="Empty Dashboard"
          className="w-64 mb-8"
        />
        <h2 className="text-2xl font-bold mb-2">
          This dashboard not have widgets just yet!
        </h2>
        <p className="text-gray-600 mb-6">
          Add one or more widgets to gain visibility into your team progress.
        </p>
        <button
          onClick={handleAddWidget}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors cursor-pointer"
        >
          Add a widget
        </button>
      </div>
    </div>
  );
};

export default DashboardPage; 