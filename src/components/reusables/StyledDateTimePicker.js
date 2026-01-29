'use client';

import React from 'react';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';

/**
 * StyledDateTimePicker - MUI DateTimePicker with consistent app styling
 * 
 * @param {Object} props
 * @param {string} props.label - Input label
 * @param {Date|string|null} props.value - Date value
 * @param {Function} props.onChange - Change handler
 * @param {boolean} props.showTime - Whether to show time picker (default: false)
 * @param {Object} props.sx - Additional MUI sx styles
 * @param {string} props.className - Additional CSS classes
 */
const StyledDateTimePicker = ({
    label,
    value,
    onChange,
    showTime = false,
    sx = {},
    className = '',
    ...props
}) => {
    // Convert value to dayjs if it's a string or Date
    const dayjsValue = value ? dayjs(value) : null;

    // Base styles matching app theme
    const baseStyles = {
        '& .MuiOutlinedInput-root': {
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            color: '#6a7282',
            '& fieldset': {
                borderColor: '#e5e7eb',
            },
            '&:hover fieldset': {
                borderColor: '#d1d5db',
            },
            '&.Mui-focused fieldset': {
                borderColor: '#3b82f6',
                borderWidth: '1px',
            },
        },
        '& .MuiInputLabel-root': {
            fontSize: '0.75rem',
            color: 'rgba(0,0,0,0.55)',
            '&.Mui-focused': {
                color: '#3b82f6',
            },
        },
        '& .MuiSvgIcon-root': {
            fontSize: '1.25rem',
            color: '#6b7280',
        },
    };

    // Merge base styles with custom sx
    const mergedStyles = { ...baseStyles, ...sx };

    // Configure view renderers based on showTime prop
    const viewRenderers = showTime
        ? undefined
        : {
            hours: null,
            minutes: null,
            seconds: null,
        };

    return (
        <DateTimePicker
            label={label}
            value={dayjsValue}
            onChange={onChange}
            viewRenderers={viewRenderers}
            slotProps={{
                textField: {
                    size: 'small',
                    fullWidth: true,
                    className,
                },
            }}
            sx={mergedStyles}
            {...props}
        />
    );
};

export default StyledDateTimePicker;
