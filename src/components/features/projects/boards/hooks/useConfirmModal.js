'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';
import ConfirmModal from '@/components/reusables/ConfirmModal';

// Context for the confirm modal
const ConfirmModalContext = createContext(null);

/**
 * Hook to show confirmation modals from any component
 * @returns {{ showConfirm: (options: { title?: string, message: string, onConfirm: () => void, onCancel?: () => void, confirmText?: string, cancelText?: string, type?: 'danger' | 'warning' | 'info' }) => void }}
 */
export const useConfirmModal = () => {
    const context = useContext(ConfirmModalContext);
    if (!context) {
        throw new Error('useConfirmModal must be used within a ConfirmModalProvider');
    }
    return context;
};

/**
 * Provider component that renders the confirm modal and provides the hook
 */
export const ConfirmModalProvider = ({ children }) => {
    const [confirmModal, setConfirmModal] = useState({
        open: false,
        title: 'Confirm',
        message: '',
        onConfirm: null,
        onCancel: null,
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        type: 'danger', // 'danger' | 'warning' | 'info'
        isLoading: false,
    });

    const showConfirm = useCallback((options) => {
        setConfirmModal({
            open: true,
            title: options.title || 'Confirm',
            message: options.message || 'Are you sure?',
            onConfirm: options.onConfirm || null,
            onCancel: options.onCancel || null,
            confirmText: options.confirmText || 'Delete',
            cancelText: options.cancelText || 'Cancel',
            type: options.type || 'danger',
            isLoading: false,
        });
    }, []);

    const closeConfirm = useCallback(() => {
        setConfirmModal(prev => ({ ...prev, open: false }));
    }, []);

    const handleConfirm = useCallback(async () => {
        if (confirmModal.onConfirm) {
            setConfirmModal(prev => ({ ...prev, isLoading: true }));
            try {
                await confirmModal.onConfirm();
            } finally {
                setConfirmModal(prev => ({ ...prev, isLoading: false, open: false }));
            }
        } else {
            closeConfirm();
        }
    }, [confirmModal.onConfirm, closeConfirm]);

    const handleCancel = useCallback(() => {
        confirmModal.onCancel?.();
        closeConfirm();
    }, [confirmModal.onCancel, closeConfirm]);

    // Get colors based on type
    const getTypeStyles = (type) => {
        switch (type) {
            case 'danger':
                return {
                    iconBg: 'bg-red-100',
                    iconColor: 'text-red-600',
                    confirmBg: 'bg-red-600 hover:bg-red-700',
                    loaderColor: 'text-red-600',
                };
            case 'warning':
                return {
                    iconBg: 'bg-yellow-100',
                    iconColor: 'text-yellow-600',
                    confirmBg: 'bg-yellow-600 hover:bg-yellow-700',
                    loaderColor: 'text-yellow-600',
                };
            case 'info':
            default:
                return {
                    iconBg: 'bg-blue-100',
                    iconColor: 'text-blue-600',
                    confirmBg: 'bg-blue-600 hover:bg-blue-700',
                    loaderColor: 'text-blue-600',
                };
        }
    };

    const styles = getTypeStyles(confirmModal.type);

    return (
        <ConfirmModalContext.Provider value={{ showConfirm }}>
            {children}

            {/* Global Confirm Modal */}
            <ConfirmModal
                open={confirmModal.open}
                onClose={handleCancel}
                maxWidth="sm"
                disableBackdropClick={confirmModal.isLoading}
                actions={
                    !confirmModal.isLoading && (
                        <>
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                            >
                                {confirmModal.cancelText}
                            </button>
                            <button
                                onClick={handleConfirm}
                                className={`px-4 py-2 text-sm font-medium text-white ${styles.confirmBg} rounded transition-colors`}
                            >
                                {confirmModal.confirmText}
                            </button>
                        </>
                    )
                }
            >
                {confirmModal.isLoading ? (
                    /* Full Modal Loader */
                    <div className="flex flex-col items-center justify-center mt-3">
                        <div className={`animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 mb-3 ${styles.loaderColor}`}></div>
                        <p className="text-gray-600 font-medium">Deleting...</p>
                    </div>
                ) : (
                    /* Confirm Modal Content */
                    <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${styles.iconBg} flex items-center justify-center`}>
                            <AlertTriangle size={20} className={styles.iconColor} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{confirmModal.title}</h3>
                            <p className="text-sm text-gray-600">{confirmModal.message}</p>
                        </div>
                    </div>
                )}
            </ConfirmModal>
        </ConfirmModalContext.Provider>
    );
};
