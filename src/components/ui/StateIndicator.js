import React from 'react';

// State configurations matching Azure DevOps
export const STATE_CONFIG = {
    'To Do': {
        color: '#0078D4', // Blue
        bgColor: '#E6F2FF'
    },
    'Doing': {
        color: '#F59E0B', // Amber/Yellow
        bgColor: '#FEF3C7'
    },
    'Done': {
        color: '#10B981', // Green
        bgColor: '#D1FAE5'
    },
};

/**
 * StateIndicator - Displays a colored dot with state text
 * @param {string} state - The work item state
 * @param {boolean} showDot - Whether to show colored dot (default: true)
 * @param {boolean} showText - Whether to show state text (default: true)
 * @param {number} dotSize - Size of the dot in pixels (default: 8)
 */
export default function StateIndicator({
    state,
    showDot = true,
    showText = true,
    dotSize = 8
}) {
    const config = STATE_CONFIG[state] || {
        color: '#6B7280',
        bgColor: '#F3F4F6'
    };

    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
            }}
        >
            {showDot && (
                <span
                    style={{
                        width: dotSize,
                        height: dotSize,
                        borderRadius: '50%',
                        backgroundColor: config.color,
                        flexShrink: 0,
                    }}
                />
            )}
            {showText && (
                <span style={{ color: '#333', fontSize: 14 }}>
                    {state}
                </span>
            )}
        </span>
    );
}
