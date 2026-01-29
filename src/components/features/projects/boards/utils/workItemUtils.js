/**
 * Utility functions for work items
 */

import { WORK_ITEM_ICONS, STATE_COLORS, BOARD_COLUMNS } from '../constants/boardConfig';

/**
 * Group work items by their state into columns
 * @param {Array} workItems - Array of work item objects
 * @returns {Object} - Object with column IDs as keys and arrays of items as values
 */
export const groupItemsByState = (workItems) => {
    const grouped = {
        'to do': [],
        'doing': [],
        'done': []
    };

    if (!workItems || !Array.isArray(workItems)) {
        return grouped;
    }

    workItems.forEach(item => {
        const state = (item.state || 'To Do').toLowerCase();
        const normalizedItem = {
            ...item,
            id: item._id || item.id, // Ensure consistent ID
        };

        if (grouped[state]) {
            grouped[state].push(normalizedItem);
        } else {
            // Default to 'to do' if state not recognized
            grouped['to do'].push(normalizedItem);
        }
    });

    return grouped;
};

/**
 * Get visual configuration for a work item type
 * @param {string} type - Work item type (epic, task, issue)
 * @returns {Object} - Configuration with icon, color, and bg
 */
export const getWorkItemConfig = (type) => {
    const typeLower = (type || '').toLowerCase();
    return WORK_ITEM_ICONS[typeLower] || WORK_ITEM_ICONS.default;
};

/**
 * Get color configuration for a status/state
 * @param {string} status - Status string
 * @returns {Object} - Color configuration with bg, text, and dot
 */
export const getStatusColor = (status) => {
    const statusLower = (status || '').toLowerCase();
    return STATE_COLORS[statusLower] || STATE_COLORS.default;
};

/**
 * Get initials from a name string
 * @param {string} name - Full name
 * @returns {string|null} - 2 character initials or null
 */
export const getInitials = (name) => {
    if (!name) return null;
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

/**
 * Find which column a work item belongs to based on its state
 * @param {Object} item - Work item object
 * @returns {string} - Column ID
 */
export const getItemColumnId = (item) => {
    const state = (item?.state || item?.status || 'to do').toLowerCase();
    const column = BOARD_COLUMNS.find(c => c.id === state);
    return column ? column.id : 'to do';
};

/**
 * Create a temporary ID for optimistic updates
 * @param {string} prefix - ID prefix
 * @returns {string} - Temporary ID
 */
export const createTempId = (prefix = 'temp') => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
