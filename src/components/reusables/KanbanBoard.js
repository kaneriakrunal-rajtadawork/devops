'use client';

import React from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { Loader2 } from 'lucide-react';

/**
 * KanbanBoard - A generic, reusable Kanban board component
 * 
 * This component can be used with ANY data type, not just work items.
 * Simply provide your columns, items, and a render function for cards.
 * 
 * @example
 * <KanbanBoard
 *   columns={[{ id: 'todo', title: 'To Do' }, { id: 'done', title: 'Done' }]}
 *   items={{ todo: [...], done: [...] }}
 *   renderColumn={(column, items, props) => <MyColumn {...props} />}
 *   renderCard={(item, isDragging) => <MyCard item={item} />}
 *   onDragEnd={(result) => handleDragEnd(result)}
 * />
 */
const KanbanBoard = ({
    // Columns configuration
    columns = [],

    // Items grouped by column ID
    items = {},

    // Drag-and-drop configuration from hook
    sensors,
    collisionDetection,
    onDragStart,
    onDragOver,
    onDragEnd,
    onDragCancel,

    // Active drag state
    activeId = null,
    activeItem = null,
    overId = null,

    // Disable drag and drop when filters are active
    isDragDisabled = false,

    // Render functions (for customization)
    renderColumn,  // (column, columnItems, columnProps) => React.Node
    renderCard,    // (item, isDragging) => React.Node
    renderDragOverlay, // (activeItem) => React.Node (optional, falls back to renderCard)

    // Loading state
    isLoading = false,
    loadingMessage = 'Loading...',

    // Additional props to pass to columns
    columnProps = {},

    // Styling
    className = '',
    containerClassName = '',
    columnsClassName = '',
}) => {
    // Default card renderer using renderCard
    const defaultDragOverlay = activeItem => renderCard?.(activeItem, true);
    const renderActiveOverlay = renderDragOverlay || defaultDragOverlay;

    // Board content without DndContext wrapper
    const boardContent = (
        <div className="flex h-full">
            {columns.map((column, index) => {
                const columnItems = items[column.id] || [];
                return renderColumn(
                    column,
                    columnItems,
                    {
                        key: column.id,
                        index,
                        isOver: overId === column.id,
                        ...columnProps,
                    }
                );
            })}
        </div>
    );

    return (
        <div className={`flex-1 overflow-hidden relative ${className}`}>
            {/* Loading overlay */}
            {isLoading && (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-md">
                        <Loader2 size={20} className="animate-spin text-blue-600" />
                        <span className="text-sm text-gray-600">{loadingMessage}</span>
                    </div>
                </div>
            )}

            <div className={`h-full bg-white shadow-sm rounded-md ${containerClassName}`}>
                <div className={`h-full overflow-x-auto p-4 ${columnsClassName}`}>
                    {/* If drag is disabled, render board without DndContext */}
                    {isDragDisabled ? (
                        boardContent
                    ) : (
                        /* Otherwise, wrap with DndContext for drag and drop functionality */
                        <DndContext
                            sensors={sensors}
                            collisionDetection={collisionDetection}
                            onDragStart={onDragStart}
                            onDragOver={onDragOver}
                            onDragEnd={onDragEnd}
                            onDragCancel={onDragCancel}
                        >
                            {boardContent}

                            <DragOverlay
                                dropAnimation={{
                                    duration: 200,
                                    easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
                                }}
                            >
                                {activeId && activeItem ? renderActiveOverlay(activeItem) : null}
                            </DragOverlay>
                        </DndContext>
                    )}
                </div>
            </div>
        </div>
    );
};

export default KanbanBoard;
