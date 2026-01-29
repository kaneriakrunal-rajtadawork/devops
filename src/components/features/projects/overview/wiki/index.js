'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Bold, Italic, Code, Link, List, ListOrdered, AlignLeft, 
  Table2, Hash, CheckSquare, Copy, Settings, MoreHorizontal,
  ChevronDown, Save
} from 'lucide-react';

const WikiPage = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    setIsDirty(true);
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
    setIsDirty(true);
  };

  const handleSave = () => {
    setIsDirty(false);
  };

  const insertMarkdown = (markdownSyntax) => {
    const textarea = document.getElementById('markdown-editor');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let newText;
    switch (markdownSyntax) {
      case 'bold':
        newText = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        newText = `*${selectedText || 'italic text'}*`;
        break;
      case 'code':
        newText = `\`${selectedText || 'code'}\``;
        break;
      case 'link':
        newText = `[${selectedText || 'link text'}](url)`;
        break;
      case 'list':
        newText = `\n- ${selectedText || 'list item'}`;
        break;
      case 'ordered-list':
        newText = `\n1. ${selectedText || 'list item'}`;
        break;
      case 'table':
        newText = `\n| Header 1 | Header 2 |\n| -------- | -------- |\n| Cell 1   | Cell 2   |`;
        break;
      case 'heading':
        newText = `\n# ${selectedText || 'Heading'}`;
        break;
      case 'checkbox':
        newText = `\n- [ ] ${selectedText || 'Task item'}`;
        break;
      default:
        newText = selectedText;
    }

    const newContent = content.substring(0, start) + newText + content.substring(end);
    setContent(newContent);
    setIsDirty(true);

    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + newText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.id !== 'markdown-editor') return;

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            insertMarkdown('bold');
            break;
          case 'i':
            e.preventDefault();
            insertMarkdown('italic');
            break;
          case 'k':
            e.preventDefault();
            insertMarkdown('link');
            break;
          case 's':
            if (isDirty) {
              e.preventDefault();
              handleSave();
            }
            break;
          default:
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [content, isDirty]);

  const ToolbarButton = ({ icon: Icon, tooltip, onClick }) => (
    <button
      className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded cursor-pointer"
      title={tooltip}
      onClick={onClick}
    >
      <Icon size={18} />
    </button>
  );

  return (
    <div className="px-6 flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b">
        <input
          type="text"
          placeholder="Page title"
          value={title}
          onChange={handleTitleChange}
          className="flex-1 text-2xl font-medium rounded border border-transparent focus:border-blue-500 outline-none transition duration-200"
        />
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={!isDirty}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium ${
              isDirty
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Save size={16} />
            Save
            <ChevronDown size={16} />
          </button>
          <button className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded">
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b bg-gray-50">
        <ToolbarButton icon={Bold} tooltip="Bold (Ctrl+B)" onClick={() => insertMarkdown('bold')} />
        <ToolbarButton icon={Italic} tooltip="Italic (Ctrl+I)" onClick={() => insertMarkdown('italic')} />
        <ToolbarButton icon={Code} tooltip="Code" onClick={() => insertMarkdown('code')} />
        <ToolbarButton icon={Link} tooltip="Link (Ctrl+K)" onClick={() => insertMarkdown('link')} />
        <div className="w-px h-5 bg-gray-300 mx-1" />
        <ToolbarButton icon={List} tooltip="Bullet List" onClick={() => insertMarkdown('list')} />
        <ToolbarButton icon={ListOrdered} tooltip="Numbered List" onClick={() => insertMarkdown('ordered-list')} />
        <ToolbarButton icon={AlignLeft} tooltip="Align Left" onClick={() => {}} />
        <div className="w-px h-5 bg-gray-300 mx-1" />
        <ToolbarButton icon={Table2} tooltip="Insert Table" onClick={() => insertMarkdown('table')} />
        <ToolbarButton icon={Hash} tooltip="Heading" onClick={() => insertMarkdown('heading')} />
        <ToolbarButton icon={CheckSquare} tooltip="Checklist" onClick={() => insertMarkdown('checkbox')} />
        <div className="w-px h-5 bg-gray-300 mx-1" />
        <ToolbarButton icon={Copy} tooltip="Copy" onClick={() => {}} />
        <ToolbarButton icon={MoreHorizontal} tooltip="More Options" onClick={() => {}} />
        <div className="flex-1 text-right">
          <a href="#" className="text-sm text-blue-600 hover:underline">
            Markdown supported.
          </a>
        </div>
      </div>

      {/* Editor and Preview */}
      <div className="flex-1 flex">
        {/* Editor */}
        <div className="flex-1 border-r">
          <textarea
            id="markdown-editor"
            value={content}
            onChange={handleContentChange}
            placeholder="Start writing with Markdown..."
            className="w-full h-full p-4 resize-none focus:outline-none"
          />
        </div>

        {/* Preview */}
        <div className="flex-1 p-4 overflow-auto prose max-w-none">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default WikiPage; 