'use client';

import React, { forwardRef } from 'react';
import { InputBase as MuiInputBase } from '@mui/material';

/**
 * Reusable InputBase component with consistent Azure DevOps-like styling
 * Wraps MUI InputBase with predefined styles
 * 
 * @param {Object} props - Component props
 * @param {string} [props.size='md'] - Size variant: 'sm' | 'md' | 'lg'
 * @param {boolean} [props.fullWidth=false] - Whether input takes full width
 * @param {Object} [props.sx] - Additional MUI sx styles to merge
 * @param {React.ReactNode} [props.startAdornment] - Content to display at the start
 * @param {React.ReactNode} [props.endAdornment] - Content to display at the end
 * @param {React.Ref} ref - Forwarded ref
 */
const InputBase = forwardRef(({
    size = 'md',
    fullWidth = false,
    sx = {},
    ...props
}, ref) => {
    // Size-based styles
    const sizeStyles = {
        sm: {
            height: '24px',
            fontSize: '0.75rem',
            px: 0.75,
        },
        md: {
            height: '32px',
            fontSize: '0.875rem',
            px: 1,
        },
        lg: {
            height: '40px',
            fontSize: '1rem',
            px: 1.5,
        },
    };

    // Base styles matching Azure DevOps aesthetic
    const baseStyles = {
        backgroundColor: 'white',
        borderRadius: '4px',
        border: '1px solid #0078d4',
        boxShadow: '0 0 0 1px rgba(0, 120, 212, 0.2), 0 0 8px rgba(0, 120, 212, 0.25)',
        transition: 'all 0.2s ease-in-out',
        minWidth: fullWidth ? '100%' : '160px',
        '&:hover': {
            boxShadow: '0 0 0 1px rgba(0, 120, 212, 0.3), 0 0 10px rgba(0, 120, 212, 0.3)',
        },
        '&:focus-within': {
            boxShadow: '0 0 0 2px rgba(0, 120, 212, 0.4), 0 0 12px rgba(0, 120, 212, 0.35)',
        },
        '& input::placeholder': {
            color: '#888',
            opacity: 1,
        },
        ...sizeStyles[size],
        ...sx,
    };

    return (
        <MuiInputBase
            ref={ref}
            sx={baseStyles}
            {...props}
        />
    );
});

InputBase.displayName = 'InputBase';

export default InputBase;