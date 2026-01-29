import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export default function TagsDropdown({ tags = [], onTagsChange, selectedTags: propSelectedTags = [], operator = 'or' }) {
    const [isOpen, setIsOpen] = useState(false);
    const [radioValue, setRadioValue] = useState(operator);
    const [selectedTags, setSelectedTags] = useState(propSelectedTags);
    const dropdownRef = useRef();

    const toggleDropdown = () => setIsOpen(prev => !prev);

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Sync internal state with parent state
    useEffect(() => {
        setSelectedTags(propSelectedTags);
    }, [propSelectedTags]);

    useEffect(() => {
        setRadioValue(operator);
    }, [operator]);

    const handleTagToggle = (tag) => {
        const newSelectedTags = selectedTags.includes(tag)
            ? selectedTags.filter(t => t !== tag)
            : [...selectedTags, tag];

        setSelectedTags(newSelectedTags);
        onTagsChange?.(newSelectedTags, radioValue);
    };

    const handleClear = () => {
        setSelectedTags([]);
        setRadioValue('or');
        onTagsChange?.([], 'or');
        setIsOpen(false);
    };

    const handleRadioChange = (value) => {
        setRadioValue(value);
        onTagsChange?.(selectedTags, value);
    };

    const hasSelectedTags = selectedTags.length > 0;

    return (
        <div className="relative inline-block" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className={`cursor-pointer flex items-center gap-2 text-sm font-medium px-3 py-2 rounded hover:bg-gray-200 hover:text-gray-600 transition ${hasSelectedTags ? 'text-blue-600 bg-blue-50' : 'text-gray-700'}`}
            >
                Tags {hasSelectedTags && `(${selectedTags.length})`}
                <ChevronDown size={14} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white shadow-md rounded-md z-50 border border-gray-200">
                    {/* Or/And Toggle */}
                    <div className="flex items-center space-x-4 p-3 border-b border-gray-100">
                        <label className="flex items-center space-x-1 cursor-pointer">
                            <input
                                type="radio"
                                name="tagsOption"
                                value="or"
                                checked={radioValue === 'or'}
                                onChange={() => handleRadioChange('or')}
                            />
                            <span className="text-sm">Or</span>
                        </label>

                        <label className="flex items-center space-x-1 cursor-pointer">
                            <input
                                type="radio"
                                name="tagsOption"
                                value="and"
                                checked={radioValue === 'and'}
                                onChange={() => handleRadioChange('and')}
                            />
                            <span className="text-sm">And</span>
                        </label>
                    </div>

                    {/* Tags List */}
                    <div className="max-h-48 overflow-y-auto p-2">
                        {tags.length > 0 ? (
                            tags.map((tag) => (
                                <label
                                    key={tag}
                                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedTags.includes(tag)}
                                        onChange={() => handleTagToggle(tag)}
                                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">{tag}</span>
                                </label>
                            ))
                        ) : (
                            <div className="text-center text-gray-400 text-sm py-4">
                                No tags available
                            </div>
                        )}
                    </div>

                    {/* Clear Button */}
                    <div className="flex justify-end items-center px-3 py-2 border-t border-gray-100">
                        <button
                            onClick={handleClear}
                            className="flex items-center text-gray-400 text-sm hover:text-black transition"
                        >
                            <span className="mr-1">✕</span> Clear
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
