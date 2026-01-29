"use client";

import React, { useState, useEffect } from 'react';
import { X, Download, Copy, Eye, Code, FileText, ExternalLink } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

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

const FileViewer = ({ file, onClose, repositoryName }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('code'); // 'code', 'raw', 'preview'

  useEffect(() => {
    if (file) {
      fetchFileContent();
    }
  }, [file]);

  const fetchFileContent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // This would be your actual API call to get file content
      // const response = await fetch(`/api/repos/${repositoryId}/files/${file.path}/content`);
      // const data = await response.text();
      
      // For now, using placeholder content
      setContent(`// Sample content for ${file.name}\n// This would be the actual file content from GitHub API\n\nconst example = "File content would be loaded here";`);
    } catch (err) {
      setError('Failed to load file content');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(content);
    // You could add a toast notification here
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isImageFile = (filename) => {
    const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'];
    const extension = filename.split('.').pop()?.toLowerCase();
    return imageExtensions.includes(extension);
  };

  const isTextFile = (filename) => {
    const textExtensions = ['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'cs', 'php', 'rb', 'go', 'rs', 'html', 'css', 'scss', 'json', 'xml', 'yml', 'yaml', 'md', 'txt'];
    const extension = filename.split('.').pop()?.toLowerCase();
    return textExtensions.includes(extension);
  };

  if (!file) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold">{file.name}</h2>
            <span className="text-sm text-gray-500">
              {repositoryName && `in ${repositoryName}`}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {isTextFile(file.name) && (
              <div className="flex rounded border overflow-hidden">
                <button
                  onClick={() => setViewMode('code')}
                  className={`px-3 py-1 text-xs flex items-center space-x-1 ${
                    viewMode === 'code' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <Code className="w-3 h-3" />
                  <span>Code</span>
                </button>
                <button
                  onClick={() => setViewMode('raw')}
                  className={`px-3 py-1 text-xs flex items-center space-x-1 ${
                    viewMode === 'raw' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <FileText className="w-3 h-3" />
                  <span>Raw</span>
                </button>
              </div>
            )}
            
            <button
              onClick={handleCopyContent}
              className="p-2 hover:bg-gray-100 rounded"
              title="Copy content"
            >
              <Copy className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-gray-100 rounded"
              title="Download file"
            >
              <Download className="w-4 h-4" />
            </button>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-red-600 mb-2">Error loading file</p>
                <p className="text-sm text-gray-500">{error}</p>
              </div>
            </div>
          ) : isImageFile(file.name) ? (
            <div className="flex items-center justify-center h-full p-4">
              <img 
                src={file.download_url || '#'} 
                alt={file.name}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ) : isTextFile(file.name) && viewMode === 'code' ? (
            <SyntaxHighlighter
              language={getLanguageFromFilename(file.name)}
              style={tomorrow}
              showLineNumbers={true}
              wrapLines={true}
              customStyle={{
                margin: 0,
                borderRadius: 0,
                fontSize: '14px',
                lineHeight: '1.5'
              }}
            >
              {content}
            </SyntaxHighlighter>
          ) : (
            <pre className="p-4 text-sm whitespace-pre-wrap font-mono">
              {content}
            </pre>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t text-sm text-gray-500">
          <div>
            {file.size && `${(file.size / 1024).toFixed(1)} KB`}
            {file.lastModified && ` • Modified ${new Date(file.lastModified).toLocaleDateString()}`}
          </div>
          
          {file.download_url && (
            <a 
              href={file.download_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-blue-600 hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
              <span>View on GitHub</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileViewer;
