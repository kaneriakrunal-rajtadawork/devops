'use client';

import React, { useState } from 'react';
import { Plus, FolderClosed, Upload, Search, X, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

const Queries = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [filterText, setFilterText] = useState('');

  const allQueries = [
    {
      id: 1,
      title: 'My Queries',
      type: 'folder',
      lastModified: {
        user: 'subbaramireddy kummithi',
        initials: 'SK',
        date: '5/3/2025'
      }
    },
    {
      id: 2,
      title: 'Shared Queries',
      type: 'folder',
      lastModified: {
        user: 'subbaramireddy kummithi',
        initials: 'SK',
        date: '5/3/2025'
      }
    }
  ];

  const favoriteQueries = [
    {
      id: 3,
      title: 'Active Bugs',
      type: 'query',
      lastModified: {
        user: 'subbaramireddy kummithi',
        initials: 'SK',
        date: '5/3/2025'
      }
    }
  ];

  const queries = activeTab === 'all' ? allQueries : favoriteQueries;

  return (
    <div className="flex flex-col h-full bg-gray-100 px-6 py-4">
      <div className="max-w-[1400px] mx-auto w-full h-full flex flex-col">
        {/* Header Section */}
        <div className="flex items-center justify-between flex-none">
          <h1 className="text-xl font-semibold">Queries</h1>
          <div className="flex items-center space-x-2">
            <button className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-sm">
              <Plus size={16} className="mr-1.5" /> New query
            </button>
            {activeTab === 'all' && (
              <button className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-sm">
                <FolderClosed size={16} className="mr-1.5" /> New folder
              </button>
            )}
            <button className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-sm">
              <Upload size={16} className="mr-1.5" /> Import work items
            </button>
          </div>
        </div>

        {/* Navigation and Filter Section */}
        <div className="mt-6 flex-none">
          {/* Tabs Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'favorites'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                onClick={() => setActiveTab('favorites')}
              >
                Favorites
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'all'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                onClick={() => setActiveTab('all')}
              >
                All
              </button>
            </div>

            {/* Filter Section */}
            <div className="mb-2 relative w-64">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter by keywords"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="w-full pl-10 pr-10 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                />
                {filterText && (
                  <button
                    onClick={() => setFilterText('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Queries List */}
        <div className="mt-4 flex-1 bg-white shadow-sm rounded-sm overflow-auto">
          {/* Table Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200 sticky top-0">
            <div className="flex items-center flex-1">
              <div className="w-[24px] mr-3"></div>
              <span className="text-xs font-medium text-gray-600 cursor-pointer hover:text-gray-900">Title</span>
            </div>
            <div className="flex items-center min-w-[300px]">
              <span className="text-xs font-medium text-gray-600 cursor-pointer hover:text-gray-900">Last modified by</span>
            </div>
          </div>

          {/* Table Content */}
          {queries.map((query, index) => (
            <div
              key={query.id}
              className={`flex items-center justify-between px-4 py-2 hover:bg-gray-50 group ${
                index !== queries.length - 1 ? 'border-b border-gray-200' : ''
              }`}
            >
              <div className="flex items-center flex-1">
                <FolderClosed size={16} className="text-gray-400 mr-3 flex-shrink-0" />
                <span className="text-sm text-blue-600 hover:underline cursor-pointer truncate">
                  {query.title}
                </span>
              </div>
              <div className="flex items-center min-w-[300px] justify-between">
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-purple-700 flex items-center justify-center text-white text-xs mr-2">
                    {query.lastModified.initials}
                  </div>
                  <span className="text-sm text-gray-600">{query.lastModified.user}</span>
                  <span className="text-sm text-gray-400 ml-2">updated {query.lastModified.date}</span>
                </div>
                <button className="p-1 rounded hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal size={16} className="text-gray-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Queries; 