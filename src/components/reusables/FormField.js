'use client';

import React from 'react';

/**
 * FormField - Reusable form input with label and error state
 * 
 * @param {Object} props
 * @param {string} props.label - Field label
 * @param {string} props.value - Input value
 * @param {'text' | 'number' | 'email' | 'password'} props.type - Input type
 * @param {string} props.placeholder - Placeholder text
 * @param {Function} props.onChange - Change handler (receives value, not event)
 * @param {string} props.error - Error message to display
 * @param {boolean} props.disabled - Whether input is disabled
 * @param {string} props.className - Additional CSS classes
 */
const FormField = ({
    label,
    value,
    type = 'text',
    placeholder,
    onChange,
    error,
    disabled = false,
    className = '',
}) => {
    return (
        <div className={`mb-4 ${className}`}>
            {label && (
                <div className="text-[rgba(0,0,0,0.55)] text-xs font-normal mb-1">
                    {label}
                </div>
            )}
            <input
                type={type}
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                className={`
                    w-full px-3 py-2 text-sm text-gray-700
                    bg-white border rounded
                    transition-colors duration-200 outline-none
                    ${error
                        ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                        : 'border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                    }
                    ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
                `}
            />
            {error && (
                <p className="mt-1 text-xs text-red-500">{error}</p>
            )}
        </div>
    );
};

export default FormField;
