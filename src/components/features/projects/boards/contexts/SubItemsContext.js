'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { arrayMove } from '@dnd-kit/sortable';

/**
 * SubItemsContext - Manages sub-items state across all WorkItemCards
 * Enables cross-parent drag-and-drop for sub-items
 * 
 * IMPORTANT: To sync with the parent work items state (e.g., Boards.js items),
 * use the setOnSubItemMove callback to register a handler that updates work item children arrays.
 */
const SubItemsContext = createContext(null);

export const useSubItems = () => {
    const context = useContext(SubItemsContext);
    if (!context) {
        throw new Error('useSubItems must be used within a SubItemsProvider');
    }
    return context;
};

export const SubItemsProvider = ({ children }) => {
    // Map of parentId -> subItems array
    const [subItemsMap, setSubItemsMap] = useState({});

    // Track currently dragging sub-item for cross-parent moves
    const [draggingSubItem, setDraggingSubItem] = useState(null);

    // Track loading sub-item IDs (for API calls)
    const [loadingSubItemIds, setLoadingSubItemIds] = useState(new Set());

    // Callback ref for updating parent work items when sub-items are moved
    // This allows Boards.js to register a callback that syncs its items state
    const onSubItemMoveRef = useRef(null);

    // Register a callback to be called when sub-items are moved between parents
    const setOnSubItemMove = useCallback((callback) => {
        onSubItemMoveRef.current = callback;
    }, []);

    // Get sub-items for a specific parent
    const getSubItems = useCallback((parentId) => {
        return subItemsMap[parentId] || [];
    }, [subItemsMap]);

    // Set sub-items for a specific parent
    const setSubItems = (parentId, items) => {
        setSubItemsMap(prev => ({
            ...prev,
            [parentId]: items,
        }));
    };

    // Reorder sub-items within the same parent
    const reorderSubItems = useCallback((parentId, activeId, overId) => {
        let ranks = { prevRank: null, nextRank: null };

        setSubItemsMap(prev => {
            const items = [...(prev[parentId] || [])];
            const oldIndex = items.findIndex(item => item.id === activeId);
            const newIndex = items.findIndex(item => item.id === overId);

            if (oldIndex === -1 || newIndex === -1) return prev;

            const newArray = arrayMove(items, oldIndex, newIndex)

            // CALCULATE RANKS
            ranks.prevRank = newArray[newIndex - 1]?.stackRank || null;
            ranks.nextRank = newArray[newIndex + 1]?.stackRank || null;

            return {
                ...prev,
                [parentId]: newArray
            };
        });

        return ranks;
    }, []);

    // Move sub-item from one parent to another
    const moveSubItem = useCallback((subItemId, fromParentId, toParentId, newIndex = -1) => {
        let ranks = { prevRank: null, nextRank: null };
        let movedItemData = null;

        setSubItemsMap(prev => {
            const fromItems = [...(prev[fromParentId] || [])];
            const toItems = fromParentId === toParentId
                ? fromItems
                : [...(prev[toParentId] || [])];

            // Find and remove from source
            const itemIndex = fromItems.findIndex(item => item.id === subItemId);
            if (itemIndex === -1) return prev;

            const [movedItem] = fromItems.splice(itemIndex, 1);

            // Update parent reference
            const updatedItem = { ...movedItem, parentId: toParentId };
            movedItemData = updatedItem;

            // Insert at new position
            if (newIndex >= 0 && newIndex <= toItems.length) {
                toItems.splice(newIndex, 0, updatedItem);
            } else {
                toItems.push(updatedItem);
            }

            // CALCULATE RANKS IN DESTINATION
            const insertedIndex = newIndex >= 0 && newIndex <= toItems.length - 1 ? newIndex : toItems.length - 1;
            ranks.prevRank = toItems[insertedIndex - 1]?.stackRank || null;
            ranks.nextRank = toItems[insertedIndex + 1]?.stackRank || null;

            if (fromParentId === toParentId) {
                return {
                    ...prev,
                    [fromParentId]: toItems
                };
            }


            return {
                ...prev,
                [fromParentId]: fromItems,
                [toParentId]: toItems
            };
        });

        // Call the registered callback to sync parent work items state
        if (onSubItemMoveRef.current && movedItemData && fromParentId !== toParentId) {
            onSubItemMoveRef.current({
                subItem: movedItemData,
                fromParentId,
                toParentId,
                newIndex,
            });
        }

        return ranks;
    }, []);

    // Add a new sub-item to a parent
    const addSubItem = useCallback((parentId, subItem) => {
        setSubItemsMap(prev => ({
            ...prev,
            [parentId]: [...(prev[parentId] || []), { ...subItem, parentId }]
        }));
    }, []);

    // Remove a sub-item
    const removeSubItem = useCallback((parentId, subItemId) => {
        setSubItemsMap(prev => ({
            ...prev,
            [parentId]: (prev[parentId] || []).filter(item => item.id !== subItemId)
        }));
    }, []);

    // Update a sub-item
    const updateSubItem = useCallback((parentId, subItemId, updates) => {
        setSubItemsMap(prev => ({
            ...prev,
            [parentId]: (prev[parentId] || []).map(item =>
                item.id === subItemId ? { ...item, ...updates } : item
            )
        }));
    }, []);

    // Set a sub-item as loading
    const setSubItemLoading = useCallback((subItemId) => {
        setLoadingSubItemIds(prev => new Set([...prev, subItemId]));
    }, []);

    // Clear loading state for a sub-item
    const clearSubItemLoading = useCallback((subItemId) => {
        setLoadingSubItemIds(prev => {
            const next = new Set(prev);
            next.delete(subItemId);
            return next;
        });
    }, []);

    // Check if a sub-item is loading
    const isSubItemLoading = useCallback((subItemId) => {
        return loadingSubItemIds.has(subItemId);
    }, [loadingSubItemIds]);

    // Clear all sub-items (useful when data is refreshed)
    const clearAllSubItems = useCallback(() => {
        setSubItemsMap({});
    }, []);

    const value = {
        subItemsMap,
        getSubItems,
        setSubItems,
        reorderSubItems,
        moveSubItem,
        addSubItem,
        removeSubItem,
        updateSubItem,
        draggingSubItem,
        setDraggingSubItem,
        // Loading state
        loadingSubItemIds,
        setSubItemLoading,
        clearSubItemLoading,
        isSubItemLoading,
        // Callback registration for parent sync
        setOnSubItemMove,
        clearAllSubItems,
    };

    return (
        <SubItemsContext.Provider value={value}>
            {children}
        </SubItemsContext.Provider>
    );
};

export default SubItemsContext;
