'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X } from 'lucide-react';
import ConfirmModal from '@/components/reusables/ConfirmModal';

// Context for the error modal
const ErrorModalContext = createContext(null);

/**
 * Hook to show error modal from any component
 * @returns {{ showError: (message: string) => void }}
 */
export const useErrorModal = () => {
    const context = useContext(ErrorModalContext);
    if (!context) {
        throw new Error('useErrorModal must be used within an ErrorModalProvider');
    }
    return context;
};

/**
 * Provider component that renders the error modal and provides the hook
 */
export const ErrorModalProvider = ({ children }) => {
    const [errorModal, setErrorModal] = useState({
        open: false,
        message: ''
    });

    const showError = useCallback((message) => {
        setErrorModal({
            open: true,
            message: message || 'An error occurred. Please try again.'
        });
    }, []);

    const closeError = useCallback(() => {
        setErrorModal({ open: false, message: '' });
    }, []);

    return (
        <ErrorModalContext.Provider value={{ showError }}>
            {children}

            {/* Global Error Modal */}
            <ConfirmModal
                open={errorModal.open}
                onClose={closeError}
                maxWidth="sm"
                actions={
                    <button
                        onClick={closeError}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                    >
                        OK
                    </button>
                }
            >
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <X size={20} className="text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
                        <p className="text-sm text-gray-600">{errorModal.message}</p>
                    </div>
                </div>
            </ConfirmModal>
        </ErrorModalContext.Provider>
    );
};
