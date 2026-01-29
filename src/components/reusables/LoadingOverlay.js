'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

/**
 * LoadingOverlay - A generic loading overlay component
 * 
 * @example
 * <LoadingOverlay isLoading={isLoading} message="Loading data..." />
 * 
 * @example
 * <div className="relative">
 *   <LoadingOverlay isLoading={isLoading} />
 *   <YourContent />
 * </div>
 */
const LoadingOverlay = ({
    isLoading = false,
    message = 'Loading...',
    showMessage = true,
    className = '',
    spinnerSize = 20,
    spinnerColor = 'text-blue-600',
}) => {
    if (!isLoading) return null;

    return (
        <div className={clsx(
            'absolute inset-0 bg-white/60 flex items-center justify-center z-10',
            className
        )}>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-md">
                <Loader2
                    size={spinnerSize}
                    className={clsx('animate-spin', spinnerColor)}
                />
                {showMessage && (
                    <span className="text-sm text-gray-600">{message}</span>
                )}
            </div>
        </div>
    );
};

export default LoadingOverlay;
