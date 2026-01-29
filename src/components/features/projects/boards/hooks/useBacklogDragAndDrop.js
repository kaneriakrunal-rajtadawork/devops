'use client';

import { useState, useCallback } from 'react';
import {
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    pointerWithin,
    rectIntersection,
    closestCenter,
} from '@dnd-kit/core';

/**
 * Custom hook for backlog vertical drag-and-drop functionality
 * Handles reordering of work items in the backlog table
 * 
 * @param {Object} options
 * @param {Array} options.items - Work items array
 * @param {Function} options.onReorder - Callback when items are reordered (oldIndex, newIndex)
 * @param {Function} options.showError - Error modal trigger
 */
const useBacklogDragAndDrop = ({
    items,
    onReorder,
    showError,
}) => {
    // Drag state
    const [activeId, setActiveId] = useState(null);
    const [activeItem, setActiveItem] = useState(null);
    const [overId, setOverId] = useState(null);

    // Sensors for better drag experience
    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 8, // 8px movement required before drag starts
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 200, // 200ms delay on touch devices
                tolerance: 8,
            },
        })
    );

    // Custom collision detection for vertical list
    const collisionDetection = useCallback((args) => {
        // First try pointer-within for precise detection
        const pointerCollisions = pointerWithin(args);
        if (pointerCollisions.length > 0) {
            return pointerCollisions;
        }

        // Fall back to rect intersection
        const rectCollisions = rectIntersection(args);
        if (rectCollisions.length > 0) {
            return rectCollisions;
        }

        // Finally use closest center for vertical lists
        return closestCenter(args);
    }, []);

    const handleDragStart = useCallback((event) => {
        const { active } = event;
        setActiveId(active.id);

        // Find the active item from items array
        const item = items.find(item => item.id === active.id);
        setActiveItem(item);
    }, [items]);

    const handleDragOver = useCallback((event) => {
        const { over } = event;
        setOverId(over?.id || null);
    }, []);

    const handleDragEnd = useCallback(async (event) => {
        const { active, over } = event;

        setActiveId(null);
        setActiveItem(null);
        setOverId(null);

        if (!over || active.id === over.id) {
            return;
        }

        // Find indices
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);

        if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
            return;
        }

        // Call the reorder callback
        try {
            await onReorder?.(oldIndex, newIndex, active.id, over.id);
        } catch (err) {
            showError?.(err?.message || 'Failed to reorder work item');
        }
    }, [items, onReorder, showError]);

    const handleDragCancel = useCallback(() => {
        setActiveId(null);
        setActiveItem(null);
        setOverId(null);
    }, []);

    return {
        // State
        activeId,
        activeItem,
        overId,

        // DndKit config
        sensors,
        collisionDetection,

        // Handlers
        handleDragStart,
        handleDragOver,
        handleDragEnd,
        handleDragCancel,
    };
};

export default useBacklogDragAndDrop;
