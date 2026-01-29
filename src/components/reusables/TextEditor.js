'use client';

import { useCallback, useEffect } from 'react';
import { RichTextProvider } from 'reactjs-tiptap-editor';

// Base Kit
import { Document } from '@tiptap/extension-document';
import { Text } from '@tiptap/extension-text';
import { Paragraph } from '@tiptap/extension-paragraph';
import { HardBreak } from '@tiptap/extension-hard-break';
import { TextStyle } from '@tiptap/extension-text-style';
import { ListItem } from '@tiptap/extension-list';
import { Dropcursor, Gapcursor, Placeholder, TrailingNode } from '@tiptap/extensions';

// Extensions for the required features
import { Bold, RichTextBold } from 'reactjs-tiptap-editor/bold';
import { Italic, RichTextItalic } from 'reactjs-tiptap-editor/italic';
import { TextUnderline, RichTextUnderline } from 'reactjs-tiptap-editor/textunderline';
import { BulletList, RichTextBulletList } from 'reactjs-tiptap-editor/bulletlist';
import { OrderedList, RichTextOrderedList } from 'reactjs-tiptap-editor/orderedlist';
import { Highlight, RichTextHighlight } from 'reactjs-tiptap-editor/highlight';
import { Color, RichTextColor } from 'reactjs-tiptap-editor/color';
import { Emoji, RichTextEmoji } from 'reactjs-tiptap-editor/emoji';
import { Indent, RichTextIndent } from 'reactjs-tiptap-editor/indent';
import { Strike, RichTextStrike } from 'reactjs-tiptap-editor/strike';
import { Heading, RichTextHeading } from 'reactjs-tiptap-editor/heading';
import { Code, RichTextCode } from 'reactjs-tiptap-editor/code';
import { Mention } from 'reactjs-tiptap-editor/mention';
import { Clear, RichTextClear } from 'reactjs-tiptap-editor/clear';
import { Image, RichTextImage } from 'reactjs-tiptap-editor/image';
import { Link, RichTextLink } from 'reactjs-tiptap-editor/link';
import { History, RichTextUndo, RichTextRedo } from 'reactjs-tiptap-editor/history';

// Bubble menu for link editing
import { RichTextBubbleLink, RichTextBubbleImage, RichTextBubbleText } from 'reactjs-tiptap-editor/bubble';

// Import CSS
import 'reactjs-tiptap-editor/style.css';

import { EditorContent, useEditor } from '@tiptap/react';

// Base Extensions
const BaseKit = [
    Document,
    Text,
    Dropcursor,
    Gapcursor,
    HardBreak,
    Paragraph,
    TrailingNode,
    ListItem,
    TextStyle,
    Placeholder.configure({
        placeholder: 'Start typing...',
    }),
];

// Build extensions array with only required features
const extensions = [
    ...BaseKit,
    History,
    Bold,
    Italic,
    TextUnderline,
    BulletList,
    OrderedList,
    Highlight,
    Color,
    Emoji,
    Indent,
    Strike,
    Heading,
    Code,
    Mention,
    Clear,
    Image.configure({
        upload: (files) => {
            return new Promise((resolve) => {
                // TODO: Replace with actual upload logic
                setTimeout(() => {
                    resolve(URL.createObjectURL(files));
                }, 300);
            });
        },
    }),
    Link,
];

// Toolbar Component with only required buttons
const RichTextToolbar = ({ isEmojiDisabled = false }) => {
    return (
        <div className="flex items-center p-2 gap-1 flex-wrap border-b border-solid border-gray-200 bg-gray-50">
            {/* Undo/Redo */}
            <RichTextUndo />
            <RichTextRedo />

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Heading */}
            <RichTextHeading />

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Text Formatting */}
            <RichTextBold />
            <RichTextItalic />
            <RichTextUnderline />
            <RichTextStrike />
            <RichTextCode />

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Color & Highlight */}
            <RichTextColor />
            <RichTextHighlight />

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Lists */}
            <RichTextBulletList />
            <RichTextOrderedList />

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Indent */}
            <RichTextIndent />

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Link & Image */}
            <RichTextLink />
            <RichTextImage />

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Emoji */}
            {!isEmojiDisabled && <>
                <RichTextEmoji />
                <div className="w-px h-6 bg-gray-300 mx-1" />
            </>}


            {/* Clear Format */}
            <RichTextClear />
        </div>
    );
};

/**
 * TextEditor - A reusable rich text editor component
 * 
 * @param {Object} props
 * @param {string} props.value - The HTML content value
 * @param {function} props.onChange - Callback when content changes (receives HTML string)
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.disabled - Whether the editor is disabled
 * @param {boolean} props.autoHeight - Whether to auto-size height to content (no min-height)
 * @param {string} props.className - Additional CSS classes
 */
const TextEditor = ({
    value = '',
    onChange,
    placeholder = 'Start typing...',
    disabled = false,
    autoHeight = false,
    className = '',
    isEmojiDisabled = false,
    autoFocus = false,
}) => {
    const editor = useEditor({
        textDirection: 'auto',
        content: value,
        extensions: [
            ...BaseKit.filter(ext => ext !== Placeholder.configure({ placeholder: 'Start typing...' })),
            Placeholder.configure({ placeholder }),
            History,
            Bold,
            Italic,
            TextUnderline,
            BulletList,
            OrderedList,
            Highlight,
            Color,
            Emoji,
            Indent,
            Strike,
            Heading,
            Code,
            Mention,
            Clear,
            Image.configure({
                upload: (files) => {
                    return new Promise((resolve) => {
                        setTimeout(() => {
                            resolve(URL.createObjectURL(files));
                        }, 300);
                    });
                },
            }),
            Link,
        ],
        editable: !disabled,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onChange?.(html);
        },
    });

    // Auto-focus the editor when autoFocus prop is true
    useEffect(() => {
        if (editor && autoFocus && !disabled) {
            // Use setTimeout to ensure the editor is fully rendered
            const timer = setTimeout(() => {
                editor.commands.focus('end');
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [editor, autoFocus, disabled]);

    // Update editor content when value prop changes
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    // Update editable state when disabled prop changes
    useEffect(() => {
        if (editor) {
            editor.setEditable(!disabled);
        }
    }, [disabled, editor]);

    // Determine styling based on autoHeight and disabled props
    const isCompact = autoHeight && disabled;
    const containerStyles = isCompact
        ? 'border-0 bg-transparent'
        : 'border border-[#e0e0e0] focus-within:border-[#0078d4]';

    return (
        <div className={`text-editor-container rounded-lg overflow-hidden bg-white ${containerStyles} ${className}`}>
            <RichTextProvider editor={editor}>
                <div className="editor-content-wrapper">
                    <style>{`
                        .editor-content-wrapper .tiptap {
                            padding: 16px;
                            outline: none;
                        }
                        .editor-content-wrapper .tiptap p {
                            margin: 0;
                        }
                        .editor-content-wrapper .tiptap p.is-editor-empty:first-child::before {
                            color: #9ca3af;
                            content: attr(data-placeholder);
                            float: left;
                            height: 0;
                            pointer-events: none;
                        }
                        .editor-content-wrapper .ProseMirror {
                            padding: 12px !important;
                            margin: 0 !important;
                            height: auto !important;
                            min-height: ${autoHeight ? '100px' : '200px'} !important;
                        }
                        .editor-content-wrapper .ProseMirror:focus {
                            outline: none;
                        }
                    `}</style>
                    <EditorContent
                        editor={editor}
                        className={autoHeight ? '' : 'min-h-[200px] min-w-[400px]'}
                    />
                </div>
                {!disabled && <RichTextToolbar isEmojiDisabled />}

                {/* Bubble Menus */}
                <RichTextBubbleLink />
                <RichTextBubbleImage />
                <RichTextBubbleText />
            </RichTextProvider>
        </div>
    );
};

export default TextEditor;