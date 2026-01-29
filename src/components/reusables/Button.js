'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Reusable Button component with variants and loading state
 * 
 * @param {Object} props
 * @param {'primary' | 'secondary' | 'danger' | 'ghost'} props.variant - Button style variant
 * @param {'sm' | 'md' | 'lg'} props.size - Button size
 * @param {boolean} props.loading - Shows loading spinner when true
 * @param {boolean} props.disabled - Disables the button
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onClick - Click handler
 * @param {'button' | 'submit' | 'reset'} props.type - Button type
 */
const Button = ({
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    children,
    className = '',
    onClick,
    type = 'button',
    ...props
}) => {
    // Base styles
    const baseStyles = 'inline-flex items-center justify-center font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed';

    // Size styles
    const sizeStyles = {
        sm: 'px-2.5 py-1 text-xs',
        md: 'px-4 py-1.5 text-sm',
        lg: 'px-6 py-2.5 text-base',
    };

    // Variant styles
    const variantStyles = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 disabled:opacity-50',
        secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 disabled:opacity-50',
        danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400 disabled:opacity-50',
        ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 disabled:opacity-50',
    };

    // Spinner colors based on variant
    const spinnerColors = {
        primary: 'text-white',
        secondary: 'text-gray-500',
        danger: 'text-white',
        ghost: 'text-gray-500',
    };

    const isDisabled = disabled || loading;

    return (
        <button
            type={type}
            disabled={isDisabled}
            onClick={onClick}
            className={`
                ${baseStyles}
                ${sizeStyles[size]}
                ${variantStyles[variant]}
                ${className}
            `}
            {...props}
        >
            {loading && (
                <Loader2
                    className={`animate-spin mr-2 ${spinnerColors[variant]}`}
                    size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16}
                />
            )}
            {children}
        </button>
    );
};

export default Button;
