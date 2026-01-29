/**
 * Tree Utility Functions
 * Reusable functions for traversing and manipulating nested tree structures
 * Used by BacklogsDataGrid, BackLogs, and other components with hierarchical data
 */

/**
 * Find an item by ID in a nested tree structure
 * @param {Array} items - Array of items with potential 'children' property
 * @param {string} id - ID to search for
 * @returns {Object|null} - Found item or null
 */
export const findItemById = (items, id) => {
    for (const item of items) {
        if (item.id === id) return item;
        if (item.children?.length) {
            const found = findItemById(item.children, id);
            if (found) return found;
        }
    }
    return null;
};

/**
 * Find an item's parent array and index in a nested tree structure
 * @param {Array} items - Array of items with potential 'children' property
 * @param {string} itemId - ID to search for
 * @returns {Object|null} - { parent: Array, index: number, item: Object } or null
 */
export const findParentAndIndex = (items, itemId) => {
    for (let i = 0; i < items.length; i++) {
        if (items[i].id === itemId) {
            return { parent: items, index: i, item: items[i] };
        }
        if (items[i].children?.length) {
            const found = findParentAndIndex(items[i].children, itemId);
            if (found) return found;
        }
    }
    return null;
};

/**
 * Get an item's depth level and parent ID in a nested tree structure
 * @param {Array} items - Array of items with potential 'children' property
 * @param {string} targetId - ID to search for
 * @param {number} depth - Current depth (used for recursion)
 * @param {string|null} parentId - Current parent ID (used for recursion)
 * @returns {Object|null} - { depth: number, parentId: string|null, item: Object } or null
 */
export const getItemDepthAndParent = (items, targetId, depth = 0, parentId = null) => {
    for (const item of items) {
        if (item.id === targetId) {
            return { depth, parentId, item };
        }
        if (item.children?.length) {
            const found = getItemDepthAndParent(item.children, targetId, depth + 1, item.id);
            if (found) return found;
        }
    }
    return null;
};

/**
 * Deep clone an array of items (use for mutations)
 * @param {Array} items - Array to clone
 * @returns {Array} - Deep cloned array
 */
export const deepCloneItems = (items) => {
    return JSON.parse(JSON.stringify(items));
};

/**
 * Move an item from one position to another in a nested tree
 * Supports same-parent reordering and cross-parent moves
 * 
 * @param {Array} items - Original items array (will not be mutated)
 * @param {Object} options - Move options
 * @param {string} options.sourceId - ID of item to move
 * @param {string} options.targetId - ID of target position
 * @param {boolean} options.moveToParent - If true, add as child of target instead of sibling
 * @returns {Array|null} - New items array or null if move failed
 */
export const moveItemInTree = (items, { sourceId, targetId, moveToParent = false }) => {
    const newItems = deepCloneItems(items);

    // Find and remove source item
    const sourceResult = findParentAndIndex(newItems, sourceId);
    if (!sourceResult) return null;

    const [movedItem] = sourceResult.parent.splice(sourceResult.index, 1);

    if (moveToParent) {
        // Add as child of target
        const targetItem = findItemById(newItems, targetId);
        if (!targetItem) {
            // Rollback
            sourceResult.parent.splice(sourceResult.index, 0, movedItem);
            return null;
        }

        if (!targetItem.children) {
            targetItem.children = [];
        }
        targetItem.children.unshift(movedItem);
    } else {
        // Insert at target position (sibling)
        const targetResult = findParentAndIndex(newItems, targetId);
        if (!targetResult) {
            // Rollback
            sourceResult.parent.splice(sourceResult.index, 0, movedItem);
            return null;
        }
        targetResult.parent.splice(targetResult.index, 0, movedItem);
    }

    return newItems;
};

/**
 * Flatten a nested tree into a single-level array
 * @param {Array} items - Nested items array
 * @param {Array} result - Accumulator (used for recursion)
 * @returns {Array} - Flattened array
 */
export const flattenTree = (items, result = []) => {
    for (const item of items) {
        result.push(item);
        if (item.children?.length) {
            flattenTree(item.children, result);
        }
    }
    return result;
};
