'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { useDndContext } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Loader2, Plus, SquareCheck, ClipboardCheck } from 'lucide-react';
import { Checkbox } from '@mui/material';
import CardMenu from './CardMenu';
import AssigneeDropdown from './AssigneeDropdown';
import StateDropdown from './StateDropdown';
import SortableSubItem from './SortableSubItem';
import InputBase from '@/components/reusables/InputBase';
import { useCreateWorkItem, useUpdateWorkItem, getGetBoardWorkItemsQueryKey, getGetBoardWorkItemsQueryOptions, useDeleteWorkItem, deleteWorkItem } from '@/api-client';
import { useErrorModal } from '../hooks/useErrorModal';
import { useSubItems } from '../contexts/SubItemsContext';
import { useSelector } from 'react-redux';
import { STATES, WORKITEMTYPE,WORKITEMTYPE_COLORS } from '@/constants/common.constants';
import { useQueryClient } from '@tanstack/react-query';
import WorkItemTypeIcon from '@/components/ui/WorkItemTypeIcon';
import { workItemKeys } from '@/constants/queryKeys';

// Work item type icons
const WORK_ITEM_ICONS = {
    epic: { icon: '👑', color: WORKITEMTYPE_COLORS.epic, bg: 'bg-purple-50' },
    task: { icon: '📋', color: WORKITEMTYPE_COLORS.task, bg: 'bg-blue-50' },
    issue: { icon: '🐛', color: WORKITEMTYPE_COLORS.issue, bg: 'bg-red-50' },
    default: { icon: '📄', color: 'border-l-gray-400', bg: 'bg-gray-50' }
};

const getWorkItemConfig = (type) => {
    const typeLower = (type || '').toLowerCase();
    return WORK_ITEM_ICONS[typeLower] || WORKITEMTYPE_COLORS[typeLower];
};

const WorkItemCard = ({
    item,
    isDragging,
    onUpdateItem,
    onDeleteItem,
    columns,
    onClick,
    members = [], // Pre-fetched members list from parent
    isUpdatingFromDrag = false, // Whether this card is being updated via drag operation
    setUpdatingItemId, // Callback to set updating item ID at parent level
    showConfirm, // Confirm modal hook for delete confirmation
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(item.title);
    const [isSubItemsExpanded, setIsSubItemsExpanded] = useState(false);
    const [isAddingSubItem, setIsAddingSubItem] = useState(false);
    const [newSubItemTitle, setNewSubItemTitle] = useState('');
    const titleInputRef = useRef(null);
    const subItemInputRef = useRef(null);
    const { selectedRepo } = useSelector((state) => state.repo);
    const project = useSelector((state) => state.project);
    const queryClient = useQueryClient();

    // Sub-item editing state
    const [editingSubItemId, setEditingSubItemId] = useState(null);
    const [editingSubItemTitle, setEditingSubItemTitle] = useState('');
    const editSubItemInputRef = useRef(null);

    // Sub-items context
    const { getSubItems, setSubItems, moveSubItem, draggingSubItem, setDraggingSubItem, updateSubItem, setSubItemLoading, clearSubItemLoading } = useSubItems();
    const localSubItems = getSubItems(item.id);

    // Drag context for hover detection
    const { over, active } = useDndContext();

    // Determine sub-item type based on parent
    const subItemType = item.type === WORKITEMTYPE.EPIC ? WORKITEMTYPE.ISSUE : WORKITEMTYPE.TASK;

    // Check if this card can receive a sub-item from another card
    const canReceiveSubItemDrop = draggingSubItem && draggingSubItem.fromParentId !== item.id;

    // Check if this card is being hovered during sub-item drag
    const isThisCardHovered = over?.id === item.id &&
        active?.data?.current?.type === 'subItem' &&
        active?.data?.current?.parentId !== item.id;

    // Use global error modal
    const { showError } = useErrorModal();

    // Single update work item API hook
    const { mutateAsync: updateWorkItem } = useUpdateWorkItem();

    //Create work item API hook
    const { mutateAsync: createWorkItem, isPending: isCreatingWorkItem, isError: isCreatingWorkItemError, error: createWorkItemError } = useCreateWorkItem();

    //Delete work item API hook
    // const {mutateAsync:deleteWorkItem, isPending:isDeletingWorkItem, isError: isDeletingWorkItemError, error: deleteWorkItemError} = useDeleteWorkItem();

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging: isCurrentlyDragging
    } = useSortable({
        id: item.id,
        data: {
            type: 'workItem',
            item,
            columnId: (item.state || 'new').toLowerCase()
        }
    });

    
    const config = getWorkItemConfig(item.type);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: transition || 'transform 200ms ease',
        opacity: isCurrentlyDragging ? 0.5 : 1,
        cursor: isCurrentlyDragging ? 'grabbing' : 'grab',
        borderLeftColor: config.color
    };


    useEffect(() => {
        if (isEditing && titleInputRef.current) {
            titleInputRef.current.focus();
            titleInputRef.current.select();
        }
    }, [isEditing]);


    // Focus add sub-item input when opening
    useEffect(() => {
        if (isAddingSubItem && subItemInputRef.current) {
            subItemInputRef.current.focus();
        }
    }, [isAddingSubItem]);

    useEffect(() => {
        if (Array.isArray(item.children)) {
            setSubItems(item.id, item.children);
        }
    }, [item.id, item.children]);

    //Api Response handlers for workitem
    const handleUpdateWorkItemSuccess = (response) => {
        const updatedData = response?.data?.data;
        if (updatedData) {
            onUpdateItem?.({
                ...item,
                ...updatedData
            });
        }
    };

    const handleUpdateWorkItemError = (error, previousItem) => {
        if (previousItem) {
            onUpdateItem?.(previousItem);
        }
        const errMsg = error?.response?.data?.message || error?.message || 'Failed to move work item. Please try again.';
        showError(errMsg);
    };


    const handleWorkItemMutate = async (changes) => {
        // 1. Snapshot previous state for rollback
        const previousItem = { ...item };


        // 2. Set loading state
        setUpdatingItemId?.(item.id);

        //*When changing the state then we are passing position to be passed to backend only so no need to use it in Optimistic update for prevent problems
        const {position, ...uiChanges} = changes;
 
        // 3. Optimistically update UI
        onUpdateItem?.({
            ...item,
            ...uiChanges,
        });

        try {
            // 4. Call API
            const response = await updateWorkItem({
                id: item.id,
                data: changes
            });

            handleUpdateWorkItemSuccess(response);

            queryClient.invalidateQueries({queryKey: workItemKeys.detail(item.id)});
            queryClient.invalidateQueries({queryKey:workItemKeys.repo(project.id, selectedRepo?.id)});
        } catch (error) {
            handleUpdateWorkItemError(error, previousItem);
        } finally {
            setUpdatingItemId?.(null);
        }
    }

    const handleSubItemMutate = async (subItemId, changes) => {

        if (!subItemId) return;

        // Find the original sub-item to compare
        const originalSubItem = localSubItems.find(si => si.id === subItemId);

        if (!originalSubItem) return;

        // 1. Snapshot previous state for rollback
        const previousSubItems = localSubItems;

        // 3. Optimistically update UI
        updateSubItem(item.id, subItemId, changes);

        //Set loading state
        setSubItemLoading(subItemId);

        try {
            // 4. Call API
            await updateWorkItem({
                id: subItemId,
                data: changes
            });

            queryClient.invalidateQueries({queryKey: workItemKeys.detail(item.id)});
            queryClient.invalidateQueries({queryKey:workItemKeys.repo(project.id, selectedRepo?.id)});

            handleSubItemSuccess(changes, subItemId, true);
        } catch (error) {
            console.error("Error in handleSubItemMutate function", error);
            handleSubItemError(error, previousSubItems);
        } finally {
            clearSubItemLoading(subItemId);
        }

    }

    const handleEditTitle = (e) => {
        e?.stopPropagation();
        setIsEditing(true);
    };

    const handleTitleChange = (e) => {
        setEditedTitle(e.target.value);
    };

    const handleTitleSubmit = () => {
        if (editedTitle.trim() !== '' && editedTitle !== item.title) {
            onUpdateItem?.({
                ...item,
                title: editedTitle.trim()
            });
        }
        setIsEditing(false);
    };

    const handleTitleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleTitleSubmit();
        } else if (e.key === 'Escape') {
            setIsEditing(false);
            setEditedTitle(item.title);
        }
    };

    const handleMoveToColumn = async (columnId) => {
        const state = Object.values(STATES).find((s) => s.toLowerCase() === columnId?.toLowerCase());

        // If state is not found, don't proceed
        if (!state) {
            console.error('Invalid state:', columnId);
            return;
        }

        await handleWorkItemMutate({
            state: state,
            position:"bottom"
        });
    };

    const handleAddUserStory = () => {
        console.log('Add user story for:', item.id);
    };

    const handleAddTest = () => {
        console.log('Add test for:', item.id);
    };

    const handleMoveToIteration = (iterationId) => {
        onUpdateItem?.({
            ...item,
            iteration: iterationId
        });
    };

    const handleOpen = () => {
        onClick?.(item);
    };

    const handleCardClick = (e) => {
        e.stopPropagation();
        if (!isEditing) {
            onClick?.(item);
        }
    };


    const handleAssigneeChange = async (member) => {
        await handleWorkItemMutate({
            assignedTo: member?._id || null
        });
    };

    const handleStateChange = async (state) => {
        if (!state) {
            return;
        }
        await handleWorkItemMutate({ state, position:"bottom" })
    };

    // Handler for adding a new sub-item
    const handleAddSubItem = async () => {
        const title = newSubItemTitle.trim();
        if (!title) {
            setIsAddingSubItem(false);
            setNewSubItemTitle('');
            return;
        }

        const previousSubItems = localSubItems;

        // Create new sub-item with temp ID
        const newSubItem = {
            id: `sub-${item.id}-${Date.now()}`,
            title: title,
            type: subItemType,
            state: STATES.TODO,
            parentId: item.id,
            project: project?.id,
            repo: selectedRepo?.id
        };

        // Reset input early so user sees immediate feedback
        setIsAddingSubItem(false);
        setNewSubItemTitle('');

        // Add to local state
        setSubItems(item.id, [...localSubItems, newSubItem]);

        // Set loading state for the new sub-item
        setSubItemLoading(newSubItem.id);

        try {
            const createdSubItem = await createWorkItem({
                data: {
                    title,
                    type: newSubItem.type,
                    state: newSubItem.state,
                    parentId: newSubItem.parentId,
                    project: newSubItem.project,
                    repo: newSubItem.repo
                }
            });

            queryClient.invalidateQueries({queryKey:workItemKeys.repo(newSubItem.project, newSubItem.repo)});

            handleSubItemSuccess({ ...newSubItem, id: createdSubItem.data.data.id }, newSubItem.id, true);

        } catch (error) {
            console.error("Error in handleSubItem function", error);
            handleSubItemError(error, previousSubItems);
        } finally {
            clearSubItemLoading(newSubItem.id);
        }
    };

    // Handle dropping sub-item on this card
    const handleCardSubItemDrop = (e) => {
        if (canReceiveSubItemDrop) {
            e?.stopPropagation();
            e?.preventDefault();
            moveSubItem(
                draggingSubItem.id,
                draggingSubItem.fromParentId,
                item.id,
                localSubItems.length
            );
            setDraggingSubItem(null);
            setIsSubItemsExpanded(true);
        }
    };

    const onSubItemTitleDiscard = () => {
        setEditingSubItemId(null);
        setEditingSubItemTitle('');
    }

    const handleSubItemSuccess = (response, tempSubItemId, passUpdatesDirectly = false) => {
        if (response) {
            updateSubItem(item.id, tempSubItemId, passUpdatesDirectly ? response : response?.data?.data);
        }
    };

    const handleSubItemError = (error, previousSubItems) => {
        handleUpdateWorkItemError(error);
        if (previousSubItems) {
            setSubItems(item.id, previousSubItems);
        }
    };

    const onSubItemTitleSave = async () => {
        const newTitle = editingSubItemTitle.trim();

        // Find the original sub-item to compare
        const originalSubItem = localSubItems.find(si => si.id === editingSubItemId);

        // If no sub-item found or title is empty, just discard
        if (!originalSubItem || !newTitle) {
            onSubItemTitleDiscard();
            return;
        }

        // If title is unchanged, just discard without API call
        if (newTitle === originalSubItem.title) {
            onSubItemTitleDiscard();
            return;
        }

        await handleSubItemMutate(originalSubItem.id, { title: newTitle });

        onSubItemTitleDiscard();
    }

    const onSubItemCheckUpdate = async (data) => {
        await handleSubItemMutate(data.id, { state: data.state });
    }

    const onSubItemMemberAssign = async (subItem, member) => {
        const memberId = member ? member._id : null;
        // Pass both assignedTo (ID for API) and assignedUser (full object for UI)
        await handleSubItemMutate(subItem.id, {
            assignedTo: memberId,
            assignedUser: member ? { ...member, id: member?._id } : null  // Pass full member object for Avatar display
        });
    }

    const onSubItemDelete = async (subItemId) => {
        if (!subItemId) return;

        const updatedSubItems = localSubItems.filter((si) => si.id !== subItemId);

        try {
            await deleteWorkItem(subItemId);
            queryClient.invalidateQueries({queryKey:workItemKeys.repo(project.id,selectedRepo?.id)});

            setSubItems(item.id, updatedSubItems);
        } catch (error) {
            console.error("Error in onSubItemDelete function", error);
            handleSubItemError(error);
        }


    }

    // Delete confirmation handler for work items
    const handleDeleteWorkItemWithConfirm = () => {
        if (!showConfirm) return;

        showConfirm({
            title: 'Delete Work Item',
            message: `Are you sure you want to delete "${item.title}"? This action cannot be undone.`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            type: 'danger',
            onConfirm: async () => {
                await onDeleteItem?.(item.id);
            },
        });
    };

    // Delete confirmation handler for sub-items
    const handleDeleteSubItemWithConfirm = (subItem) => {

        if (!showConfirm) return;

        showConfirm({
            title: 'Delete Work-item',
            message: `Are you sure you want to delete "${subItem.title}"? This action cannot be undone.`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            type: 'danger',
            onConfirm: async () => {
                await onSubItemDelete(subItem.id);
            },
        });
    };

    const assigneeName = item.assignedUser?.name || 'Unassigned';
    const assigneeInitials = assigneeName !== 'Unassigned'
        ? assigneeName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : '?';

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...(isSubItemsExpanded ? {} : listeners)}
            onClick={canReceiveSubItemDrop ? handleCardSubItemDrop : handleCardClick}
            onMouseUp={canReceiveSubItemDrop ? handleCardSubItemDrop : undefined}
            className={`
        mb-2 bg-white rounded-md border-l-4 ${config.color}
        shadow-sm hover:shadow-md
        transition-all duration-200 ease-in-out
        touch-none group relative
        ${isCurrentlyDragging || isDragging ? 'shadow-xl ring-2 ring-blue-400 ring-opacity-50 scale-[1.02]' : ''}
        ${isThisCardHovered && !isSubItemsExpanded ? 'border-b-2 border-b-blue-500' : ''}
      `}
        >
            {/* Loading overlay when updating */}
            {isUpdatingFromDrag && (
                <div className="absolute inset-0 bg-white/70 rounded-md flex items-center justify-center z-10">
                    <Loader2 size={24} className="animate-spin text-blue-600" />
                </div>
            )}
            <div
                className={`p-3 ${isSubItemsExpanded ? 'cursor-grab active:cursor-grabbing' : ''}`}
                {...(isSubItemsExpanded ? listeners : {})}
            >
                {/* Header: Icon + Title + Menu */}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                        <WorkItemTypeIcon type={item.type} size={18}/>
                        {item?.number && <p className='text-sm text-gray-600 font-semibold'>{item.number}</p>}
                        {isEditing ? (
                            <input
                                ref={titleInputRef}
                                type="text"
                                value={editedTitle}
                                onChange={handleTitleChange}
                                onBlur={handleTitleSubmit}
                                onKeyDown={handleTitleKeyDown}
                                onClick={(e) => e.stopPropagation()}
                                onPointerDown={(e) => e.stopPropagation()}
                                className="flex-1 text-sm border border-blue-500 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        ) : (
                            <span
                                className="text-sm text-blue-600 hover:underline cursor-pointer break-all w-full overflow-hidden"
                                onDoubleClick={handleEditTitle}
                            >
                                {item.title}
                            </span>
                        )}
                    </div>
                    <div
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                        <CardMenu
                            onEditTitle={handleEditTitle}
                            onMoveToColumn={handleMoveToColumn}
                            onAddUserStory={handleAddUserStory}
                            onAddTest={handleAddTest}
                            onDelete={handleDeleteWorkItemWithConfirm}
                            onMoveToIteration={handleMoveToIteration}
                            onOpen={handleOpen}
                            columns={columns}
                            currentColumn={(item.state || 'new').toLowerCase()}
                            item={item}
                        />
                    </div>
                </div>

                {/* Status indicator */}
                <div className="mt-2 flex items-center text-xs text-gray-600">
                    <StateDropdown
                        currentState={item.state || 'To Do'}
                        onSelect={handleStateChange}
                    />
                </div>

                {/* Footer: Assignee + Tasks count */}
                <div className="mt-2 flex items-center justify-between">
                    <AssigneeDropdown
                        members={members}
                        selectedMember={item.assignedUser}
                        onSelect={handleAssigneeChange}
                    />
                    {(item.type === WORKITEMTYPE.EPIC || item.type === WORKITEMTYPE.ISSUE) && (
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsSubItemsExpanded(!isSubItemsExpanded);
                            }}
                            className="text-xs cursor-pointer hover:bg-gray-100 px-2 py-1 transition-colors text-gray-500 flex items-center"
                        >
                            <ClipboardCheck color='green' size={16} />
                            {
                                localSubItems?.length > 0 && (
                                    <span className="ml-1">{localSubItems?.filter((si) => si?.state === STATES.DONE)?.length}/{localSubItems.length}</span>
                                )
                            }
                        </div>
                    )}
                </div>

                {/* Sub Items Section (expanded) */}
                {isSubItemsExpanded && (
                    <div
                        className="mt-2 pt-2 border-t border-gray-100"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        onMouseUp={(e) => e.stopPropagation()}
                    >
                        {/* Add Sub Item Button */}
                        <button
                            onClick={() => setIsAddingSubItem(true)}
                            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 transition-colors px-2 py-1 rounded w-fit text-xs cursor-pointer mb-2"
                        >
                            <Plus size={12} />
                            <span className="text-xs font-semibold">Add {subItemType}</span>
                        </button>

                        {/* Sub-items List with SortableContext */}
                        <section className="z-10 overflow-hidden">
                            <SortableContext
                                items={localSubItems.map(si => `subitem-${si.id}`)}
                                strategy={verticalListSortingStrategy}
                            >
                                {localSubItems.map((subItem, index) => (
                                    <SortableSubItem
                                        key={subItem.id}
                                        subItem={subItem}
                                        parentItem={item}
                                        members={members}
                                        index={index}
                                        isEditing={editingSubItemId === subItem.id}
                                        editingTitle={editingSubItemTitle}
                                        onTitleChange={(e) => setEditingSubItemTitle(e.target.value)}
                                        onTitleKeyDown={(e) => {
                                            if (e.key === "Escape" || e.key === "Enter") {
                                                onSubItemTitleSave();
                                            }
                                        }}
                                        onTitleBlur={onSubItemTitleSave}
                                        editInputRef={editSubItemInputRef}
                                        onOpen={(item) => onClick?.(item)}
                                        onAssignTo={(item, member) => {
                                            onSubItemMemberAssign(item, member);
                                        }}
                                        onEditTitle={(item) => {
                                            setEditingSubItemId(item.id);
                                            setEditingSubItemTitle(item.title);
                                        }}
                                        onDelete={handleDeleteSubItemWithConfirm}
                                        onSubItemCheck={onSubItemCheckUpdate}
                                    />
                                ))}

                                {/* Drop indicator at end of list */}
                                {isThisCardHovered && canReceiveSubItemDrop && (
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            moveSubItem(
                                                draggingSubItem.id,
                                                draggingSubItem.fromParentId,
                                                item.id,
                                                localSubItems.length
                                            );
                                            setDraggingSubItem(null);
                                        }}
                                        className="h-[2px] bg-blue-500 rounded cursor-pointer mt-1"
                                        title="Drop at end"
                                    />
                                )}
                            </SortableContext>
                        </section>

                        {/* Add Sub Item Input */}
                        {isAddingSubItem && (
                            <section className='flex items-center mt-2'>
                                <Checkbox size='small' sx={{ pl: 0, pr: 0.5, visibility: 'hidden' }} />
                                <div className='mr-2'>
                                    <ClipboardCheck color='green' size={16} />
                                </div>
                                <InputBase
                                    ref={subItemInputRef}
                                    size="sm"
                                    type='text'
                                    id="add-item"
                                    autoFocus
                                    value={newSubItemTitle}
                                    onChange={(e) => setNewSubItemTitle(e.target.value)}
                                    onBlur={handleAddSubItem}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddSubItem();
                                        } else if (e.key === 'Escape') {
                                            setIsAddingSubItem(false);
                                            setNewSubItemTitle('');
                                        }
                                    }}
                                />
                            </section>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkItemCard;
