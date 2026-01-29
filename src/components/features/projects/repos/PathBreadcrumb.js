"use client";

import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

const PathBreadcrumb = ({ currentPath, onNavigate, repositoryName }) => {
  const pathSegments = currentPath ? currentPath.split('/').filter(Boolean) : [];
  
  const handleNavigate = (index) => {
    if (index === -1) {
      onNavigate(''); // Root
    } else {
      const newPath = pathSegments.slice(0, index + 1).join('/');
      onNavigate(newPath);
    }
  };

  return (
    <nav className="flex items-center space-x-1 text-sm">
      <button
        onClick={() => handleNavigate(-1)}
        className="flex items-center px-2 py-1 hover:bg-gray-100 rounded transition-colors"
      >
        <Home className="w-4 h-4 mr-1" />
        <span className="font-medium">{repositoryName || 'Repository'}</span>
      </button>
      
      {pathSegments.map((segment, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <button
            onClick={() => handleNavigate(index)}
            className={`px-2 py-1 hover:bg-gray-100 rounded transition-colors ${
              index === pathSegments.length - 1 
                ? 'text-gray-900 font-medium' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {segment}
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
};

export default PathBreadcrumb;
