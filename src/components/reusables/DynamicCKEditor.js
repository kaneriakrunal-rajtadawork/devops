'use client';

import React, { useEffect, useRef, useState } from 'react';

const DynamicCKEditor = ({ onChange, data, value, editorRef, isActive, setIsActive, ...props }) => {
    const editorContainerRef = useRef(null);
    const [editorContent, setEditorContent] = useState(value || data || '');
    const [isRichTextMode, setIsRichTextMode] = useState(false);

    useEffect(() => {
        setEditorContent(value || data || '');
    }, [value, data]);

    const handleContentChange = (newContent) => {
        setEditorContent(newContent);
        if (onChange) {
            onChange(newContent);
        }
    };

    const toggleRichText = () => {
        setIsRichTextMode(!isRichTextMode);
    };

    const insertFormat = (format) => {
        const textarea = editorContainerRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = editorContent.substring(start, end);
        
        let formattedText = '';
        switch (format) {
            case 'bold':
                formattedText = `**${selectedText || 'bold text'}**`;
                break;
            case 'italic':
                formattedText = `*${selectedText || 'italic text'}*`;
                break;
            case 'code':
                formattedText = `\`${selectedText || 'code'}\``;
                break;
            case 'link':
                formattedText = `[${selectedText || 'link text'}](url)`;
                break;
            case 'list':
                formattedText = `\n- ${selectedText || 'list item'}`;
                break;
            case 'ordered-list':
                formattedText = `\n1. ${selectedText || 'list item'}`;
                break;
            case 'quote':
                formattedText = `\n> ${selectedText || 'quote'}`;
                break;
            default:
                formattedText = selectedText;
        }

        const newContent = editorContent.substring(0, start) + formattedText + editorContent.substring(end);
        handleContentChange(newContent);

        // Reset cursor position
        setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + formattedText.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    // Don't render if not active or window is not available
    if (!isActive || typeof window === 'undefined') {
        return (
            <textarea
                className="w-full h-28 p-2 bg-white border border-gray-300 rounded resize-none text-sm focus:outline-none"
                placeholder="Click to add Description."
                onClick={() => setIsActive && setIsActive(true)}
                value={editorContent}
                onChange={(e) => handleContentChange(e.target.value)}
                {...props}
            />
        );
    }

    return (
        <div className="border border-gray-300 rounded bg-white">
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
                <button
                    type="button"
                    onClick={() => insertFormat('bold')}
                    className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded text-sm font-bold"
                    title="Bold"
                >
                    B
                </button>
                <button
                    type="button"
                    onClick={() => insertFormat('italic')}
                    className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded text-sm italic"
                    title="Italic"
                >
                    I
                </button>
                <button
                    type="button"
                    onClick={() => insertFormat('code')}
                    className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded text-sm font-mono"
                    title="Code"
                >
                    {'</>'}
                </button>
                <div className="w-px h-4 bg-gray-300 mx-1"></div>
                <button
                    type="button"
                    onClick={() => insertFormat('link')}
                    className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded text-sm"
                    title="Link"
                >
                    🔗
                </button>
                <button
                    type="button"
                    onClick={() => insertFormat('list')}
                    className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded text-sm"
                    title="Bullet List"
                >
                    •
                </button>
                <button
                    type="button"
                    onClick={() => insertFormat('ordered-list')}
                    className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded text-sm"
                    title="Numbered List"
                >
                    1.
                </button>
                <button
                    type="button"
                    onClick={() => insertFormat('quote')}
                    className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded text-sm"
                    title="Quote"
                >
                    {'"'}
                </button>
                <div className="flex-1"></div>
                <button
                    type="button"
                    onClick={toggleRichText}
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                    {isRichTextMode ? 'Switch to Plain Text' : 'Switch to Rich Text'}
                </button>
            </div>

            {/* Editor */}
            <div className="p-2">
                {isRichTextMode ? (
                    <div className="min-h-[100px] max-h-[300px] overflow-y-auto">
                        <RichTextViewer content={editorContent} />
                    </div>
                ) : (
                    <textarea
                        ref={editorContainerRef}
                        className="w-full min-h-[100px] max-h-[300px] resize-none text-sm focus:outline-none border-0"
                        placeholder="Start typing... Use the toolbar above for formatting."
                        value={editorContent}
                        onChange={(e) => handleContentChange(e.target.value)}
                        {...props}
                    />
                )}
            </div>
        </div>
    );
};

// Simple Rich Text Viewer Component
const RichTextViewer = ({ content }) => {
    const formatContent = (text) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 underline">$1</a>')
            .replace(/^- (.*)/gm, '<li class="list-disc ml-4">$1</li>')
            .replace(/^\d+\. (.*)/gm, '<li class="list-decimal ml-4">$1</li>')
            .replace(/^> (.*)/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 italic">$1</blockquote>')
            .replace(/\n/g, '<br>');
    };

    return (
        <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: formatContent(content) }}
        />
    );
};

export default DynamicCKEditor; 