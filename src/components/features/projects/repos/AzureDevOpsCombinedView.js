"use client";

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useGetRepoFiles } from '@/api-client';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReadmeViewer from '@/components/reusables/ReadmeViewer';
import { 
  Folder, 
  FolderOpen, 
  File, 
  FileText, 
  FileCode, 
  FileImage, 
  FileVideo, 
  Archive,
  ChevronRight, 
  ChevronDown, 
  Loader2,
  MoreHorizontal,
  Download,
  Share,
  Star,
  Search,
  Filter,
  ArrowUpDown,
  Home,
  Eye,
  Copy
} from 'lucide-react';
import { useGetRepoReadme } from '@/api-client';

// Reuse the same icon logic from AzureDevOpsFileList
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

// Get language from filename for syntax highlighting
const getLanguageFromFilename = (filename) => {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  const languageMap = {
    js: 'javascript',
    jsx: 'jsx',
    ts: 'typescript',
    tsx: 'tsx',
    py: 'python',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    cs: 'csharp',
    php: 'php',
    rb: 'ruby',
    go: 'go',
    rs: 'rust',
    html: 'html',
    css: 'css',
    scss: 'scss',
    sass: 'sass',
    json: 'json',
    xml: 'xml',
    yml: 'yaml',
    yaml: 'yaml',
    md: 'markdown',
    sql: 'sql',
    sh: 'bash',
    bash: 'bash',
    dockerfile: 'dockerfile',
    makefile: 'makefile'
  };
  
  return languageMap[extension] || 'text';
};

// Azure DevOps-style File Content Viewer
const AzureDevOpsFileViewer = ({ 
  selectedFile, 
  selectedPath, 
  selectedRepo, 
  selectedBranch,
  onNavigateToPath 
}) => {
  const [viewMode, setViewMode] = useState('content');
  
  // Fetch file content using the same API
  const { data: fileContentResponse, isLoading: isLoadingContent, error: contentError } = useGetRepoFiles(
    selectedRepo?.id, 
    { branchName: selectedBranch, path: selectedPath },
    {
      query: {
        enabled: !!selectedFile && !!selectedRepo?.id && !!selectedBranch && !!selectedPath,
        queryKey: ['repo-file-content', selectedRepo?.id, selectedBranch, selectedPath],
      },
    }
  );

  const fileContent = fileContentResponse?.data?.data;

  // // Decode file content if it's base64 encoded
  // const fileContent = useMemo(() => {
  //   if (!fileContentResponse?.data?.data) return null;
    
  //   try {
  //     // Try to decode base64 content
  //     const decodedContent = atob(fileContentResponse.data.data.content);
  //     return decodedContent;
  //   } catch (error) {
  //     // If not base64, return as is
  //     return fileContentResponse.data.data.content || fileContentResponse.data.data;
  //   }
  // }, [fileContentResponse]);

  const isTextFile = (filename) => {
    const textExtensions = ['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'cs', 'php', 'rb', 'go', 'rs', 'html', 'css', 'scss', 'json', 'xml', 'yml', 'yaml', 'md', 'txt', 'log', 'sh', 'bash'];
    const extension = filename.split('.').pop()?.toLowerCase();
    return textExtensions.includes(extension);
  };

  const isImageFile = (filename) => {
    const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'];
    const extension = filename.split('.').pop()?.toLowerCase();
    return imageExtensions.includes(extension);
  };

  const handleCopyContent = () => {
    if (fileContent) {
      navigator.clipboard.writeText(fileContent);
      // Could add a toast notification here
    }
  };

  const handleDownload = () => {
    if (fileContent && selectedFile) {
      const blob = new Blob([fileContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = selectedFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (!selectedFile) return null;

  // Extract folder path from the selected file path for breadcrumbs
  const folderPath = selectedPath.substring(0, selectedPath.lastIndexOf('/')) || '';

  return (
    <div className="bg-white flex flex-col h-full">
      {/* Breadcrumb Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">File Explorer</span>
          
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center space-x-1 text-sm text-gray-600 ml-4">
            <button 
              onClick={() => onNavigateToPath('')}
              className="hover:text-blue-600 p-1 rounded hover:bg-blue-50 flex items-center"
              title="Repository Root"
            >
              <Home className="w-4 h-4" />
            </button>
            
            {/* Show folder path */}
            {folderPath && folderPath.split('/').map((segment, index, array) => (
              <React.Fragment key={`folder-${index}`}>
                <ChevronRight className="w-3 h-3" />
                <button 
                  onClick={() => {
                    const pathToSegment = array.slice(0, index + 1).join('/');
                    onNavigateToPath(pathToSegment);
                  }}
                  className="hover:text-blue-600 px-2 py-1 rounded hover:bg-blue-50"
                >
                  {segment}
                </button>
              </React.Fragment>
            ))}
            
            {/* Show the file name (non-clickable, current) */}
            <ChevronRight className="w-3 h-3" />
            <span className="px-2 py-1 font-medium text-blue-600 bg-blue-50 rounded">
              {selectedFile.name}
            </span>
          </nav>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              
              placeholder="Search files..."
              className="pl-9 pr-3 py-1.5 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
          </div>
        </div>
      </div>

      {/* File Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
        <div className="flex items-center space-x-2">
          {getFileIcon(selectedFile.name, false)}
          <h2 className="text-sm font-semibold text-gray-800">{selectedFile.name}</h2>
          <span className="text-xs text-gray-500">
            {selectedFile.size ? `${(selectedFile.size / 1024).toFixed(1)} KB` : ''}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* View Mode Tabs */}
          <div className="flex rounded border overflow-hidden">
            <button
              onClick={() => setViewMode('content')}
              className={`px-3 py-1 text-xs flex items-center space-x-1 ${
                viewMode === 'content' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white hover:bg-gray-50'
              }`}
            >
              <FileCode className="w-3 h-3" />
              <span>Content</span>
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1 text-xs flex items-center space-x-1 ${
                viewMode === 'preview' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white hover:bg-gray-50'
              }`}
              disabled={true}
            >
              <Eye className="w-3 h-3" />
              <span>Preview</span>
            </button>
          </div>
          
          {/* Action Buttons */}
          <button
            onClick={handleCopyContent}
            className="p-1.5 hover:bg-gray-200 rounded text-gray-600"
            title="Copy content"
            disabled={!fileContent}
          >
            <Copy className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleDownload}
            className="p-1.5 hover:bg-gray-200 rounded text-gray-600"
            title="Download file"
            disabled={!fileContent}
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {isLoadingContent ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <p className="mt-2 text-sm text-gray-600">Loading file content...</p>
            </div>
          </div>
        ) : contentError ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600 mb-2">Error loading file content</p>
              <p className="text-sm text-gray-500">{contentError.message || 'Something went wrong'}</p>
            </div>
          </div>
        ) : !fileContent ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No content available</p>
            </div>
          </div>
        ) : isImageFile(selectedFile.name) ? (
          <div className="flex items-center justify-center h-full p-4">
            <img 
              src={`data:image/${selectedFile.name.split('.').pop()};base64,${fileContentResponse?.data?.data?.content}`}
              alt={selectedFile.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        ) : isTextFile(selectedFile.name) ? (
          <SyntaxHighlighter
            language={getLanguageFromFilename(selectedFile.name)}
            style={tomorrow}
            showLineNumbers={true}
            wrapLines={true}
            customStyle={{
              margin: 0,
              borderRadius: 0,
              fontSize: '14px',
              lineHeight: '1.5',
              background: '#ffffff'
            }}
          >
            {fileContent}
          </SyntaxHighlighter>
        ) : (
          <pre className="p-4 text-sm whitespace-pre-wrap font-mono bg-gray-50 text-gray-800">
            {fileContent}
          </pre>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-50 border-t text-xs text-gray-500 flex items-center justify-between">
        <span>
          {selectedFile.name} • {selectedPath}
        </span>
        <span>Azure DevOps File Viewer</span>
      </div>
    </div>
  );
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
      // This would be replaced with actual API call
      const response = await fetch(`/api/repos/${selectedRepo.id}/files?branchName=${selectedBranch}&path=${folderPath}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFolderData(prev => new Map(prev).set(folderPath, data.data || []));
      }
    } catch (error) {
      console.error('Error fetching folder contents:', error);
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

// Tree sidebar component
const FileTreeSidebar = ({ 
  files, 
  onItemClick, 
  expandedFolders, 
  onToggleExpand, 
  folderData, 
  loadingFolders, 
  currentPath,
  selectedPath 
}) => {
  const renderTreeItems = useCallback((items, depth = 0, parentPath = '') => {
    return items.map((item) => {
      const isFolder = item.type === 'dir' || item.type === 'tree';
      const itemPath = parentPath ? `${parentPath}/${item.name}` : item.name;
      const isExpanded = expandedFolders.has(itemPath);
      const isSelected = selectedPath === itemPath;
      const isLoading = loadingFolders.has(itemPath);

      return (
        <div key={item.sha || item.name}>
          <div
            className={`flex items-center h-8 hover:bg-blue-50 cursor-pointer border-l-2 transition-colors ${
              isSelected ? 'bg-blue-100 border-blue-500' : 'border-transparent'
            }`}
            style={{ paddingLeft: `${depth * 16 + 12}px` }}
            onClick={() => onItemClick(item, itemPath)}
          >
            {/* Expand/Collapse for folders */}
            {isFolder ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpand(itemPath);
                }}
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
          </div>

          {/* Render children if folder is expanded */}
          {isFolder && isExpanded && folderData.has(itemPath) && (
            <div>
              {renderTreeItems(folderData.get(itemPath) || [], depth + 1, itemPath)}
            </div>
          )}
        </div>
      );
    });
  }, [expandedFolders, onToggleExpand, onItemClick, folderData, loadingFolders, selectedPath]);

  return (
    <div className="h-full overflow-auto bg-gray-50 border-r">
      <div className="p-3 border-b bg-white">
        <h3 className="text-sm font-semibold text-gray-700">Files</h3>
      </div>
      <div className="py-2">
        {renderTreeItems(files)}
      </div>
    </div>
  );
};

// List view component for the right side
const FileListView = ({ 
  files, 
  selectedItems, 
  onSelect, 
  onItemClick, 
  currentPath,
  onNavigateToPath,
  readmeData,
  isLoadingReadme,
  selectedFile,
  viewMode 
}) => {
  const [sortBy, setSortBy] = useState('name'); // 'name', 'modified', 'size'
  const [sortOrder, setSortOrder] = useState('asc');

  const sortedFiles = useMemo(() => {
    const sorted = [...files].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'modified':
          aValue = new Date(a.lastModified || 0);
          bValue = new Date(b.lastModified || 0);
          break;
        case 'size':
          aValue = a.size || 0;
          bValue = b.size || 0;
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Always put folders first
    const folders = sorted.filter(item => item.type === 'dir' || item.type === 'tree');
    const regularFiles = sorted.filter(item => item.type === 'blob' || item.type === 'file');
    
    return [...folders, ...regularFiles];
  }, [files, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with controls */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">
            {files.length} item{files.length !== 1 ? 's' : ''}
          </span>
          
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center space-x-1 text-sm text-gray-600">
            <button 
              onClick={() => onNavigateToPath('')}
              className="hover:text-blue-600 p-1 rounded hover:bg-blue-50 flex items-center"
              title="Repository Root"
            >
              <Home className="w-4 h-4" />
            </button>
            
            {/* Show folder path */}
            {currentPath && viewMode === 'list' && currentPath.split('/').map((segment, index, array) => (
              <React.Fragment key={index}>
                <ChevronRight className="w-3 h-3" />
                <button 
                  onClick={() => {
                    const pathToSegment = array.slice(0, index + 1).join('/');
                    onNavigateToPath(pathToSegment);
                  }}
                  className={`hover:text-blue-600 px-2 py-1 rounded hover:bg-blue-50 ${index === array.length - 1 ? 'font-medium text-blue-600' : ''}`}
                >
                  {segment}
                </button>
              </React.Fragment>
            ))}
            
            {/* Show file path when viewing a file */}
            {viewMode === 'file' && selectedFile && (
              <>
                {/* Show folder path first */}
                {currentPath && currentPath.split('/').map((segment, index, array) => (
                  <React.Fragment key={`folder-${index}`}>
                    <ChevronRight className="w-3 h-3" />
                    <button 
                      onClick={() => {
                        const pathToSegment = array.slice(0, index + 1).join('/');
                        onNavigateToPath(pathToSegment);
                      }}
                      className="hover:text-blue-600 px-2 py-1 rounded hover:bg-blue-50"
                    >
                      {segment}
                    </button>
                  </React.Fragment>
                ))}
                
                {/* Show the file name (non-clickable, current) */}
                <ChevronRight className="w-3 h-3" />
                <span className="px-2 py-1 font-medium text-blue-600 bg-blue-50 rounded">
                  {selectedFile.name}
                </span>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search files..."
              className="pl-9 pr-3 py-1.5 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
          </div>
          <button className="p-1.5 hover:bg-gray-200 rounded text-gray-600" title="Filter">
            <Filter className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:bg-gray-200 rounded text-gray-600" title="Download">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Column headers */}
      <div className="flex items-center px-4 py-2 bg-gray-50 border-b text-xs font-semibold text-gray-600 uppercase tracking-wide">
        <button 
          onClick={() => handleSort('name')}
          className="flex items-center space-x-1 flex-1 hover:text-gray-900"
        >
          <span>Name</span>
          {sortBy === 'name' && <ArrowUpDown className="w-3 h-3" />}
        </button>
        <button 
          onClick={() => handleSort('modified')}
          className="flex items-center space-x-1 min-w-[140px] hover:text-gray-900"
        >
          <span>Last modified</span>
          {sortBy === 'modified' && <ArrowUpDown className="w-3 h-3" />}
        </button>
        <button 
          onClick={() => handleSort('size')}
          className="flex items-center space-x-1 w-24 text-right hover:text-gray-900"
        >
          <span>Size</span>
          {sortBy === 'size' && <ArrowUpDown className="w-3 h-3" />}
        </button>
        <div className="w-8"></div>
      </div>

      {/* File list */}
      <div className="flex-1 overflow-auto">
        {sortedFiles.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Folder className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">This folder is empty</p>
            </div>
          </div>
        ) : (
          <>
            {sortedFiles.map((item) => {
              const isFolder = item.type === 'dir' || item.type === 'tree';
              const isSelected = selectedItems.has(item.sha || item.name);
              
              return (
                <div
                  key={item.sha || item.name}
                  className={`flex items-center px-4 py-3 hover:bg-blue-50 cursor-pointer border-l-2 transition-colors group ${
                    isSelected ? 'bg-blue-100 border-blue-500' : 'border-transparent'
                  }`}
                  onClick={() => onItemClick(item)}
                >
                  {/* File/Folder Icon */}
                  <div className="mr-3">
                    {getFileIcon(item.name, isFolder)}
                  </div>

                  {/* File/Folder Name */}
                  <span className="text-sm flex-1 truncate font-medium">
                    {item.name}
                  </span>

                  {/* Last Modified */}
                  <span className="text-xs text-gray-500 min-w-[140px] mr-4">
                    {item.lastModified ? new Date(item.lastModified).toLocaleDateString() : '-'}
                  </span>

                  {/* Size */}
                  <span className="text-xs text-gray-500 w-24 text-right mr-4">
                    {!isFolder && item.size ? `${(item.size / 1024).toFixed(1)} KB` : '-'}
                  </span>

                  {/* Action buttons */}
                  <div className="opacity-0 group-hover:opacity-100">
                    <button className="p-1 hover:bg-gray-200 rounded" title="More actions">
                      <MoreHorizontal className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
            
            {/* README Section - only show when on root path */}
            {!currentPath && (
              <div className="border-t bg-gray-50">
                <div className="px-4 py-3">
                  <ReadmeViewer 
                    readmeData={readmeData}
                    isLoadingReadme={isLoadingReadme}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-50 border-t text-xs text-gray-500 flex items-center justify-between">
        <span>
          {selectedItems.size > 0 && `${selectedItems.size} selected • `}
          Showing {sortedFiles.length} items
        </span>
        <span>Azure DevOps Combined View</span>
      </div>
    </div>
  );
};

const AzureDevOpsCombinedView = () => {
  const { selectedRepo, selectedBranch } = useSelector((state) => state.repo);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [currentPath, setCurrentPath] = useState('');
  const [selectedPath, setSelectedPath] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'file'

  // Always fetch root files for the tree (never changes)
  const { data: rootFiles, isLoading: loadingRoot, error: rootError } = useGetRepoFiles(
    selectedRepo?.id, 
    { branchName: selectedBranch, path: '' },
    {
      query: {
        enabled: !!selectedRepo?.id && !!selectedBranch,
        queryKey: ['repo-files-root', selectedRepo?.id, selectedBranch],
      },
    }
  );

  // Fetch files for current path (for right panel)
  const { data: currentFiles, isLoading: loadingCurrent, error: currentError } = useGetRepoFiles(
    selectedRepo?.id, 
    { branchName: selectedBranch, path: currentPath },
    {
      query: {
        enabled: !!selectedRepo?.id && !!selectedBranch,
        queryKey: ['repo-files-current', selectedRepo?.id, selectedBranch, currentPath],
      },
    }
  );

  const {data: readmeDataResponse, isLoading: isLoadingReadme} = useGetRepoReadme(selectedRepo.id, { branchName: selectedBranch }, {
    query: { enabled: !!selectedRepo?.id && !!selectedBranch, queryKey: ['repo-readme', selectedRepo?.id, selectedBranch] },
  });

  // Decode base64 README content
  const readmeData = useMemo(() => {
    if (!readmeDataResponse?.data?.data?.content) return null;
    
    try {
      // Decode base64 content
      const decodedContent = atob(readmeDataResponse.data.data.content);
      return decodedContent;
    } catch (error) {
      console.error('Error decoding README content:', error);
      return null;
    }
  }, [readmeDataResponse]);

  const { folderData, loadingFolders } = useFolderContents(selectedRepo, selectedBranch, expandedFolders);

  const treeFiles = rootFiles?.data?.data || [];
  const listFiles = currentFiles?.data?.data || [];

  // Organize tree files (always from root)
  const organizedTreeFiles = useMemo(() => {
    if (!treeFiles.length) return [];
    
    const folders = treeFiles
      .filter(item => item.type === 'dir' || item.type === 'tree')
      .sort((a, b) => a.name.localeCompare(b.name));
    
    const regularFiles = treeFiles
      .filter(item => item.type === 'blob' || item.type === 'file')
      .sort((a, b) => a.name.localeCompare(b.name));

    return [...folders, ...regularFiles];
  }, [treeFiles]);

  // Organize list files (from current path)
  const organizedListFiles = useMemo(() => {
    if (!listFiles.length) return [];
    
    const folders = listFiles
      .filter(item => item.type === 'dir' || item.type === 'tree')
      .sort((a, b) => a.name.localeCompare(b.name));
    
    const regularFiles = listFiles
      .filter(item => item.type === 'blob' || item.type === 'file')
      .sort((a, b) => a.name.localeCompare(b.name));

    return [...folders, ...regularFiles];
  }, [listFiles]);

  const handleSelect = useCallback((item) => {
    const itemId = item.sha || item.name;
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  const handleToggleExpand = useCallback((folderPath) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderPath)) {
        newSet.delete(folderPath);
      } else {
        newSet.add(folderPath);
      }
      return newSet;
    });
  }, []);

  const handleTreeItemClick = useCallback((item, itemPath) => {
    const isFolder = item.type === 'dir' || item.type === 'tree';
    
    if (isFolder) {
      // When clicking in tree, navigate to that folder in the right panel
      setCurrentPath(itemPath);
      setSelectedPath(itemPath);
      setSelectedFile(null);
      setViewMode('list'); // Show list view for folders
      // Also expand the folder in tree
      setExpandedFolders(prev => new Set(prev).add(itemPath));
    } else {
      // For files, show file viewer
      setSelectedPath(itemPath);
      setSelectedFile(item);
      setViewMode('file'); // Switch to file view
      console.log('Selected file from tree:', item);
    }
  }, []);

  const handleListItemClick = useCallback((item) => {
    const isFolder = item.type === 'dir' || item.type === 'tree';
    
    if (isFolder) {
      // When clicking folder in right panel, navigate deeper
      const newPath = currentPath ? `${currentPath}/${item.name}` : item.name;
      setCurrentPath(newPath);
      setSelectedPath(newPath);
      setSelectedFile(null);
      setViewMode('list'); // Stay in list view for folders
      
      // Auto-expand the folder in tree if it exists at this level
      const folderPathInTree = newPath;
      setExpandedFolders(prev => {
        const newSet = new Set(prev);
        // Expand all parent folders to make this path visible
        const pathParts = folderPathInTree.split('/');
        let buildPath = '';
        pathParts.forEach(part => {
          buildPath = buildPath ? `${buildPath}/${part}` : part;
          newSet.add(buildPath);
        });
        return newSet;
      });
    } else {
      // Handle file click - switch to file viewer
      const filePath = currentPath ? `${currentPath}/${item.name}` : item.name;
      setSelectedPath(filePath);
      setSelectedFile(item);
      setViewMode('file'); // Switch to file view
      console.log('Selected file from list:', item);
    }
  }, [currentPath]);

  // Handler for navigating to a specific path from breadcrumbs
  const handleNavigateToPath = useCallback((newPath) => {
    setCurrentPath(newPath);
    setSelectedPath(newPath);
    setSelectedFile(null);
    setViewMode('list'); // Always show list view when navigating to folders
    
    // Auto-expand folders in tree to show the path
    if (newPath) {
      setExpandedFolders(prev => {
        const newSet = new Set(prev);
        const pathParts = newPath.split('/');
        let buildPath = '';
        pathParts.forEach(part => {
          buildPath = buildPath ? `${buildPath}/${part}` : part;
          newSet.add(buildPath);
        });
        return newSet;
      });
    }
  }, []);

  // Handler for closing file viewer and going back to folder
  const handleCloseFileViewer = useCallback(() => {
    setSelectedFile(null);
    setViewMode('list');
    // Extract folder path from the selected file path
    const folderPath = selectedPath.substring(0, selectedPath.lastIndexOf('/'));
    setCurrentPath(folderPath);
    setSelectedPath(folderPath);
  }, [selectedPath]);

  if (!selectedRepo || !selectedBranch) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Select a repository and branch to view files</p>
        </div>
      </div>
    );
  }

  if (loadingRoot) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="mt-2 text-sm text-gray-600">Loading files...</p>
        </div>
      </div>
    );
  }

  if (rootError) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading files</p>
          <p className="text-sm text-gray-500">{rootError.message || 'Something went wrong'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
     
      {/* Left Sidebar - Tree View */}
      <div className="w-80 flex-shrink-0">
        <FileTreeSidebar
          files={organizedTreeFiles}
          onItemClick={handleTreeItemClick}
          expandedFolders={expandedFolders}
          onToggleExpand={handleToggleExpand}
          folderData={folderData}
          loadingFolders={loadingFolders}
          currentPath={currentPath}
          selectedPath={selectedPath}
        />
      </div>

      {/* Right Side - Conditional Content */}
      <div className="overflow-y-scroll w-full">
        {viewMode === 'file' && selectedFile ? (
          /* File Viewer Mode */
          <AzureDevOpsFileViewer
            selectedFile={selectedFile}
            selectedPath={selectedPath}
            selectedRepo={selectedRepo}
            selectedBranch={selectedBranch}
            onNavigateToPath={handleNavigateToPath}
          />
        ) : (
          /* List View Mode */
          loadingCurrent ? (
            <div className="h-full flex items-center justify-center">
              <div className="flex flex-col items-center">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <p className="mt-2 text-sm text-gray-600">Loading folder...</p>
              </div>
            </div>
          ) : (
            <FileListView
              files={organizedListFiles}
              selectedItems={selectedItems}
              onSelect={handleSelect}
              onItemClick={handleListItemClick}
              currentPath={currentPath}
              onNavigateToPath={handleNavigateToPath}
              readmeData={readmeData}
              isLoadingReadme={isLoadingReadme}
              selectedFile={selectedFile}
              viewMode={viewMode}
            />
          )
        )}
      </div>
    </div>
  );
};

export default AzureDevOpsCombinedView;
