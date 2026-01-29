'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import {
    Menu,
    Settings,
    Maximize2,
    Minimize2,
    Filter,
    CircleArrowRight,
    X,
    ArrowRight,
    Settings2,
} from 'lucide-react';
import useDebounce from '@/hooks/useDebounce';

// Components
import Dropdown from '@/utils/Dropdown';
import IconButton from '@/utils/IconButton';
import TagsDropdown from './components/TagsDropdown';
import BacklogsDataGrid from './components/BacklogsDataGrid';
import Banner from '@/components/ui/WarningBanner';
import QuickAddWorkItem from './components/QuickAddWorkItem';
import ChangeParentModal from './components/ChangeParentModal';
import BacklogSettingsPopover from './components/BacklogSettingsPopover';
import { getWorkItemsBase, handleOptionsChange } from "@/utils/functions";

// API hooks
import { useGetBoardWorkItems, getGetBoardWorkItemsQueryKey, getGetBacklogWorkItemsQueryKey, updateWorkItem, deleteWorkItem, useGetBacklogWorkItems, reorderWorkItem, useReorderWorkItem, useCreateWorkItem } from '@/api-client';
import { useQueryClient } from '@tanstack/react-query';
import { arrayMove } from '@dnd-kit/sortable';
import { moveItemInTree } from '@/utils/treeUtils';

// Providers
import { ErrorModalProvider, useErrorModal } from './hooks/useErrorModal';
import { ConfirmModalProvider, useConfirmModal } from './hooks/useConfirmModal';
import { ProcessingModalProvider, useProcessingModal } from './hooks/useProcessingModal';

// Work Item Modal imports
import { Modal, Box } from '@mui/material';
import CreateWorkItem from './workItems/CreateWorkItem';
import ChangeWorkItemTypeModal from './components/ChangeWorkItemTypeModal';
import { ROUTES, WORKITEM_PAGE_TYPE, WORKITEMTYPE } from '@/constants/common.constants';
import WorkItemsFilter from './components/WorkItemsFilter';
import useFetchMembers from './hooks/useFetchMembers';

// Team options
const TEAM_OPTIONS = [
    { id: 'favorite_backlogs', label: 'My favorite backlogs' },
    { id: 'synxa_team', label: 'Synxa Team', icon: '★' },
    { id: 'view_directory', label: 'View backlogs directory' }
];

// Type filter options
const TYPE_OPTIONS = [
    { id: 'Epic', label: 'Epics' },
    { id: 'Issue', label: 'Issues' }
];

// Inner content component that uses hooks
const BackLogsContent = ({ showError, withProcessing, showConfirm }) => {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get workItem ID from URL search params for modal
    const workItemParam = searchParams.get('workItem');
    const isCreateMode = workItemParam === 'create';
    const selectedWorkItemId = isCreateMode ? null : workItemParam;

    // Get additional params for create mode (type and parentId)
    const createWorkItemType = searchParams.get('type');
    const parentWorkItemId = searchParams.get('parentId');

    const [activeTab, setActiveTab] = useState('backlog');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [selectedType, setSelectedType] = useState('Epic');
    const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
    const [isQuickAddLoading, setIsQuickAddLoading] = useState(false);
    const [changeParentItem, setChangeParentItem] = useState(null); // Work item to change parent
    const [isChangingParent, setIsChangingParent] = useState(false); // Loading state for change parent
    const [changeWorkItemTypeItem, setChangeWorkItemTypeItem] = useState(null); // Work item to change parent
    const [isChangingWorkItemType, setIsChangingWorkItemType] = useState(false); // Loading state for change parent
    const [settingsAnchorEl, setSettingsAnchorEl] = useState(null); // Settings popover anchor
    const [backlogSettings, setBacklogSettings] = useState({
        inProgressItems: true,
        completedChildItems: false,
        keepHierarchyWithFilters: true,
        sidePane: 'off',
    });

    // Tags
    const [tagFilter, setTagFilter] = useState({ tags: [], operator: 'or' });
    const [assignedUsersFilter, setAssignedUsersFilter] = useState([]);

    const [filters, setFilters] = useState({
        state: [],
        type: [],
        area: [],
    })

    const contentRef = useRef(null);
    const queryClient = useQueryClient();

    // Redux selectors
    const project = useSelector((state) => state.project);
    const { id: projectId, name } = project;
    const { selectedRepo } = useSelector((state) => state.repo);
    const userDetails = useSelector((state) => state?.auth?.user);

    // API hook to fetch work items
    const {
        data: workItemsData,
        isPending: isLoading,
        isError,
        error,
        refetch,
    } = useGetBacklogWorkItems(
        {
           project: projectId,
            repo: selectedRepo?.id,
            type: selectedType,
            inProgressItems: backlogSettings.inProgressItems,
            completedChildItems: backlogSettings.completedChildItems,
            keepHierarchyWithFilters: backlogSettings.keepHierarchyWithFilters,
            state: filters.state.map((s) => s.id),
            area: filters.area.map((a) => a.id),
            tagOperator: tagFilter.operator,
            tags: tagFilter.tags,
            assignedUsers: assignedUsersFilter.map(u => u.userId),
        },
        {
            query: {
                enabled: !!projectId && !!selectedRepo?.id,
                queryKey: getGetBacklogWorkItemsQueryKey({
                    project: projectId,
                    repo: selectedRepo?.id,
                    type: selectedType,
                    inProgressItems: backlogSettings.inProgressItems,
                    completedChildItems: backlogSettings.completedChildItems,
                    keepHierarchyWithFilters: backlogSettings.keepHierarchyWithFilters,
                    state: filters.state.map((s) => s.id),
                    area: filters.area.map((a) => a.id),
                    tagOperator: tagFilter.operator,
                    tags: tagFilter.tags,
                    assignedUsers: assignedUsersFilter.map(u => u.userId),
                }),
                refetchOnMount: true,
            }
        }
    );

    const { mutateAsync: reorderWorkItem } = useReorderWorkItem();

    // Fetch members using the reusable hook
    const { members } = useFetchMembers(selectedRepo?.id, { apiEndpoint: 'ems-kanban-sync' });

    // Convert members to dropdown options format
    const assignedUsersOptions = useMemo(() => {
        if (!members || members.length === 0) return [];

        const createdMembersOptions = members.map(member => ({
            label: member.name,
            userId: member.userId,
            id: member.userId,
        }));

        createdMembersOptions.push({
            label: "@Me",
            userId: '@me',
            id: '@me',
        })

        return createdMembersOptions;
    }, [members, userDetails]);

    // Helper function to get initials
    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    // Custom render function for assigned users options with avatars
    const renderAssignedUserOption = (option) => {
        return (
            <span className="inline-flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-white text-[10px] font-medium">
                    {getInitials(option.label)}
                </div>
                <span className="text-gray-700">{option.label}</span>
            </span>
        );
    };

    const handleAssignedUsersChange = (selectedUsers) => {
        setAssignedUsersFilter(selectedUsers);
    };

    // Create Work Item mutation for quick add
    const { mutateAsync: createWorkItemMutation } = useCreateWorkItem({
        mutation: {
            onSuccess: () => {
                refetch();
                setIsQuickAddOpen(false);
                setIsQuickAddLoading(false);
            },
            onError: (error) => {
                showError(error?.response?.data?.message || error?.message || 'Failed to create work item');
                setIsQuickAddLoading(false);
            }
        }
    });

    // Handle quick add work item
    const handleQuickAddWorkItem = async (title, position) => {

        if (!title.trim() || !projectId || !selectedRepo?.id) return;

        setIsQuickAddLoading(true);

        try {
            await createWorkItemMutation({
                data: {
                    title: title.trim(),
                    type: selectedType,
                    project: projectId,
                    repo: selectedRepo.id,
                    state: 'To Do',
                    reason: 'Added To Backlog',
                    position: position,
                }
            });
        } catch (error) {
            // Error is handled in mutation callbacks
            console.error('Quick add failed:', error);
        }
    };

    // Extract work items from API response - TanStack Query is single source of truth
    const workItems = useMemo(() => {
        return workItemsData?.data?.data?.workItems || [];
    }, [workItemsData]);

    const allTags = useMemo(() => {
        return workItemsData?.data?.data?.tags || [];
    }, [workItemsData])


    // Get current query key for cache updates
    const getQueryKey = useCallback(() => getGetBacklogWorkItemsQueryKey({
        project: projectId,
        repo: selectedRepo?.id,
        type: selectedType,
        inProgressItems: backlogSettings.inProgressItems,
        completedChildItems: backlogSettings.completedChildItems,
        keepHierarchyWithFilters: backlogSettings.keepHierarchyWithFilters,
        state: filters.state.map((s) => s.id),
        area: filters.area.map((a) => a.id),
        tagOperator: tagFilter.operator,
        tags: tagFilter.tags,
        assignedUsers: assignedUsersFilter.map(u => u.userId),
    }), [projectId, selectedRepo?.id, selectedType, backlogSettings.inProgressItems, backlogSettings.completedChildItems, backlogSettings.keepHierarchyWithFilters, filters.state, filters.area, tagFilter.operator, tagFilter.tags, assignedUsersFilter]);

    // Check if any filters are active
    const hasActiveFilters = useMemo(() => {
        return !!searchText.trim() || !!filters.state.length || !!filters.area.length || !!tagFilter.tags.length || !!assignedUsersFilter.length;
    }, [searchText, filters.state, filters.area, tagFilter.tags]);

    // Determine if drag and drop should be disabled
    const isDragDisabled = useMemo(() => {
        // Disable drag and drop when keepHierarchyWithFilters is false AND filters are active
        return !backlogSettings.keepHierarchyWithFilters && hasActiveFilters;
    }, [backlogSettings.keepHierarchyWithFilters, hasActiveFilters]);

    // Filter work items based on search text
    const filteredWorkItems = useMemo(() => {
        if (!searchText) return workItems;

        const searchLower = searchText.toLowerCase();
        return workItems.filter(item =>
            item.title?.toLowerCase().includes(searchLower) ||
            item.sequenceId?.toString().includes(searchLower) ||
            item.assignedUser?.name?.toLowerCase().includes(searchLower)
        );
    }, [workItems, searchText]);

    // Fullscreen handling
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(document.fullscreenElement !== null);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    // Show error modal when API error occurs
    useEffect(() => {
        if (isError && error) {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load work items';
            showError(errorMessage);
        }
    }, [isError, error, showError]);

    const toggleFullscreen = async () => {
        try {
            if (!isFullscreen) {
                await contentRef.current.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (err) {
            console.error('Error toggling fullscreen:', err);
        }
    };

    // Handle type filter change
    const handleTypeChange = (option) => {
        setSelectedType(option.id);
    };

    // Handle row click - update URL to open work item modal
    const handleRowClick = (workItem) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('workItem', workItem.id);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    // Handle modal close - remove workItem and related params from URL
    const handleCloseModal = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('workItem');
        params.delete('type');
        params.delete('parentId');
        const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
        router.push(newUrl, { scroll: false });
    };

    // Handle add sub-item - navigate to create work item with parent
    const handleAddSubItem = (parentItem) => {
        const params = new URLSearchParams(searchParams.toString());
        const newWorkItemType = parentItem?.type === WORKITEMTYPE.EPIC ? WORKITEMTYPE.ISSUE : WORKITEMTYPE.TASK;
        params.set('workItem', 'create');
        params.set('type', newWorkItemType);
        params.set('parentId', parentItem.id);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    // Handle edit from context menu - use URL-based modal
    // const handleEdit = (workItem) => {
    //     const params = new URLSearchParams(searchParams.toString());
    //     params.set('workItem', workItem.id);
    //     router.push(`${pathname}?${params.toString()}`, { scroll: false });
    // };

    // Handle assign from context menu
    const handleAssign = async (workItem, member) => {
        try {
            const response = await withProcessing(
                updateWorkItem(workItem.id, { assignedTo: member?.userId ?? null }),
                'Assigning work item'
            );

            refetch();
        } catch (error) {
            showError(error?.response?.data?.message || error?.message || 'Failed to assign work item.');
        }
    };

    const handleDeleteWorkItemWithConfirmation = (workItem) => {
        if (!showConfirm) return;

        showConfirm({
            title: 'Delete Work Item',
            message: `Are you sure you want to delete "${workItem.title}"? This action cannot be undone.`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            type: 'danger',
            onConfirm: async () => {
                await handleDeleteWorkItem(workItem);
            },
        });
    }

    // Handle delete from context menu
    const handleDeleteWorkItem = async (workItem) => {
        if (!workItem) return;
        try {
            await deleteWorkItem(workItem.id);

            refetch();
        } catch (error) {
            showError(error?.response?.data?.message || error?.message || 'Failed to assign work item.');
        }
    }

    // Handle Change Parent - opens modal
    const handleChangeParent = (workItem) => {
        setChangeParentItem(workItem);
    };

    // Handle Change Parent Submit - calls API to update parent
    const handleChangeParentSubmit = async (workItem, newParentId) => {
        if (!workItem || !newParentId) return;

        setIsChangingParent(true);
        try {
            await withProcessing(
                updateWorkItem(workItem.id, { parentId: newParentId }),
                'Changing parent'
            );
            setChangeParentItem(null);
            refetch();
        } catch (error) {
            showError(error?.response?.data?.message || error?.message || 'Failed to change parent.');
        } finally {
            setIsChangingParent(false);
        }
    };

    const handleChangeWorkItemType = (workItem) => {
        setChangeWorkItemTypeItem(workItem);
    };

    const handleChangeWorkItemTypeSubmit = async (workItem, newType, reason) => {
        if (!workItem || !newType) return;

        const updateWorkItemPayload = {
            type: newType
        };

        if (reason) {
            updateWorkItemPayload.comments = [{ comment: reason }];
        }

        setIsChangingWorkItemType(true);
        try {
            await withProcessing(
                updateWorkItem(workItem.id, updateWorkItemPayload),
                'Changing work item type'
            );
            setChangeWorkItemTypeItem(null);
            refetch();
        } catch (error) {
            showError(error?.response?.data?.message || error?.message || 'Failed to change work item type.');
        } finally {
            setIsChangingWorkItemType(false);
        }
    };

    const area = [
        { id: name || 'Synxa', label: name || 'Synxa' }
    ];

    const WORK_ITEM_TYPES = [
        { id: 'Task', label: 'Task' },
        { id: 'Issue', label: 'Issue' },
        { id: 'Epic', label: 'Epic' },
    ];

    const filteredWorkItemTypesOptions = selectedType === WORKITEMTYPE.EPIC ? WORK_ITEM_TYPES : WORK_ITEM_TYPES.filter((option) => option.id !== "Epic");

    const STATES = [
        { id: 'To Do', label: 'To Do' },
        { id: 'Doing', label: 'Doing' },
        { id: 'Done', label: 'Done' },
    ];

    const filteredStatesOptions = useMemo(() => selectedType === WORKITEMTYPE.EPIC ? STATES.filter((option) => option.id !== "Done") : backlogSettings.completedChildItems === false ? STATES.filter((option) => option.id !== "Done") : STATES, [backlogSettings.completedChildItems, selectedType]);

    useEffect(() => {
        if (filters.state.findIndex((option) => option.id === "Done") > -1 && backlogSettings.completedChildItems === false) {
            setFilters((prevFilters) => ({
                ...prevFilters,
                state: prevFilters.state.filter((s) => s.id !== "Done")
            }));
        }
    }, [backlogSettings.completedChildItems])

    // Handle drag and drop reorder (top-level items) - uses queryClient.setQueryData for optimistic update
    const handleReorder = async (oldIndex, newIndex, activeId, overId) => {

        // 1. Get the current list from TanStack Query cache
        const currentData = queryClient.getQueryData(getQueryKey());
        const workItems = currentData?.data?.data?.workItems || [];

        // 2. Create the hypothetical new array to find neighbors
        const newWorkItems = arrayMove([...workItems], oldIndex, newIndex);

        // 3. Identify neighbors in the new position
        const prevItem = newWorkItems[newIndex - 1];
        const nextItem = newWorkItems[newIndex + 1];

        const prevRank = prevItem ? prevItem.stackRank : null;
        const nextRank = nextItem ? nextItem.stackRank : null;

        const updatePayload = {
            workItemId: activeId,
            project: projectId,
            repo: selectedRepo?.id,
            prevRank,
            nextRank
        };

        // Optimistic update directly to TanStack Query cache
        queryClient.setQueryData(getQueryKey(), (oldData) => {
            if (!oldData?.data?.data?.workItems) return oldData;

            return {
                ...oldData,
                data: {
                    ...oldData.data,
                    data: {
                        ...oldData.data.data,
                        workItems: newWorkItems
                    }
                }
            };
        });

        await withProcessing(reorderWorkItem({
            data: updatePayload
        }, {
            onError: (error) => {
                showError(error?.response?.data?.message || error?.message || 'Failed to reorder work item.');
                queryClient.setQueryData(getQueryKey(), workItems);
            },
            onSettled: () => {
                refetch();
            },
            onSuccess: () => {
            }
        }),
            "Reordering Work item")

    };

    const handleCreateWorkItemSuccess = () => {
        refetch();
    }

    const handleUpdateWorkItemSuccess = () => {
        refetch();
    }

    // Handle sub-item reordering (with level restrictions) - uses queryClient.setQueryData for optimistic update
    const handleReorderSubItem = async ({ sourceId, targetId, sourceParentId, targetParentId, depth, moveToParent }) => {
        // Helper to find parent array and index of an item
        const findParentAndIndex = (items, itemId) => {
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

        // Helper to find an item by ID
        const findItemById = (items, id) => {
            for (const item of items) {
                if (item.id === id) return item;
                if (item.children?.length) {
                    const found = findItemById(item.children, id);
                    if (found) return found;
                }
            }
            return null;
        };

        let prevRank = null;
        let nextRank = null;
        let finalParentId = null;

        // Store the full query data for rollback (not just workItems array)
        const prevQueryData = queryClient.getQueryData(getQueryKey());

        // Optimistic update directly to TanStack Query cache
        queryClient.setQueryData(getQueryKey(), (oldData) => {
            if (!oldData?.data?.data?.workItems) return oldData;

            // Deep clone to avoid mutation
            const newItems = JSON.parse(JSON.stringify(oldData.data.data.workItems));

            // Find source item and remove it
            const sourceResult = findParentAndIndex(newItems, sourceId);
            if (!sourceResult) return oldData;

            const [movedItem] = sourceResult.parent.splice(sourceResult.index, 1);

            // Update the moved item's parentId
            movedItem.parentId = moveToParent ? targetId : targetParentId;

            if (moveToParent) {
                // Moving to a parent level - add as child of target
                const targetItem = findItemById(newItems, targetId);
                if (!targetItem) {
                    // Rollback
                    sourceResult.parent.splice(sourceResult.index, 0, movedItem);
                    return oldData;
                }

                // Initialize children array if doesn't exist
                if (!targetItem.children) {
                    targetItem.children = [];
                }

                // Neighbors in the new parent's list
                prevRank = null; // It's the first child
                nextRank = targetItem?.children[0]?.stackRank || null;
                finalParentId = targetId;

                // Add as first child of the target parent
                targetItem.children.unshift(movedItem);
            } else {
                // CASE: Dropped between siblings
                // Same level reordering - find target position and insert before it
                const targetResult = findParentAndIndex(newItems, targetId);
                if (!targetResult) {
                    // Rollback - put item back
                    sourceResult.parent.splice(sourceResult.index, 0, movedItem);
                    return oldData;
                }

                // Insert at target position
                targetResult.parent.splice(targetResult.index, 0, movedItem);

                // Neighbors in this sibling array
                const newIndex = targetResult.index;
                prevRank = targetResult.parent[newIndex - 1]?.stackRank || null;
                nextRank = targetResult.parent[newIndex + 1]?.stackRank || null;

                // The parent of targetResult.parent is the new parentId
                finalParentId = targetParentId || null;
            }

            return {
                ...oldData,
                data: {
                    ...oldData.data,
                    data: {
                        ...oldData.data.data,
                        workItems: newItems
                    }
                }
            };
        });

        const updatePayload = {
            parentId: finalParentId,
            prevRank,
            nextRank,
            workItemId: sourceId,
            project: projectId,
            repo: selectedRepo?.id
        }

        await withProcessing(reorderWorkItem({
            data: updatePayload
        }, {
            onError: (error) => {
                showError(error?.response?.data?.message || error?.message || 'Failed to reorder work item.');
                // Rollback to the full previous query data
                queryClient.setQueryData(getQueryKey(), prevQueryData);
            },
            onSettled: () => {
                refetch();
            },
        }),
            "Reordering Work item")

    };

    const handleTagsChange = (tags, operator) => {
        setTagFilter({ tags, operator });
    };

    // No repo selected
    if (!selectedRepo) {
        return <Banner message="Please select a repository first" type="warning" />;
    }

    return (
        <>
            <div className="flex flex-col layout-min-height bg-gray-100">
                <div ref={contentRef} className="flex-1 px-6">
                    <div className="h-full mx-auto w-full ">
                        {/* Top Section */}
                        <div className="mb-2">
                            {/* Team Selector and Controls */}
                            <div className="py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Dropdown
                                            options={TEAM_OPTIONS}
                                            onSelect={() => { }}
                                            icon={<Menu size={16} />}
                                            initialValue="Synxa Team"
                                            defaultSelected={['Synxa Team']}
                                            hasSearch={true}
                                            searchPlaceholder="Search backlogs"
                                        />
                                        <IconButton icon="☆" />
                                        <IconButton icon="👥" />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <QuickAddWorkItem
                                            workItemType={selectedType}
                                            isOpen={isQuickAddOpen}
                                            onToggle={setIsQuickAddOpen}
                                            onAdd={handleQuickAddWorkItem}
                                            isLoading={isQuickAddLoading}
                                            placeholder={`Enter ${selectedType.toLowerCase()} title`}
                                        />
                                        <Link href="/projects/Synxa/Boards/Boards">
                                            <button className="inline-flex items-center px-3 gap-2 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-sm cursor-pointer">
                                                <CircleArrowRight size={16} /> View as Board
                                            </button>
                                        </Link>
                                        <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-sm cursor-pointer">
                                            Column Options
                                        </button>
                                        <button className="p-2 hover:bg-gray-100 rounded-sm cursor-pointer">
                                            ⋮
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Tabs and Controls Combined Row */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center w-full">
                                    <div className="flex">
                                        <button
                                            onClick={() => setActiveTab('backlog')}
                                            className={`px-4 py-3 text-sm font-medium ${activeTab === 'backlog'
                                                ? 'text-blue-600 border-b-2 border-blue-600'
                                                : 'text-gray-600 hover:text-gray-800'
                                                } cursor-pointer`}
                                        >
                                            Backlog
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('analytics')}
                                            className={`px-4 py-3 text-sm font-medium ${activeTab === 'analytics'
                                                ? 'text-blue-600 border-b-2 border-blue-600'
                                                : 'text-gray-600 hover:text-gray-800'
                                                } cursor-pointer`}
                                        >
                                            Analytics
                                        </button>
                                    </div>

                                    {activeTab === 'backlog' && (
                                        <div className="flex items-center px-4 ml-auto">
                                            <div className="flex items-center">
                                                <Dropdown
                                                    options={TYPE_OPTIONS}
                                                    renderOption={(option) => (
                                                        <div className="flex items-center gap-2">
                                                            <Menu color={option.id === "Epic" ? 'green' : 'orange'} size={16} />
                                                            <span>{option.label}</span>
                                                        </div>
                                                    )}
                                                    icon={<Menu color={selectedType === "Epic" ? 'green' : 'orange'} size={16} />}
                                                    onSelect={handleTypeChange}
                                                    initialValue={selectedType === 'Epic' ? 'Epics' : 'Issues'}
                                                />
                                            </div>
                                            <div className="flex items-center">
                                                {/* Settings section */}
                                                <IconButton
                                                    icon={<Settings2 size={16} />}
                                                    onClick={(e) => setSettingsAnchorEl(e.currentTarget)}
                                                />
                                                <IconButton
                                                    icon={<Filter size={16} />}
                                                    onClick={() => setIsFilterOpen(!isFilterOpen)}

                                                />
                                                <IconButton icon={<Settings size={16} />} />
                                                <IconButton
                                                    icon={isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                                                    onClick={toggleFullscreen}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Content Section */}
                        {activeTab === 'backlog' ? (
                            <>
                                {/* Filter Bar */}
                                <WorkItemsFilter
                                    isOpen={isFilterOpen}
                                    onClose={() => setIsFilterOpen(false)}
                                    filters={{
                                        search: searchText,
                                        // types: filters.type,
                                        states: filters.state,
                                        area: filters.area,
                                        tags: tagFilter,
                                        assignedUsers: assignedUsersFilter
                                    }}

                                    filterOptions={{
                                        // types: filteredWorkItemTypesOptions,
                                        states: filteredStatesOptions,
                                        areas: area,
                                        tags: allTags,
                                        assigneeUsers: assignedUsersOptions
                                    }}

                                    config={{
                                        showSearch: true,
                                        showTypes: false,
                                        showStates: true,
                                        showArea: true,
                                        showTags: true,
                                        showAssignTo: true
                                    }}

                                    callbacks={{
                                        onAreaChange: (selected) => handleOptionsChange('area', selected, setFilters),
                                        // onTypesChange: (selected) => handleOptionsChange('type', selected, setFilters),
                                        onStatesChange: (selected) => handleOptionsChange('state', selected, setFilters),
                                        onSearchChange: setSearchText,
                                        onTagsChange: handleTagsChange,
                                        onAssignToChange: handleAssignedUsersChange
                                    }}

                                    renderAssignedUserOption={renderAssignedUserOption}
                                />

                                {/* Backlog Data Grid */}
                                <BacklogsDataGrid
                                    data={filteredWorkItems}
                                    loading={isLoading}
                                    onRowClick={handleRowClick}
                                    onRetry={refetch}
                                    onAddSubItem={handleAddSubItem}
                                    // onEdit={handleEdit}
                                    onAssign={handleAssign}
                                    onDelete={handleDeleteWorkItemWithConfirmation}
                                    onChangeParent={handleChangeParent}
                                    onChangeType={handleChangeWorkItemType}
                                    onReorder={handleReorder}
                                    onReorderSubItem={handleReorderSubItem}
                                    repoId={selectedRepo?.id}
                                    isDragDisabled={isDragDisabled}
                                />
                            </>
                        ) : (
                            // Analytics Tab Content
                            <div className="grid grid-cols-3 gap-6">
                                <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 cursor-pointer">
                                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Cumulative Flow Diagram</h2>
                                    <div className="mb-6">
                                        <p className="text-sm text-gray-600">Average work in progress</p>
                                        <p className="text-4xl font-semibold mt-2">2</p>
                                    </div>
                                    <div className="flex justify-end">
                                        <a href="#" className="text-sm text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center">
                                            View full report <ArrowRight size={16} className="ml-1" />
                                        </a>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 cursor-pointer">
                                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Velocity</h2>
                                    <div className="flex flex-col items-center justify-center h-[calc(100%-2rem)]">
                                        <p className="text-lg font-medium text-gray-800 mb-2">There was an error</p>
                                        <p className="text-sm text-gray-600 text-center">
                                            Iteration dates must be set to use this report. Click to set iteration dates
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Work Item Modal - Opens based on URL search param */}
            <Modal
                open={!!workItemParam}
                onClose={handleCloseModal}
                aria-labelledby="work-item-modal"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '90vw',
                    height: '90vh',
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: 24,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                    <CreateWorkItem
                        onClose={handleCloseModal}
                        actionType={isCreateMode && createWorkItemType}
                        workItemId={selectedWorkItemId}
                        parentId={isCreateMode ? parentWorkItemId : null}
                        type={WORKITEM_PAGE_TYPE.MODAL}
                        onCreateWorkItemSuccess={handleCreateWorkItemSuccess}
                        onUpdateWorkItemSuccess={handleUpdateWorkItemSuccess}
                    />
                </Box>
            </Modal>

            {/* Change Parent Modal */}
            <ChangeParentModal
                open={!!changeParentItem}
                onClose={() => setChangeParentItem(null)}
                workItem={changeParentItem}
                projectId={projectId}
                repoId={selectedRepo?.id}
                onSubmit={handleChangeParentSubmit}
                isSubmitting={isChangingParent}
            />

            <ChangeWorkItemTypeModal
                open={!!changeWorkItemTypeItem}
                onClose={() => setChangeWorkItemTypeItem(null)}
                workItem={changeWorkItemTypeItem}
                projectId={projectId}
                repoId={selectedRepo?.id}
                onSubmit={handleChangeWorkItemTypeSubmit}
                isSubmitting={isChangingWorkItemType}
            />

            {/* Backlog Settings Popover */}
            <BacklogSettingsPopover
                anchorEl={settingsAnchorEl}
                open={Boolean(settingsAnchorEl)}
                onClose={() => setSettingsAnchorEl(null)}
                settings={backlogSettings}
                onSettingsChange={setBacklogSettings}
            />
        </>
    );
};

// Inner component that uses the hooks
const BackLogsInner = () => {
    const { showError } = useErrorModal();
    const { withProcessing } = useProcessingModal();
    const { showConfirm } = useConfirmModal();
    return <BackLogsContent showError={showError} withProcessing={withProcessing} showConfirm={showConfirm} />;
};

// Main component with providers
const BackLogs = () => {
    return (
        <ErrorModalProvider>
            <ConfirmModalProvider>
                <ProcessingModalProvider>
                    <BackLogsInner />
                </ProcessingModalProvider>
            </ConfirmModalProvider>
        </ErrorModalProvider>
    );
};

export default BackLogs;