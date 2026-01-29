import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, X, Loader2 } from 'lucide-react';

const Dropdown = ({
    options = [],
    icon = null,
    separatorIndexes = [],
    defaultSelected = [],
    initialValue = 'Select',
    multiSelect = false,
    onSelect = () => { },
    className = '',
    renderOption = null, // Custom render function for options: (option, isSelected) => ReactNode
    minWidth = 150, // Minimum width for dropdown panel
    loading = false, // Show loading state
    fullWidth = false, // When true, removes max-width constraint on selected text
    alignRight = true, // When true, dropdown aligns to the right; when false, aligns to the left
}) => {
    const [selected, setSelected] = useState(multiSelect ? defaultSelected : '');
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Sync internal state with prop changes
    useEffect(() => {
        if (multiSelect) {
            setSelected(defaultSelected);
        }
    }, [defaultSelected, multiSelect]);

    const handleSelect = (e, option) => {
        e.preventDefault();
        e.stopPropagation();

        if (multiSelect) {
            const isCurrentlySelected = selected.some(s =>
                (typeof s === 'object' ? s.id : s) === (typeof option === 'object' ? option.id : option)
            );
            const updated = isCurrentlySelected
                ? selected.filter((o) => (typeof o === 'object' ? o.id : o) !== (typeof option === 'object' ? option.id : option))
                : [...selected, option];
            setSelected(updated);
            onSelect(updated, e);
        } else {
            setSelected(option);
            onSelect(option, e);
            setIsOpen(false);
        }
    };

    const isOptionSelected = (option) => {
        if (multiSelect) {
            return selected.some(s =>
                (typeof s === 'object' ? s.id : s) === (typeof option === 'object' ? option.id : option)
            );
        }
        return selected === option.label || selected?.id === option.id;
    };

    const clearAll = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setSelected([]);
        onSelect([], e);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getDisplayText = () => {
        if (multiSelect) {
            if (selected.length === 0) return initialValue;
            const firstLabel = typeof selected[0] === 'object' ? selected[0].label : selected[0];
            if (selected.length === 1) return firstLabel;
            return `${firstLabel} (+${selected.length - 1})`;
        } else {
            const label = typeof selected === 'object' ? selected.label : selected;
            return label || initialValue;
        }
    };

    const handleTriggerClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    const hasSelection = multiSelect ? selected.length > 0 : !!selected;

    return (
        <div
            ref={dropdownRef}
            className={`relative inline-block text-left ${className} hide-scrollbar`}
            onClick={(e) => e.stopPropagation()}
        >
            {/* Trigger Button */}
            <button
                type="button"
                onClick={handleTriggerClick}
                className={`cursor-pointer inline-flex items-center justify-between gap-1 px-3 py-1.5 text-sm font-medium rounded hover:bg-gray-100 transition-colors ${hasSelection ? 'text-gray-900 bg-blue-50 border border-blue-200' : 'text-gray-600'
                    } ${className}`}
            >
                {icon && <span className="mr-1">{icon}</span>}
                <span className={fullWidth ? '' : 'truncate max-w-[120px]'}>
                    {getDisplayText()}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div
                    className={`absolute z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg ${alignRight ? 'right-0' : 'left-0'}`}
                    style={{ minWidth: minWidth }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="max-h-64 overflow-auto py-1">
                        {/* Loading State */}
                        {loading ? (
                            <div className="flex items-center justify-center py-4">
                                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                            </div>
                        ) : options.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-gray-500">
                                No options available
                            </div>
                        ) : (
                            options.map((option, index) => {
                                const isSelected = isOptionSelected(option);

                                return (
                                    <div key={option.id || option.label}>
                                        {separatorIndexes.includes(index) && <hr className="my-1 border-gray-200" />}
                                        <label
                                            className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''
                                                }`}
                                            onClick={(e) => handleSelect(e, option)}
                                        >
                                            {multiSelect && (
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                    checked={isSelected}
                                                    onChange={(e) => handleSelect(e, option)}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            )}
                                            {/* Render custom option or default */}
                                            {renderOption ? (
                                                renderOption(option, isSelected)
                                            ) : (
                                                <span className="text-gray-700">
                                                    {option.label}
                                                </span>
                                            )}
                                        </label>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Clear All */}
                    {multiSelect && selected.length > 0 && (
                        <div className="flex items-center justify-end gap-1 px-3 py-2 border-t border-gray-100 bg-gray-50">
                            <button
                                type="button"
                                onClick={clearAll}
                                className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                                Clear
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Dropdown;

