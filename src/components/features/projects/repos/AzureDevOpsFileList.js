"use client";

import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
  Download,
  Share,
  Star,
  Copy,
  MoreHorizontal,
  FolderOpen,
  Eye,
  Clock,
  User,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { CircularProgress } from '@mui/material';

const getFileIcon = (fileName, isFolder, isExpanded = false) => {
  if (isFolder) {
    return isExpanded ? 
      <FolderOpen className="w-4 h-4 text-blue-600" /> : 
      <Folder className="w-4 h-4 text-blue-600" />;
  }

  const extension = fileName.split('.').pop()?.toLowerCase();
  const iconClass = "w-4 h-4";
  
  const iconMap = {
    // Code files - Green
    js: <FileCode className={`${iconClass} text-yellow-600`} />,
    jsx: <FileCode className={`${iconClass} text-blue-500`} />,
    ts: <FileCode className={`${iconClass} text-blue-600`} />,
    tsx: <FileCode className={`${iconClass} text-blue-600`} />,
    py: <FileCode className={`${iconClass} text-green-600`} />,
    java: <FileCode className={`${iconClass} text-red-600`} />,
    cpp: <FileCode className={`${iconClass} text-blue-700`} />,
    c: <FileCode className={`${iconClass} text-blue-700`} />,
    cs: <FileCode className={`${iconClass} text-purple-600`} />,
    php: <FileCode className={`${iconClass} text-indigo-600`} />,
    rb: <FileCode className={`${iconClass} text-red-500`} />,
    go: <FileCode className={`${iconClass} text-cyan-600`} />,
    rs: <FileCode className={`${iconClass} text-orange-600`} />,
    html: <FileCode className={`${iconClass} text-orange-500`} />,
    css: <FileCode className={`${iconClass} text-blue-500`} />,
    scss: <FileCode className={`${iconClass} text-pink-500`} />,
    sass: <FileCode className={`${iconClass} text-pink-500`} />,
    
    // Images - Purple
    png: <FileImage className={`${iconClass} text-purple-600`} />,
    jpg: <FileImage className={`${iconClass} text-purple-600`} />,
    jpeg: <FileImage className={`${iconClass} text-purple-600`} />,
    gif: <FileImage className={`${iconClass} text-purple-600`} />,
    svg: <FileImage className={`${iconClass} text-purple-600`} />,
    webp: <FileImage className={`${iconClass} text-purple-600`} />,
    ico: <FileImage className={`${iconClass} text-purple-600`} />,
    
    // Videos - Red
    mp4: <FileVideo className={`${iconClass} text-red-600`} />,
    avi: <FileVideo className={`${iconClass} text-red-600`} />,
    mov: <FileVideo className={`${iconClass} text-red-600`} />,
    wmv: <FileVideo className={`${iconClass} text-red-600`} />,
    
    // Archives - Orange
    zip: <Archive className={`${iconClass} text-orange-600`} />,
    rar: <Archive className={`${iconClass} text-orange-600`} />,
    '7z': <Archive className={`${iconClass} text-orange-600`} />,
    tar: <Archive className={`${iconClass} text-orange-600`} />,
    gz: <Archive className={`${iconClass} text-orange-600`} />,
    
    // Text files - Blue
    txt: <FileText className={`${iconClass} text-blue-600`} />,
    md: <FileText className={`${iconClass} text-blue-600`} />,
    readme: <FileText className={`${iconClass} text-blue-600`} />,
    json: <FileText className={`${iconClass} text-yellow-600`} />,
    xml: <FileText className={`${iconClass} text-green-600`} />,
    yml: <FileText className={`${iconClass} text-red-600`} />,
    yaml: <FileText className={`${iconClass} text-red-600`} />,
  };
  
  return iconMap[extension] || <File className={`${iconClass} text-gray-600`} />;
};

// Custom hook to manage multiple folder API calls
const useFolderContents = (selectedRepo, selectedBranch, expandedFolders) => {
  const [folderData, setFolderData] = useState(new Map());
  const [loadingFolders, setLoadingFolders] = useState(new Set());
  const {token} = useSelector(state => state.auth);

  const fetchFolderContents = useCallback(async (folderPath) => {
    if (folderData.has(folderPath) || loadingFolders.has(folderPath)) {
      return;
    }

    setLoadingFolders(prev => new Set(prev).add(folderPath));

    try {
      const response = await fetch(`/api/repos/${selectedRepo?.id}/files?branchName=${selectedBranch}&path=${folderPath}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`Fetched contents for ${folderPath}:`, data);
        const contents = data?.data || [];

        setFolderData(prev => new Map(prev).set(folderPath, contents));
      }
    } catch (error) {
      console.error(`Error fetching contents for ${folderPath}:`, error);
    } finally {
      setLoadingFolders(prev => {
        const newSet = new Set(prev);
        newSet.delete(folderPath);
        return newSet;
      });
    }
  }, [selectedRepo?.id, selectedBranch, folderData, loadingFolders]);

  // Fetch contents for newly expanded folders
  useEffect(() => {
    Array.from(expandedFolders).forEach(folderPath => {
      if (!folderData.has(folderPath) && !loadingFolders.has(folderPath)) {
        fetchFolderContents(folderPath);
      }
    });
  }, [expandedFolders, fetchFolderContents, folderData, loadingFolders]);

  return { folderData, loadingFolders, fetchFolderContents };
};

const FileRow = ({ 
  item, 
  isSelected, 
  onSelect, 
  onToggleExpand, 
  isExpanded, 
  depth = 0,
  viewMode = 'list',
  onItemClick,
  isLoading = false
}) => {
  const isFolder = item.type === 'dir' || item.type === 'tree';
  const [isHovered, setIsHovered] = useState(false);

  const handleRowClick = useCallback((e) => {
    if (e.detail === 2) { // Double click
      onItemClick(item);
    } else { // Single click
      onSelect(item);
    }
  }, [item, onSelect, onItemClick]);

  const handleExpandClick = useCallback((e) => {
    e.stopPropagation();
    onToggleExpand(item);
  }, [item, onToggleExpand]);

  const paddingLeft = viewMode === 'tree' ? `${depth * 20 + 12}px` : '12px';

  return (
    <div
      className={`flex items-center h-8 hover:bg-blue-50 cursor-pointer border-l-2 transition-colors ${
        isSelected ? 'bg-blue-100 border-blue-500' : 'border-transparent'
      }`}
      style={{ paddingLeft }}
      onClick={handleRowClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Expand/Collapse for folders */}
      {isFolder ? (
        <button
          onClick={handleExpandClick}
          className="flex items-center justify-center w-4 h-4 mr-2 hover:bg-gray-200 rounded"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : isExpanded ? (
            <ChevronDown className="w-3 h-3" />
          ) : (
            <ChevronRight className="w-3 h-3" />
          )}
        </button>
      ) : (
        <div className="w-4 mr-2" />
      )}

      {/* File/Folder Icon */}
      <div className="mr-2">
        {getFileIcon(item.name, isFolder, isExpanded)}
      </div>

      {/* File/Folder Name */}
      <span className="text-sm flex-1 truncate font-medium">
        {item.name}
      </span>

      {/* Action buttons (visible on hover) */}
      {isHovered && (
        <div className="flex items-center space-x-1 ml-2">
          <button className="p-1 hover:bg-gray-200 rounded" title="More actions">
            <MoreHorizontal className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};

const FileTable = ({ 
  files, 
  selectedItems, 
  onSelect, 
  onToggleExpand, 
  expandedFolders, 
  onItemClick,
  folderData,
  loadingFolders,
  currentPath = ''
}) => {
  const renderFileRows = useCallback((items, depth = 0, parentPath = '') => {
    return items.map((item) => {
      const isFolder = item.type === 'dir' || item.type === 'tree';
      const itemPath = parentPath ? `${parentPath}/${item.name}` : item.name;
      const fullPath = currentPath ? `${currentPath}/${itemPath}` : itemPath;
      
      const isExpanded = expandedFolders.has(fullPath);
      const isSelected = selectedItems.has(fullPath);
      const isLoadingFolder = loadingFolders.has(fullPath);
      
      // Get children from folder data
      let children = null;
      if (isFolder && isExpanded && folderData.has(fullPath)) {
        const folderContents = folderData.get(fullPath);
        if (folderContents && folderContents.length > 0) {
          // Sort: folders first, then files
          const sortedContents = [...folderContents].sort((a, b) => {
            const aIsFolder = a.type === 'dir' || a.type === 'tree';
            const bIsFolder = b.type === 'dir' || b.type === 'tree';
            
            if (aIsFolder && !bIsFolder) return -1;
            if (!aIsFolder && bIsFolder) return 1;
            return a.name.localeCompare(b.name);
          });
          
          children = renderFileRows(sortedContents, depth + 1, itemPath);
        }
      }

      return (
        <React.Fragment key={fullPath}>
          <FileRow
            item={{ ...item, path: fullPath }}
            isSelected={isSelected}
            onSelect={onSelect}
            onToggleExpand={onToggleExpand}
            isExpanded={isExpanded}
            depth={depth}
            viewMode="tree"
            onItemClick={onItemClick}
            isLoading={isLoadingFolder}
          />
          {children}
        </React.Fragment>
      );
    });
  }, [selectedItems, expandedFolders, onSelect, onToggleExpand, onItemClick, folderData, loadingFolders, currentPath]);

  return (
    <div className="flex-1 overflow-auto">
      {renderFileRows(files)}
    </div>
  );
};

const AzureDevOpsFileList = () => {
  const { selectedRepo, selectedBranch } = useSelector((state) => state.repo);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [viewMode, setViewMode] = useState('tree');
  const [currentPath, setCurrentPath] = useState('');

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

  const { folderData, loadingFolders } = useFolderContents(selectedRepo, selectedBranch, expandedFolders);

  const files = repoFiles?.data?.data || [];

  // Organize files: folders first, then files
  const organizedFiles = useMemo(() => {
    if (!files.length) return [];
    
    const folders = files
      .filter(item => item.type === 'dir' || item.type === 'tree')
      .sort((a, b) => a.name.localeCompare(b.name));
    
    const regularFiles = files
      .filter(item => item.type === 'blob' || item.type === 'file')
      .sort((a, b) => a.name.localeCompare(b.name));
    
    return [...folders, ...regularFiles];
  }, [files]);

  const handleSelect = useCallback((item) => {
    const itemKey = item.path || item.name;
    setSelectedItems(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(itemKey)) {
        newSelection.delete(itemKey);
      } else {
        newSelection.clear(); // Single selection
        newSelection.add(itemKey);
      }
      return newSelection;
    });
  }, []);

  const handleToggleExpand = useCallback((item) => {
    const isFolder = item.type === 'dir' || item.type === 'tree';
    const itemPath = item.path || (currentPath ? `${currentPath}/${item.name}` : item.name);

    console.log("Toggling expand for item:", itemPath);
    
    setExpandedFolders(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(itemPath)) {
        newExpanded.delete(itemPath);
      } else {
        newExpanded.add(itemPath);
      }
      return newExpanded;
    });
  }, [currentPath]);

  useEffect(() => {
    console.log("CurrentPath", currentPath);
  }, [currentPath]);

  const handleItemClick = useCallback((item) => {
    const isFolder = item.type === 'dir' || item.type === 'tree';
    
    if (isFolder) {
      // Navigate into folder
      const newPath = currentPath ? `${currentPath}/${item.name}` : item.name;
      setCurrentPath(newPath);
    } else {
      // Open file viewer or trigger file action
      console.log('Opening file:', item);
    }
  }, [currentPath]);

  // Clear expanded folders when changing directories
  useEffect(() => {
    setExpandedFolders(new Set());
  }, [currentPath]);

  if (!selectedRepo || !selectedBranch) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Select a repository and branch to view files
      </div>
    );
  }

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

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-gray-50">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">
            {organizedFiles.length} item{organizedFiles.length !== 1 ? 's' : ''}
          </span>
          
          {currentPath && (
            <nav className="flex items-center space-x-1 text-sm text-gray-600">
              <button 
                onClick={() => setCurrentPath('')}
                className="hover:text-blue-600"
              >
                {selectedRepo?.name || 'Repository'}
              </button>
              {currentPath.split('/').map((segment, index, array) => (
                <React.Fragment key={index}>
                  <ChevronRight className="w-3 h-3" />
                  <button 
                    onClick={() => {
                      const newPath = array.slice(0, index + 1).join('/');
                      setCurrentPath(newPath);
                    }}
                    className={`hover:text-blue-600 ${index === array.length - 1 ? 'font-medium' : ''}`}
                  >
                    {segment}
                  </button>
                </React.Fragment>
              ))}
            </nav>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Action buttons */}
          <button className="p-1.5 hover:bg-gray-200 rounded text-gray-600" title="Download">
            <Download className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:bg-gray-200 rounded text-gray-600" title="Share">
            <Share className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:bg-gray-200 rounded text-gray-600" title="Favorite">
            <Star className="w-4 h-4" />
          </button>
        </div>
      </div>

          {console.log(organizedFiles, "organized files")}
      {/* File List */}
      {organizedFiles.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Folder className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">This folder is empty</p>
          </div>
        </div>
      ) : (
        <FileTable
          files={organizedFiles}
          selectedItems={selectedItems}
          onSelect={handleSelect}
          onToggleExpand={handleToggleExpand}
          expandedFolders={expandedFolders}
          onItemClick={handleItemClick}
          folderData={folderData}
          loadingFolders={loadingFolders}
          currentPath={currentPath}
        />
      )}

      {/* Status bar */}
      <div className="px-3 py-1 bg-gray-50 border-t text-xs text-gray-600 flex items-center justify-between">
        <span>
          {selectedItems.size > 0 && `${selectedItems.size} selected • `}
          Branch: {selectedBranch}
        </span>
        <span>Azure DevOps Style File Explorer</span>
      </div>
    </div>
  );
};

export default AzureDevOpsFileList;
