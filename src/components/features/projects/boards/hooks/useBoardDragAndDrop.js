'use client';

import { useState, useCallback } from 'react';
import {
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    pointerWithin,
    rectIntersection,
    closestCorners,
} from '@dnd-kit/core';
import { STATES } from '@/constants/common.constants';

/**
 * Custom hook for board drag-and-drop functionality
 * Handles both WorkItemCard and SubItem drags
 * 
 * @param {Object} options
 * @param {Object} options.items - Items state grouped by column
 * @param {Function} options.setItems - Items state setter
 * @param {Array} options.boardColumns - Column configuration
 * @param {Function} options.reorderWorkItem - API mutation for updating work items
 * @param {Function} options.showError - Error modal trigger
 * @param {Object} options.subItemsContext - SubItems context (draggingSubItem, setDraggingSubItem, reorderSubItems, moveSubItem)
 * @param {String} options.projectId - Projectid of current selected to be passed
 * @param {String} options.repoId - RepoId of current selected to be passed
 */
const useBoardDragAndDrop = ({
    items,
    setItems,
    boardColumns,
    reorderWorkItem,
    showError,
    subItemsContext,
    projectId,
    repoId
}) => {
    // Drag state
    const [activeId, setActiveId] = useState(null);
    const [activeItem, setActiveItem] = useState(null);
    const [overId, setOverId] = useState(null);
    const [updatingItemId, setUpdatingItemId] = useState(null);

    const { draggingSubItem, setDraggingSubItem, reorderSubItems, moveSubItem } = subItemsContext;

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

    // Custom collision detection for better drop targeting
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

        // Finally use closest corners
        return closestCorners(args);
    }, []);

    const handleDragStart = useCallback((event) => {
        const { active } = event;
        const dragType = active.data.current?.type;

        // Handle sub-item drag start
        if (dragType === 'subItem') {
            const { subItem, parentId } = active.data.current;
            setDraggingSubItem({
                id: subItem.id,
                fromParentId: parentId,
                subItem
            });
            // Set activeId and activeItem for DragOverlay to work
            setActiveId(active.id);
            setActiveItem(subItem);
            return;
        }

        // Handle work item (card) drag start
        setActiveId(active.id);

        // Find the active item
        const columnId = active.data.current?.columnId;
        if (columnId && items[columnId]) {
            const item = items[columnId].find(item => item.id === active.id);
            setActiveItem(item);
        }
    }, [items, setDraggingSubItem]);

    const handleDragOver = useCallback((event) => {
        const { over } = event;
        setOverId(over?.id || null);
    }, []);

    const handleDragEnd = useCallback(async (event) => {
        const { active, over } = event;
        setActiveId(null);
        setActiveItem(null);
        setOverId(null);

        if (!over) {
            if (draggingSubItem) setDraggingSubItem(null);
            return;
        }

        const dragType = active.data.current?.type;

        // --- 1. SUB-ITEM LOGIC (Preserved) ---
        if (dragType === 'subItem') {
            const overType = over.data.current?.type;
            const fromParentId = active.data.current?.parentId;
            const activeSubItemId = active.data.current?.subItem?.id;
            let rankResults = null;
            let parentId = null;

            if (overType === 'subItem') {
                const toParentId = over.data.current?.parentId;
                parentId = toParentId;
                const overSubItemId = over.data.current?.subItem?.id;
                if (fromParentId === toParentId) {
                    rankResults = reorderSubItems(fromParentId, activeSubItemId, overSubItemId);
                } else {
                    const overIndex = over.data.current?.index || 0;
                    rankResults = moveSubItem(activeSubItemId, fromParentId, toParentId, overIndex);
                }
            } else if (overType === 'workItem') {
                const toParentId = over.id;
                parentId = toParentId;
                if (toParentId !== fromParentId) {
                    rankResults = moveSubItem(activeSubItemId, fromParentId, toParentId, -1);
                }
            }

            //If parent id is null then not drag it.
            if(parentId === null) return;

            setDraggingSubItem(null);

            await reorderWorkItem({
                data:{
                    workItemId:activeSubItemId,
                    project:projectId,
                    repo:repoId,
                    parentId,
                    ...rankResults
                }
            },{
                onError: (err) => {
                    setUpdatingItemId(null);
                    setItems(prevItems); // Rollback
                    showError(err?.response?.data?.message || err?.message || 'Failed to update work item state.');
                }
            })

            // await updateWorkItem({
            //     id: activeSubItemId,
            //     data: { ...rankResults, parentId }
            // })
            return;
        }


        // --- 2. WORK ITEM (CARD) LOGIC ---
        const activeColumnId = active.data.current?.columnId;
        const activeIdValue = active.id;
        const overIdValue = over.id;


        const isOverColumn = boardColumns.some(c => c.id === overIdValue);
        let overColumnId = isOverColumn ? overIdValue : null;
        if (!isOverColumn) {
            for (const [columnId, columnItems] of Object.entries(items)) {
                if (columnItems.find(item => item.id === overIdValue)) {
                    overColumnId = columnId;
                    break;
                }
            }
        }

        if (!activeColumnId || !overColumnId || !items[activeColumnId]) return;

        // IMPORTANT: Variables declared at this scope so they are available for the API call
        let prevRank = null;
        let nextRank = null;
        let finalInsertIndex = 0;

        // --- CASE A: SAME COLUMN REORDER ---
        if (activeColumnId === overColumnId) {
            const columnItems = [...items[activeColumnId]];
            const oldIndex = columnItems.findIndex(item => item.id === activeIdValue);
            const newIndex = isOverColumn
                ? columnItems.length - 1
                : columnItems.findIndex(item => item.id === overIdValue);

            if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

            // Calculate ranks BEFORE state update
            const [movedItem] = columnItems.splice(oldIndex, 1);
            columnItems.splice(newIndex, 0, movedItem);

            prevRank = columnItems[newIndex - 1]?.stackRank || null;
            nextRank = columnItems[newIndex + 1]?.stackRank || null;

            const prevItems = items;

            // Optimistic UI Update
            setItems(prev => ({
                ...prev,
                [activeColumnId]: columnItems
            }));

            await reorderWorkItem({
                data:{
                    workItemId:activeIdValue,
                    project:projectId,
                    repo:repoId,
                    prevRank,
                    nextRank
                }
            }, {
                onSuccess: () => setUpdatingItemId(null),
                onError: (err) => {
                    setUpdatingItemId(null);
                    setItems(prevItems); // Rollback
                    showError(err?.response?.data?.message || err?.message || 'Failed to update work item state.');
                }
            })

            // await updateWorkItem({
            //     id: activeIdValue,
            //     data: { prevRank, nextRank }
            // }, {
            //     onSuccess: () => setUpdatingItemId(null),
            //     onError: (err) => {
            //         setUpdatingItemId(null);
            //         setItems(prevItems); // Rollback
            //         showError(err?.response?.data?.message || err?.message || 'Failed to update work item state.');
            //     }
            // });
            

        } else {
            // --- CASE B: DIFFERENT COLUMN MOVE ---
            const state = Object.values(STATES).find(
                (state) => state.toLowerCase() === overColumnId?.toLowerCase()
            );
            if (!state) return;

            const previousItems = { ...items };
            const destColumn = [...(items[overColumnId] || [])];

            // Calculate insert index BEFORE updating state
            if (isOverColumn) {
                finalInsertIndex = destColumn.length;
            } else {
                const idx = destColumn.findIndex(item => item.id === overIdValue);
                finalInsertIndex = idx >= 0 ? idx : destColumn.length;
            }

            // Calculate ranks BEFORE updating state
            // Since the item isn't in destColumn yet, 
            // prev is at finalInsertIndex - 1, and next is at finalInsertIndex
            prevRank = destColumn[finalInsertIndex - 1]?.stackRank || null;
            nextRank = destColumn[finalInsertIndex]?.stackRank || null;

            setUpdatingItemId(activeIdValue);

            // Optimistic UI Update
            setItems(prev => {
                const activeItemData = prev[activeColumnId].find(item => item.id === activeIdValue);
                if (!activeItemData) return prev;

                const columnTitle = boardColumns.find(c => c.id === overColumnId)?.title || overColumnId;
                const updatedItem = {
                    ...activeItemData,
                    state: columnTitle,
                    status: columnTitle
                };

                const newSourceColumn = prev[activeColumnId].filter(item => item.id !== activeIdValue);
                const newDestColumn = [...destColumn];
                newDestColumn.splice(finalInsertIndex, 0, updatedItem);

                return {
                    ...prev,
                    [activeColumnId]: newSourceColumn,
                    [overColumnId]: newDestColumn
                };
            });

            // Call API
            await reorderWorkItem({
                data:{
                    workItemId:activeIdValue,
                    project:projectId,
                    repo:repoId,
                    prevRank,
                    nextRank,
                    state
                }
            }, {
                onSuccess: () => setUpdatingItemId(null),
                onError: (err) => {
                    setUpdatingItemId(null);
                    setItems(prevItems); // Rollback
                    showError(err?.response?.data?.message || err?.message || 'Failed to update work item state.');
                }
            })
            // await updateWorkItem({
            //     id: activeIdValue,
            //     data: {
            //         state: state,
            //         prevRank,
            //         nextRank
            //     }
            // }, {
            //     onSuccess: () => setUpdatingItemId(null),
            //     onError: (err) => {
            //         setUpdatingItemId(null);
            //         setItems(previousItems); // Rollback
            //         showError(err?.response?.data?.message || err?.message || 'Failed to update work item state.');
            //     }
            // });

        }
    }, [items, setItems, boardColumns, reorderWorkItem, showError, draggingSubItem, setDraggingSubItem, reorderSubItems, moveSubItem, STATES]);

    const handleDragCancel = useCallback(() => {
        setActiveId(null);
        setActiveItem(null);
        setOverId(null);
        if (draggingSubItem) {
            setDraggingSubItem(null);
        }
    }, [draggingSubItem, setDraggingSubItem]);

    return {
        // State
        activeId,
        activeItem,
        overId,
        updatingItemId,
        setUpdatingItemId,

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

export default useBoardDragAndDrop;
