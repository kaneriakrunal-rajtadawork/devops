"use client";

import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useGetRepoFiles } from '@/api-client';
import { 
  Folder, 
  File, 
  FileText, 
  FileCode, 
  FileImage, 
  FileVideo, 
  Archive, 
  ChevronRight, 
  ChevronDown,
  GitBranch,
  Download,
  History,
  MoreHorizontal,
  Home,
  Search
} from 'lucide-react';
import { CircularProgress } from '@mui/material';
import PathBreadcrumb from './PathBreadcrumb';

const FileIcon = ({ fileName, isFolder, isExpanded }) => {
  if (isFolder) {
    return isExpanded ? (
      <Folder className="w-4 h-4 text-blue-600 fill-blue-100" />
    ) : (
      <Folder className="w-4 h-4 text-blue-600" />
    );
  }

  const extension = fileName.split('.').pop()?.toLowerCase();
  
  if (!extension) return <File className="w-4 h-4 text-gray-600" />;
  
  // Code files
  if (['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'cs', 'php', 'rb', 'go', 'rs', 'html', 'css', 'scss', 'sass', 'json', 'xml', 'yml', 'yaml'].includes(extension)) {
    return <FileCode className="w-4 h-4 text-green-600" />;
  }
  
  // Images
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'].includes(extension)) {
    return <FileImage className="w-4 h-4 text-purple-600" />;
  }
  
  // Videos
  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(extension)) {
    return <FileVideo className="w-4 h-4 text-red-600" />;
  }
  
  // Archives
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
    return <Archive className="w-4 h-4 text-orange-600" />;
  }
  
  // Text files
  if (['txt', 'md', 'readme'].includes(extension)) {
    return <FileText className="w-4 h-4 text-blue-600" />;
  }
  
  return <File className="w-4 h-4 text-gray-600" />;
};

const FileTreeItem = ({ item, depth = 0, onItemClick, expandedFolders, onToggleExpand, currentPath }) => {
  const isFolder = item.type === 'dir' || item.type === 'tree';
  const fullPath = currentPath ? `${currentPath}/${item.name}` : item.name;
  const isExpanded = expandedFolders.has(fullPath);
  
  const handleClick = () => {
    if (isFolder) {
      onToggleExpand(fullPath);
    } else {
      onItemClick(item);
    }
  };

  const handleToggleClick = (e) => {
    e.stopPropagation();
    onToggleExpand(fullPath);
  };

  return (
    <div>
      <div 
        className={`flex items-center px-2 py-1.5 hover:bg-gray-50 cursor-pointer group border-l-2 border-transparent hover:border-blue-200`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={handleClick}
      >
        {isFolder && (
          <button
            onClick={handleToggleClick}
            className="flex items-center justify-center w-4 h-4 mr-1 hover:bg-gray-200 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </button>
        )}
        {!isFolder && <div className="w-5" />}
        
        <FileIcon fileName={item.name} isFolder={isFolder} isExpanded={isExpanded} />
        
        <span className="ml-2 text-sm truncate flex-1">{item.name}</span>
        
        <div className="opacity-0 group-hover:opacity-100 flex items-center ml-2">
          <button className="p-1 hover:bg-gray-200 rounded">
            <MoreHorizontal className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

const FileListItem = ({ item, onItemClick, currentPath }) => {
  const isFolder = item.type === 'dir' || item.type === 'tree';
  
  return (
    <div 
      className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 group"
      onClick={() => onItemClick(item)}
    >
      <FileIcon fileName={item.name} isFolder={isFolder} />
      <span className="ml-3 text-sm flex-1 font-medium">{item.name}</span>
      <span className="text-xs text-gray-500 mr-6 min-w-[120px]">
        {item.lastModified ? new Date(item.lastModified).toLocaleDateString() : '-'}
      </span>
      <span className="text-xs text-gray-500 w-20 text-right">
        {!isFolder && item.size ? `${(item.size / 1024).toFixed(1)} KB` : '-'}
      </span>
      <div className="opacity-0 group-hover:opacity-100 ml-4">
        <button className="p-1 hover:bg-gray-200 rounded">
          <MoreHorizontal className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

const FileExplorer = () => {
  const { selectedRepo, selectedBranch } = useSelector((state) => state.repo);
  const [viewMode, setViewMode] = useState('tree'); // 'tree' or 'list'
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentPath, setCurrentPath] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: repoFiles, isLoading, error } = useGetRepoFiles(
    selectedRepo?.id, 
    { branchName: selectedBranch, path: currentPath },
    {
      query: {
        enabled: !!selectedRepo?.id && !!selectedBranch,
        queryKey: ['repo-files', selectedRepo?.id, selectedBranch, currentPath],
      },
    }
  );

  const files = repoFiles?.data?.data || [];

  const filteredFiles = useMemo(() => {
    if (!searchQuery) return files;
    return files.filter(file => 
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [files, searchQuery]);

  const organizedFiles = useMemo(() => {
    if (!filteredFiles.length) return { folders: [], files: [] };
    
    const folders = filteredFiles.filter(item => item.type === 'dir' || item.type === 'tree');
    const regularFiles = filteredFiles.filter(item => item.type === 'blob' || item.type === 'file');
    
    return {
      folders: folders.sort((a, b) => a.name.localeCompare(b.name)),
      files: regularFiles.sort((a, b) => a.name.localeCompare(b.name))
    };
  }, [filteredFiles]);

  const treeData = useMemo(() => {
    return [...organizedFiles.folders, ...organizedFiles.files];
  }, [organizedFiles]);

  const handleToggleExpand = (path) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
      // Navigate to the folder when expanding in tree view
      if (viewMode === 'tree') {
        setCurrentPath(path);
      }
    }
    setExpandedFolders(newExpanded);
  };

  const handleItemClick = (item) => {
    const isFolder = item.type === 'dir' || item.type === 'tree';
    
    if (isFolder) {
      const newPath = currentPath ? `${currentPath}/${item.name}` : item.name;
      setCurrentPath(newPath);
      setExpandedFolders(prev => new Set([...prev, newPath]));
    } else {
      setSelectedFile(item);
      // Trigger file viewer or content display
    }
  };

  const handlePathNavigate = (newPath) => {
    setCurrentPath(newPath);
    setSearchQuery(''); // Clear search when navigating
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <CircularProgress size={32} />
          <p className="mt-2 text-sm text-gray-600">Loading files...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading files</p>
          <p className="text-sm text-gray-500">{error.message || 'Unknown error occurred'}</p>
        </div>
      </div>
    );
  }

  if (!selectedRepo || !selectedBranch) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Select a repository and branch to view files</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center space-x-4 flex-1">
          <div className="flex items-center space-x-2">
            <GitBranch className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium">{selectedBranch}</span>
          </div>
          
          <PathBreadcrumb 
            currentPath={currentPath}
            onNavigate={handlePathNavigate}
            repositoryName={selectedRepo?.name}
          />
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex rounded border overflow-hidden">
            <button
              onClick={() => setViewMode('tree')}
              className={`px-3 py-1.5 text-xs font-medium ${
                viewMode === 'tree' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white hover:bg-gray-50'
              }`}
            >
              Tree
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-xs font-medium ${
                viewMode === 'list' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white hover:bg-gray-50'
              }`}
            >
              List
            </button>
          </div>
          
          <div className="flex space-x-1">
            <button className="p-2 hover:bg-gray-200 rounded" title="Download">
              <Download className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-gray-200 rounded" title="History">
              <History className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-auto">
        {filteredFiles.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <File className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                {searchQuery ? 'No files match your search' : 'No files found in this directory'}
              </p>
            </div>
          </div>
        ) : viewMode === 'tree' ? (
          <div className="py-2">
            {treeData.map((item) => (
              <FileTreeItem
                key={item.sha || item.name}
                item={item}
                onItemClick={handleItemClick}
                expandedFolders={expandedFolders}
                onToggleExpand={handleToggleExpand}
                currentPath={currentPath}
              />
            ))}
          </div>
        ) : (
          <div>
            {/* List view header */}
            <div className="flex items-center px-4 py-3 bg-gray-50 border-b text-xs font-semibold text-gray-600 uppercase tracking-wide">
              <span className="flex-1">Name</span>
              <span className="mr-6 min-w-[120px]">Last modified</span>
              <span className="w-20 text-right">Size</span>
              <span className="w-8"></span>
            </div>
            
            {/* Folders first, then files */}
            {organizedFiles.folders.map((item) => (
              <FileListItem
                key={item.sha || item.name}
                item={item}
                onItemClick={handleItemClick}
                currentPath={currentPath}
              />
            ))}
            {organizedFiles.files.map((item) => (
              <FileListItem
                key={item.sha || item.name}
                item={item}
                onItemClick={handleItemClick}
                currentPath={currentPath}
              />
            ))}
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="px-4 py-2 bg-gray-50 border-t text-xs text-gray-500 flex items-center justify-between">
        <span>
          {organizedFiles.folders.length} folder{organizedFiles.folders.length !== 1 ? 's' : ''}, {' '}
          {organizedFiles.files.length} file{organizedFiles.files.length !== 1 ? 's' : ''}
        </span>
        {searchQuery && (
          <span>Filtered by: "{searchQuery}"</span>
        )}
      </div>
    </div>
  );
};

export default FileExplorer;
