'use client';

import React from 'react';
import {
    Dialog,
    Fade,
    Slide,
} from '@mui/material';

/**
 * Reusable Confirm Modal Component with MUI transitions
 * Simple design: message + action buttons at bottom right
 * 
 * @param {Object} props
 * @param {boolean} props.open - Whether the modal is open
 * @param {Function} props.onClose - Callback when the modal is closed
 * @param {React.ReactNode} props.children - Modal content (message)
 * @param {React.ReactNode} props.actions - Modal footer actions (buttons)
 * @param {string} props.maxWidth - Max width of modal: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false
 * @param {boolean} props.fullWidth - Whether to take full width up to maxWidth
 * @param {string} props.transition - Transition type: 'fade' | 'slide'
 * @param {boolean} props.disableBackdropClick - Whether to disable closing on backdrop click
 * @param {string} props.className - Additional CSS classes for content
 */
const ConfirmModal = ({
    open = false,
    onClose,
    children,
    actions,
    maxWidth = 'xs',
    fullWidth = true,
    transition = 'fade',
    disableBackdropClick = false,
    className = '',
}) => {
    // Handle backdrop click
    const handleClose = (event, reason) => {
        if (disableBackdropClick && reason === 'backdropClick') {
            return;
        }
        onClose?.(event, reason);
    };

    // Get transition component based on type
    const TransitionComponent = transition === 'slide' ? Slide : Fade;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth={maxWidth}
            fullWidth={fullWidth}
            TransitionComponent={TransitionComponent}
            TransitionProps={{
                timeout: 200,
                ...(transition === 'slide' && { direction: 'up' }),
            }}
            PaperProps={{
                sx: {
                    borderRadius: '4px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                    padding: '20px',
                },
            }}
        >
            {/* Modal Content */}
            <div className={`text-sm text-gray-800 font-semibold ${className}`}>
                {children}
            </div>

            {/* Modal Actions - Bottom Right */}
            {actions && (
                <div className="flex justify-end gap-2 mt-6">
                    {actions}
                </div>
            )}
        </Dialog>
    );
};

export default ConfirmModal;

