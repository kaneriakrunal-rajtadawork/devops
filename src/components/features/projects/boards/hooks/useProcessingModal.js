'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Modal, Box, CircularProgress } from '@mui/material';

// Context for the processing modal
const ProcessingModalContext = createContext(null);

/**
 * Hook to show processing modal from any component
 * @returns {{ 
 *   showProcessing: (message?: string, current?: number, total?: number) => void,
 *   hideProcessing: () => void,
 *   updateProgress: (current: number, total?: number) => void,
 *   withProcessing: <T>(promise: Promise<T>, message?: string) => Promise<T>
 * }}
 */
export const useProcessingModal = () => {
    const context = useContext(ProcessingModalContext);
    if (!context) {
        throw new Error('useProcessingModal must be used within a ProcessingModalProvider');
    }
    return context;
};

/**
 * Provider component that renders the processing modal and provides the hook
 */
export const ProcessingModalProvider = ({ children }) => {
    const [processingState, setProcessingState] = useState({
        open: false,
        message: 'Processing...',
        current: 1,
        total: 1
    });

    /**
     * Show the processing modal
     * @param {string} message - The message to display
     * @param {number} current - Current item being processed (default: 1)
     * @param {number} total - Total items to process (default: 1)
     */
    const showProcessing = useCallback((message = 'Processing...', current = 1, total = 1) => {
        setProcessingState({
            open: true,
            message,
            current,
            total
        });
    }, []);

    /**
     * Hide the processing modal
     */
    const hideProcessing = useCallback(() => {
        setProcessingState(prev => ({ ...prev, open: false }));
    }, []);

    /**
     * Update the progress without hiding/showing
     * @param {number} current - Current item being processed
     * @param {number} total - Total items (optional, keeps existing if not provided)
     */
    const updateProgress = useCallback((current, total) => {
        setProcessingState(prev => ({
            ...prev,
            current,
            total: total ?? prev.total
        }));
    }, []);

    /**
     * Wrapper function that shows processing modal during an async operation
     * Usage: await withProcessing(apiCall(), 'Saving changes')
     * @param {Promise<T>} promise - The promise to await
     * @param {string} message - The message to display
     * @returns {Promise<T>} - The result of the promise
     */
    const withProcessing = useCallback(async (promise, message = 'Processing...') => {
        showProcessing(message);
        try {
            const result = await promise;
            return result;
        } finally {
            hideProcessing();
        }
    }, [showProcessing, hideProcessing]);

    return (
        <ProcessingModalContext.Provider value={{ showProcessing, hideProcessing, updateProgress, withProcessing }}>
            {children}

            {/* Processing Modal */}
            <Modal
                open={processingState.open}
                onClose={() => { }}
                disableEscapeKeyDown
                disableAutoFocus
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    bgcolor: 'white',
                    boxShadow: 24,
                    borderRadius: 1,
                    minWidth: 400,
                    maxWidth: 500,
                    overflow: 'hidden',
                    outline: 'none',
                }}>
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-200">
                        <h3 className="text-base font-semibold text-gray-900">
                            Processing work item(s)
                        </h3>
                    </div>
                    {/* Content */}
                    <div className="px-4 py-6 flex items-center gap-4">
                        <CircularProgress size={24} thickness={4} />
                        <span className="text-sm text-blue-600">
                            {processingState.message} {processingState.current} - {processingState.current} of {processingState.total}
                        </span>
                    </div>
                    {/* Footer */}
                    <div className="px-4 py-3 border-t border-gray-200 flex justify-end">
                        <button
                            disabled
                            className="px-4 py-1.5 text-sm font-medium text-gray-400 bg-gray-100 rounded border border-gray-300 cursor-not-allowed"
                        >
                            OK
                        </button>
                    </div>
                </Box>
            </Modal>
        </ProcessingModalContext.Provider>
    );
};
