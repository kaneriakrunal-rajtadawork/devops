'use client';

import React, { useState } from 'react';

/**
 * A reusable tag input component that allows adding and removing tags.
 * 
 * @param {string[]} tags - Array of current tags
 * @param {function} onTagsChange - Callback when tags are updated
 * @param {string} placeholder - Placeholder text for the input
 * @param {string} addButtonText - Text for the add button
 */
const TagInput = ({
    tags = [],
    onTagsChange,
    placeholder = 'Enter tag',
    addButtonText = 'Add Tag'
}) => {
    const [showInput, setShowInput] = useState(false);
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault();
            const newTag = inputValue.trim();
            if (!tags.includes(newTag)) {
                onTagsChange([...tags, newTag]);
            }
            setInputValue('');
        }
    };

    const handleBlur = () => {
        // Add the tag if there's a value before hiding input
        if (inputValue.trim() && !tags.includes(inputValue.trim())) {
            onTagsChange([...tags, inputValue.trim()]);
        }
        setInputValue('');
        setShowInput(false);
    };

    const removeTag = (index) => {
        const updatedTags = tags.filter((_, i) => i !== index);
        onTagsChange(updatedTags);
    };

    return (
        <div className="flex items-center gap-2 flex-wrap">
            {/* Display existing tags */}
            {tags.map((tag, index) => (
                <div
                    key={index}
                    className="flex items-center px-2 py-1 text-sm text-black bg-gray-200 rounded-full"
                >
                    {tag}
                    <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="ml-2 text-black cursor-pointer hover:text-gray-500 focus:outline-none"
                        aria-label={`Remove tag ${tag}`}
                    >
                        &times;
                    </button>
                </div>
            ))}

            {/* Input Field or Add Button */}
            <div className="relative group">
                {!showInput ? (
                    <button
                        type="button"
                        className="cursor-pointer px-3 py-1 text-sm font-semibold text-center bg-gray-100 rounded-sm hover:bg-gray-200 transition"
                        onClick={() => setShowInput(true)}
                    >
                        {addButtonText}
                    </button>
                ) : (
                    <input
                        type="text"
                        placeholder={placeholder}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={handleBlur}
                        autoFocus
                        className="px-3 py-1 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                )}

                {/* Tooltip */}
                {!showInput && (
                    <div className="absolute left-1/2 -translate-x-1/2 -top-8 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                        {addButtonText}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TagInput;
