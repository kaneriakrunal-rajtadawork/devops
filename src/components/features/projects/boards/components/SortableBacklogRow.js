'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/**
 * SortableBacklogRow - A draggable table row for the backlog
 * Drag can be initiated from anywhere on the row
 */
const SortableBacklogRow = ({
    id,
    children,
    isChild = false,
    isHovered = false,
    onMouseEnter,
    onMouseLeave,
    onClick,
    onContextMenu,
    overId,
    disabled = false, // Disable drag and drop when true
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id,
        data: {
            type: 'backlogItem',
        },
        disabled, // Pass disabled to useSortable
    });

    // Restrict to vertical movement only (set x to 0)
    const restrictedTransform = transform ? {
        ...transform,
        x: 0, // Prevent horizontal movement
    } : null;

    const style = {
        transform: CSS.Transform.toString(restrictedTransform),
        // Only animate during drag, not after drop to prevent double animation
        transition: isDragging ? transition : undefined,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 999 : 'auto',
        position: isDragging ? 'relative' : undefined,
    };

    // Show blue line indicator when another item is dragged over this one
    const showDropIndicator = overId === id && !isDragging && !disabled;

    return (
        <tr
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...(!disabled && listeners)} // Only apply listeners when not disabled
            onClick={onClick}
            onContextMenu={onContextMenu}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={`
                border-b border-gray-100 cursor-default transition-colors
                hover:bg-blue-50
                ${isChild ? 'bg-gray-50' : 'bg-white'}
                ${isDragging ? 'bg-blue-100 shadow-lg' : ''}
                ${showDropIndicator ? 'border-t-2 border-t-blue-500' : ''}
            `}
        >
            {children}
        </tr>
    );
};

export default SortableBacklogRow;
