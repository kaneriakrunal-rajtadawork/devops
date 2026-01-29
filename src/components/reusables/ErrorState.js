'use client';

import React from 'react';
import clsx from 'clsx';

/**
 * ErrorState - A generic error display component
 * 
 * @example
 * <ErrorState
 *   title="Error loading data"
 *   message={error.message}
 *   onRetry={() => refetch()}
 * />
 */
const ErrorState = ({
    title = 'Something went wrong',
    message = 'An unexpected error occurred.',
    onRetry,
    retryLabel = 'Retry',
    showRetry = true,
    className = '',
    variant = 'default', // 'default' | 'inline' | 'fullscreen'
}) => {
    const containerClasses = {
        default: 'bg-red-50 border border-red-200 rounded-lg p-6 max-w-md',
        inline: 'bg-red-50 border border-red-200 rounded-lg p-4',
        fullscreen: 'flex flex-col layout-min-height bg-gray-100 items-center justify-center',
    };

    const content = (
        <div className={clsx(
            variant !== 'fullscreen' && containerClasses[variant],
            className
        )}>
            <h3 className={clsx(
                'font-medium text-red-800 mb-2',
                variant === 'inline' ? 'text-sm' : 'text-lg'
            )}>
                {title}
            </h3>
            <p className={clsx(
                'text-red-700',
                variant === 'inline' ? 'text-xs' : 'text-sm',
                showRetry && onRetry && 'mb-4'
            )}>
                {message}
            </p>
            {showRetry && onRetry && (
                <button
                    onClick={onRetry}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
                >
                    {retryLabel}
                </button>
            )}
        </div>
    );

    if (variant === 'fullscreen') {
        return (
            <div className={containerClasses.fullscreen}>
                <div className={containerClasses.default}>
                    {content.props.children}
                </div>
            </div>
        );
    }

    return content;
};

export default ErrorState;
