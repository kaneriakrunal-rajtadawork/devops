'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { useDndContext } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Checkbox, Avatar } from '@mui/material';
import { User, GripVertical, SquareCheck, ClipboardCheck } from 'lucide-react';
import InputBase from '@/components/reusables/InputBase';
import SubItemMenu from './SubItemMenu';
import { STATES, WORKITEMTYPE } from '@/constants/common.constants';
import { useSubItems } from '../contexts/SubItemsContext';
import WorkItemTypeIcon from '../../../../ui/WorkItemTypeIcon';

/**
 * SortableSubItem - A draggable sub-item row for work item cards
 * Uses @dnd-kit/sortable for drag-and-drop functionality
 * Also acts as a drop target for cross-parent moves
 */
const SortableSubItem = ({
    subItem,
    parentItem,
    members,
    isEditing,
    editingTitle,
    onTitleChange,
    onTitleKeyDown,
    onTitleBlur,
    onOpen,
    onAssignTo,
    onEditTitle,
    onDelete,
    editInputRef,
    onSubItemCheck,
    index, // Position index for cross-parent drops
}) => {
    const { draggingSubItem, moveSubItem, setDraggingSubItem, isSubItemLoading } = useSubItems();

    // Check if this sub-item is currently loading
    const isLoading = isSubItemLoading(subItem.id);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
        isOver,
    } = useSortable({
        id: `subitem-${subItem.id}`,
        data: {
            type: 'subItem',
            subItem,
            parentId: parentItem.id,
            index, // Include index for cross-parent position detection
        },
        disabled: isLoading, // Disable drag when loading
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : isLoading ? 0.5 : 1,
        pointerEvents: isLoading ? 'none' : 'auto',
    };

    // Get initials from name
    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    // Get global drag context to detect cross-parent hover
    const { over, active } = useDndContext();

    // Check if the active drag is a sub-item
    const isSubItemDrag = active?.data?.current?.type === 'subItem';

    // Check if this sub-item is being hovered over (using global over state)
    const isThisItemOver = over?.id === `subitem-${subItem.id}`;

    // Check if we're not dragging this same item
    const isNotSelf = active?.id !== `subitem-${subItem.id}`;

    // Check if we can accept a drop from another card (used for click handlers)
    const canReceiveDrop = draggingSubItem &&
        draggingSubItem.fromParentId !== parentItem.id &&
        draggingSubItem.id !== subItem.id;

    // Check if this is a cross-parent drag (from a different card)
    const isCrossParentDrag = isSubItemDrag &&
        active?.data?.current?.parentId !== parentItem.id;

    // Show visual indicator ONLY for cross-parent drops
    // For same-parent reorder, dnd-kit's visual animation is sufficient
    const showDropIndicator = isCrossParentDrag && isThisItemOver && isNotSelf;

    const handleSubItemCheck = (e) => {
        onSubItemCheck({id:subItem.id,parentId:subItem.parentId,state:subItem.state === STATES.DONE ? STATES.TODO : STATES.DONE});
    }

    // Handle click to drop at this position
    const handleDropAtPosition = (e) => {
        e.stopPropagation();
        if (canReceiveDrop) {
            moveSubItem(
                draggingSubItem.id,
                draggingSubItem.fromParentId,
                parentItem.id,
                index // Insert at this position
            );
            setDraggingSubItem(null);
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...(isLoading ? {} : listeners)}
            onClick={canReceiveDrop ? handleDropAtPosition : undefined}
            onMouseUp={canReceiveDrop ? handleDropAtPosition : undefined}
            className={`flex items-center ${isLoading ? 'cursor-wait' : 'cursor-grab active:cursor-grabbing'} hover:bg-gray-100 transition-colors h-7 group/subitem ${isDragging ? 'bg-blue-50 shadow-sm rounded opacity-50' : ''} ${showDropIndicator ? 'border-t-2 border-blue-500' : ''} ${isLoading ? 'bg-gray-50' : ''}`}
        >

            {/* Checkbox */}
            <Checkbox
                checked={subItem.state === STATES.DONE}
                size='small'
                sx={{ p: 0, mr: 0.5 }}
                id={`checkbox-${subItem.id}`}
                onClick={(e) => {
                    e.stopPropagation();
                    handleSubItemCheck(e);
                }}
            />

            {/* Work Item Type Icon */}
            <WorkItemTypeIcon type={subItem.type} size={18} />

            {/* Assignee Avatar */}
            <Avatar
                sx={{
                    width: 20,
                    height: 20,
                    fontSize: '0.625rem',
                    ml: 1,
                    bgcolor: subItem.assignedUser ? '#3b82f6' : '#9ca3af'
                }}
            >
                {subItem.assignedUser?.name
                    ? getInitials(subItem.assignedUser.name)
                    : <User size={12} />
                }
            </Avatar>

            

            {/* Title (editable or static) */}
            {isEditing ? (
                <InputBase
                    ref={editInputRef}
                    size="sm"
                    type='text'
                    autoFocus
                    value={editingTitle}
                    onChange={onTitleChange}
                    onKeyDown={onTitleKeyDown}
                    onBlur={onTitleBlur}
                    sx={{ flex: 1, ml: 1, fontWeight: 500 }}
                    onClick={(e) => e.stopPropagation()}
                />
            ) : (
                <span
                    className="flex-1 text-xs font-medium text-gray-900 ml-2 hover:underline truncate"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!canReceiveDrop) {
                            onOpen?.(subItem);
                        }
                    }}
                >
                    {subItem.title}
                </span>
            )}

            {/* Menu */}
            <SubItemMenu
                subItem={subItem}
                members={members}
                onOpen={onOpen}
                onAssignTo={onAssignTo}
                onEditTitle={onEditTitle}
                onDelete={onDelete}
            />
        </div>
    );
};

export default SortableSubItem;
