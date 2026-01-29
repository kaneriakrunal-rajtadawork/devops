"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Star, MoreHorizontal, Plus, ChevronDown, ChevronUp, BadgeAlert, Funnel, Icon } from 'lucide-react';
import IconButton from '@/utils/IconButton'; 
import NewViewModal from './components/NewViewModal';

const mockMyViewsData = [
  { id: 'mv1', name: 'My Active Bugs Q3', description: 'All active bugs assigned to me for the third quarter. This description can be quite long and should be truncated appropriately to fit within the allocated space in the table cell.', lastModifiedBy: 'Alex Johnson', lastModifiedTime: '2 hours ago', type: 'my' },
  { id: 'mv2', name: 'My Feature Progress', description: 'Tracking progress of features I am currently working on.', lastModifiedBy: 'Alex Johnson', lastModifiedTime: 'Yesterday', type: 'my' },
];

const mockSharedViewsData = [
  { id: 'sv1', name: 'Team Velocity Report', description: 'Weekly team velocity and sprint burndown.', lastModifiedBy: 'Sarah Miller', lastModifiedTime: '3 days ago', type: 'shared' },
  { id: 'sv2', name: 'Release Candidate Stability', description: 'View of critical issues for the upcoming release. This is another example of a potentially long description that needs to be handled gracefully by the UI.', lastModifiedBy: 'System Admin', lastModifiedTime: '5 days ago', type: 'shared' },
  { id: 'sv3', name: 'Cross-project Dependencies', description: 'Tracks dependencies across multiple projects for Q4 planning.', lastModifiedBy: 'Maria Garcia', lastModifiedTime: '1 week ago', type: 'shared' },
];

const AnalyticsViews = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [myViews, setMyViews] = useState(mockMyViewsData);
  const [sharedViews, setSharedViews] = useState(mockSharedViewsData);
  const [favorites, setFavorites] = useState(['mv1']);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [collapsedSections, setCollapsedSections] = useState({
    myViews: false,
    sharedViews: false,
    favoritesMyViews: false,
    favoritesSharedViews: false,
  });
  const [filterText, setFilterText] = useState(''); // Basic filter state
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility

  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setOpenMenuId(null);
  };

  const handleNewView = () => {
    setIsModalOpen(true);
  };

  const handleFilterClick = () => {
    // For now, let's imagine it opens a more complex filter UI
    // or applies a predefined filter.
    // As a simple example, we could toggle a mock filter:
    if (filterText) setFilterText('');
    else setFilterText('active'); // Mock filter
  };

  const toggleFavorite = (viewId) => {
    setFavorites(prev =>
      prev.includes(viewId) ? prev.filter(id => id !== viewId) : [...prev, viewId]
    );
  };

  const handleEdit = (viewId) => {
    setOpenMenuId(null);
  };

  const handleDelete = (viewId) => {
    setMyViews(prev => prev.filter(v => v.id !== viewId));
    setSharedViews(prev => prev.filter(v => v.id !== viewId));
    setFavorites(prev => prev.filter(id => id !== viewId));
    setOpenMenuId(null);
  };

  const toggleSection = (sectionKey) => {
    setCollapsedSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

  const renderViewRow = (view) => (
    <tr key={view.id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
      <td className="px-4 py-3">
        <a href="#" className="text-blue-600 hover:underline font-medium">{view.name}</a>
      </td>
      <td className="px-4 py-3 text-gray-700">
        <p className="truncate max-w-md" title={view.description}>{view.description}</p>
      </td>
      <td className="px-4 py-3 text-gray-600 text-sm whitespace-nowrap">{view.lastModifiedBy} - {view.lastModifiedTime}</td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => toggleFavorite(view.id)}
            title={favorites.includes(view.id) ? "Remove from Favorites" : "Add to Favorites"}
            className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500"
          >
            <Star className={`w-5 h-5 ${favorites.includes(view.id) ? 'text-yellow-400 fill-yellow-400' : 'hover:text-yellow-400'}`} />
          </button>
          <div className="relative">
            <button
              onClick={() => setOpenMenuId(openMenuId === view.id ? null : view.id)}
              title="More options"
              className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            {openMenuId === view.id && (
              <div ref={menuRef} className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-md shadow-lg z-20 py-1">
                <button
                  onClick={() => handleEdit(view.id)}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(view.id)}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );

  const renderTableSection = (title, viewsData, sectionKey, isFavoritesContext = false) => {
    let filteredViews = viewsData;
    if (isFavoritesContext) {
      filteredViews = viewsData.filter(v => favorites.includes(v.id));
    }
    // Apply text filter if any (example)
    if (filterText && activeTab === 'All') { // Only apply text filter on 'All' tab for this example
      filteredViews = filteredViews.filter(v => v.name.toLowerCase().includes(filterText.toLowerCase()) || v.description.toLowerCase().includes(filterText.toLowerCase()));
    }

    if (filteredViews.length === 0 && isFavoritesContext) {
      return null;
    }

    return (
      <div className="">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="flex items-center justify-between w-full text-left py-2 px-1 rounded hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-300"
        >
          <h2 className="text-lg font-semibold text-gray-700">{title} ({filteredViews.length})</h2>
          {collapsedSections[sectionKey] ? <ChevronDown className="w-5 h-5 text-gray-600" /> : <ChevronUp className="w-5 h-5 text-gray-600" />}
        </button>
        {!collapsedSections[sectionKey] && (
          <div className="overflow-x-auto mt-2">
            {filteredViews.length > 0 ? (
              <div className="bg-white border border-gray-200 rounded-md shadow-sm">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Last modified by</th>
                      <th className="px-4 py-3 w-[100px]"></th> {/* Actions column */}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredViews.map(renderViewRow)}
                  </tbody>
                </table>
              </div>
            ) : (
              !isFavoritesContext && <p className="text-gray-500 mt-3 px-1">No views in this section{filterText && " matching your filter"} .</p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold text-gray-800">Analytics views (Boards only)</h1>
      </div>

      <div className="flex pb-1 justify-between items-center border-b border-gray-200">
        <div className="flex items-center">
          <nav className="flex space-x-1">
            <button
              onClick={() => handleTabChange('Favorites')}
              className={`px-3 py-2 text-sm focus:outline-none rounded-t-md ${activeTab === 'Favorites' ? 'font-semibold text-blue-600 border-b-2 border-blue-600' : 'font-medium text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'}`}
            >
              Favorites
            </button>
            <button
              onClick={() => handleTabChange('All')}
              className={`px-3 py-2 text-sm focus:outline-none rounded-t-md ${activeTab === 'All' ? 'font-semibold text-blue-600 border-b-2 border-blue-600' : 'font-medium text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'}`}
            >
              All
            </button>
          </nav>
          <IconButton icon={<Plus />} label="New view" onClick={handleNewView} />
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Filter plans..."
            // value={filterText}
            // onChange={(e) => setFilterText(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 transition-colors text-sm"
          />
          <Funnel size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div className="bg-gray-100 border-blue-200 flex items-start mb-6 px-4 py-3 relative rounded-md text-sm" role="alert">
        <BadgeAlert className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-blue-600" />
        <p>
          Analytics views let you create filtered views of simple Boards data for Power BI reporting.
          For help on reporting in Power BI <a href="https://docs.microsoft.com/en-us/azure/devops/report/powerbi/overview?view=azure-devops" target="_blank" rel="noopener noreferrer" className="font-semibold underline hover:text-blue-800">click here</a>.
        </p>
      </div>

      <div>
        {activeTab === 'All' && (
          <>
            {renderTableSection("My Views", myViews, 'myViews')}
            {renderTableSection("Shared Views", sharedViews, 'sharedViews')}
          </>
        )}
        {activeTab === 'Favorites' && (
          <>
            {(() => {
              const favMyViewsContent = renderTableSection("My Views", myViews, 'favoritesMyViews', true);
              const favSharedViewsContent = renderTableSection("Shared Views", sharedViews, 'favoritesSharedViews', true);

              if (!favMyViewsContent && !favSharedViewsContent) {
                return <p className="text-gray-500 mt-6 text-center py-8">No favorite views yet. Star a view from the <i>All tab</i>  to see it here.</p>;
              }
              return (
                <>
                  {favMyViewsContent}
                  {favSharedViewsContent}
                </>
              );
            })()}
          </>
        )}
      </div>
      <NewViewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default AnalyticsViews;
