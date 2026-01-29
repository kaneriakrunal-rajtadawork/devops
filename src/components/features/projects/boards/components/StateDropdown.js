'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';

// State options with colors
const STATE_OPTIONS = [
    { id: 'To Do', label: 'To Do', color: 'bg-gray-400' },
    { id: 'Doing', label: 'Doing', color: 'bg-blue-500' },
    { id: 'Done', label: 'Done', color: 'bg-green-500' }
];

/**
 * StateDropdown - Dropdown for changing work item state
 * 
 * @param {string} currentState - Current state value
 * @param {function} onSelect - Callback when state is selected
 * @param {boolean} isLoading - Whether update is in progress
 * @param {boolean} disabled - Whether selection is disabled
 */
const StateDropdown = ({
    currentState = 'To Do',
    onSelect,
    isLoading = false,
    disabled = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (state) => {
        if (state.id !== currentState) {
            onSelect?.(state.id);
        }
        setIsOpen(false);
    };

    const getStateColor = (state) => {
        const option = STATE_OPTIONS.find(s => s.id.toLowerCase() === (state || '').toLowerCase());
        return option?.color || 'bg-gray-400';
    };

    const getStateLabel = (state) => {
        const option = STATE_OPTIONS.find(s => s.id.toLowerCase() === (state || '').toLowerCase());
        return option?.label || state || 'To Do';
    };

    return (
        <div
            ref={dropdownRef}
            className="relative"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
        >
            {/* Trigger Button */}
            <button
                onClick={() => !disabled && !isLoading && setIsOpen(!isOpen)}
                disabled={disabled || isLoading}
                className={`
                    flex items-center gap-1.5 py-0.5 rounded
                    text-xs transition-all duration-150
                    ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer'}
                    ${isOpen ? 'bg-gray-100' : ''}
                `}
            >
                {isLoading ? (
                    <Loader2 size={12} className="animate-spin text-blue-600" />
                ) : (
                    <>
                        <span className={`w-2 h-2 ${getStateColor(currentState)} rounded-full`}></span>
                        <span className="text-gray-600">{getStateLabel(currentState)}</span>
                        <ChevronDown size={10} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </>
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute left-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                    {STATE_OPTIONS.map((state) => {
                        const isSelected = state.id.toLowerCase() === (currentState || '').toLowerCase();
                        return (
                            <button
                                key={state.id}
                                onClick={() => handleSelect(state)}
                                className={`
                                    w-full px-3 py-1.5 text-left text-xs flex items-center gap-2
                                    ${isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}
                                `}
                            >
                                <span className={`w-2 h-2 ${state.color} rounded-full`}></span>
                                <span>{state.label}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default StateDropdown;
