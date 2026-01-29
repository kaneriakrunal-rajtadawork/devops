'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { Menu, Settings, Maximize2, Filter, Minimize2, CircleArrowRight, ArrowRight } from 'lucide-react';
import IconButton from '@/utils/IconButton';
import Dropdown from '@/utils/Dropdown';
import WorkItemsFilter from './components/WorkItemsFilter';
import Link from 'next/link';
import BoardColumn from './components/BoardColumn';
import WorkItemCard from './components/WorkItemCard';
import { useSelector } from 'react-redux';
import { useCreateWorkItem, useGetWorkItemsList, useUpdateWorkItem, useGetBoardWorkItems, getBoardWorkItems, getGetBoardWorkItemsQueryKey, deleteWorkItem, useReorderWorkItem } from "@/api-client";
import Banner from '@/components/ui/WarningBanner';
import { ErrorModalProvider, useErrorModal } from './hooks/useErrorModal';
import { ConfirmModalProvider, useConfirmModal } from './hooks/useConfirmModal';
import { SubItemsProvider, useSubItems } from './contexts/SubItemsContext';
import { STATES, WORKITEM_PAGE_TYPE } from '@/constants/common.constants';
import { Modal, Box } from '@mui/material';
import CreateWorkItem from './workItems/CreateWorkItem';
import WorkItemTypeIcon from '@/components/ui/WorkItemTypeIcon';
import {workItemKeys} from "@/constants/queryKeys"

// Import extracted modules
import useBoardDragAndDrop from './hooks/useBoardDragAndDrop';
import useFetchMembers from './hooks/useFetchMembers';
import { BOARD_COLUMNS } from './constants/boardConfig';
import { groupItemsByState } from './utils/workItemUtils';

// Import reusable components
import {
    KanbanBoard,
    TabBar,
    PageToolbar,
    ErrorState
} from '@/components/reusables';
import { handleOptionsChange } from "@/utils/functions";
import { useQueryClient } from '@tanstack/react-query';

// Tab configuration
const BOARD_TABS = [
    { id: 'board', label: 'Board' },
    { id: 'analytics', label: 'Analytics' },
];

// Filter options
const WORK_ITEM_TYPES = [
    { id: 'bug', label: 'Bug' },
    { id: 'task', label: 'Task' },
    { id: 'feature', label: 'Feature' },
    { id: 'issue', label: 'Issue' },
    { id: 'testcase', label: 'Test Case' },
    { id: 'userstory', label: 'User Story' },
];

const STATES_OPTIONS = [
    { id: 'To Do', label: 'To Do' },
    { id: 'Doing', label: 'Doing' },
    { id: 'Done', label: 'Done' },
];




const TEAM_OPTIONS = [
    { id: 'favorite_backlogs', label: 'My favorite backlogs' },
    { id: 'synxa_team', label: 'Synxa Team', icon: '★' },
    { id: 'view_directory', label: 'View backlogs directory' }
];

const BoardsContent = ({ showError, showConfirm }) => {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Get workItem ID from URL search params for modal
    const selectedWorkItemId = searchParams.get('workItem');

    const [activeTab, setActiveTab] = useState('board');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const contentRef = useRef(null);
    const queryClient = useQueryClient();

    // Redux selectors
    const { id: projectId, name } = useSelector((state) => state.project);
    const { selectedRepo } = useSelector((state) => state.repo);
    const userDetails = useSelector((state) => state?.auth?.user);

    // Work items grouped by column
    const [items, setItems] = useState({
        'to do': [],
        'doing': [],
        'done': []
    });

    const [filters, setFilters] = useState({
        type: 'Epic',
        state: [],
        area: []
    });

    const AREA_OPTIONS = [
        { id: name || 'Synxa', label: name || 'Synxa' }
    ];

    // Tags filter state
    const [tagFilter, setTagFilter] = useState({ tags: [], operator: 'or' });
    const [assignedUsersFilter, setAssignedUsersFilter] = useState([]);

    // Members list - using reusable hook
    const { members } = useFetchMembers(selectedRepo?.id, { apiEndpoint: 'ems-kanban-sync' });

    // Sub-item drag handling from global context
    const subItemsContext = useSubItems();
    const { draggingSubItem } = subItemsContext;

    // Note: We do NOT sync items.children when sub-items are moved between parents.
    // subItemsMap in SubItemsContext is the sole source of truth for sub-item rendering.
    // When API data refreshes (boardWorkItems changes), we clear subItemsMap to force re-init.

    // API Hooks
    const { data: boardWorkItems, refetch: fetchWorkItems, isPending: isLoading, isError, error, dataUpdatedAt } = useGetBoardWorkItems({
        project: projectId,
        repo: selectedRepo?.id,
        type: filters.type,
        state: filters.state.map((s) => s.id),
        area: filters.area.map((a) => a.id),
        tagOperator: tagFilter.operator,
        tags: tagFilter.tags,
        search: searchText,
        assignedUsers: assignedUsersFilter.map(u => u.userId),
    }, {
        query: {
            enabled: !!projectId && !!selectedRepo?.id,
            queryKey:workItemKeys.boardView(projectId, selectedRepo?.id, {
                type: filters?.type,
                state: filters.state.map((s) => s.id),
                area: filters.area.map((a) => a.id),
                tagOperator: tagFilter.operator,
                tags: tagFilter.tags,
                search: searchText,
                assignedUsers: assignedUsersFilter.map(u => u.userId),
            }),
            gcTime: 0, 
            staleTime: 0, 
            refetchOnMount: 'always'
        },
    });
  
    const invalidateQuery = async () => {
        await queryClient.invalidateQueries({
            queryKey:workItemKeys.boardView(projectId, selectedRepo?.id, {
                type: filters?.type,
                state: filters.state.map((s) => s.id),
                area: filters.area.map((a) => a.id),
                tagOperator: tagFilter.operator,
                tags: tagFilter.tags,
                search: searchText,
                assignedUsers: assignedUsersFilter.map(u => u.userId),
            }),
            refetchType: "all",
        })
    }

    // Extract all tags from work items data
    const allTags = useMemo(() => {
        return boardWorkItems?.data?.data?.allTags || [];
    }, [boardWorkItems])

    // Sync board items to state when data changes
    // Also clear SubItemsContext map to force re-initialization from fresh data
    useEffect(() => {
        console.log("going to effect");
            const groupedItems = groupItemsByState(boardWorkItems?.data?.data?.workItems);
            setItems(groupedItems);
    }, [boardWorkItems,dataUpdatedAt]);

    const { mutateAsync: createWorkItem } = useCreateWorkItem({
        mutation:{
            onSuccess: async () => {
                await queryClient.invalidateQueries(workItemKeys.repo(projectId, selectedRepo?.id));
               
            }
        }
    });
    const { mutateAsync: updateWorkItem } = useUpdateWorkItem({
        mutation:{
            onSuccess:async (data) => {
                await queryClient.invalidateQueries(workItemKeys.detail(data?.data?.data?.id));
                await queryClient.invalidateQueries(workItemKeys.repo(projectId, selectedRepo?.id));
            }
        }
    });

    const {mutateAsync: reorderWorkItem} = useReorderWorkItem()

    // Drag-and-drop hook
    const {
        activeId,
        activeItem,
        overId,
        updatingItemId,
        setUpdatingItemId,
        sensors,
        collisionDetection,
        handleDragStart,
        handleDragOver,
        handleDragEnd,
        handleDragCancel,
    } = useBoardDragAndDrop({
        items,
        setItems,
        boardColumns: BOARD_COLUMNS,
        reorderWorkItem,
        showError,
        subItemsContext,
        projectId,
        repoId:selectedRepo?.id
    });

    // Filter change handler
    const onFilterChange = useCallback((value, field) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    }, []);

    // Handle tags change
    const handleTagsChange = (tags, operator) => {
        setTagFilter({ tags, operator });
    };

    const handleAssignedUsersChange = (selectedUsers) => {
        setAssignedUsersFilter(selectedUsers);
    };

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

    // Check if any filters are active
    const hasActiveFilters = useMemo(() => {
        return !!searchText.trim() || !!filters.state.length || !!filters.area.length || !!tagFilter.tags.length;
    }, [searchText, filters.state, filters.area, tagFilter.tags]);

    // Disable drag and drop when filters are active
    const isDragDisabled = useMemo(() => {
        return hasActiveFilters;
    }, [hasActiveFilters]);

    // Fullscreen handling
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

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

    // CRUD handlers
    const handleUpdateItem = (updatedItem) => {
        setItems(prev => {
            let oldColumnId;
            for (const [colId, colItems] of Object.entries(prev)) {
                if (colItems.find(item => item.id === updatedItem.id)) {
                    oldColumnId = colId;
                    break;
                }
            }

            const newColumnId = (updatedItem.state || updatedItem.status || 'to do').toLowerCase();

            if (oldColumnId === newColumnId) {
                return {
                    ...prev,
                    [oldColumnId]: prev[oldColumnId].map(item =>
                        item.id === updatedItem.id ? updatedItem : item
                    )
                };
            }

            return {
                ...prev,
                [oldColumnId]: prev[oldColumnId].filter(item => item.id !== updatedItem.id),
                [newColumnId]: [...(prev[newColumnId] || []), updatedItem]
            };
        });
    };

    const handleDeleteItem = async (itemId) => {
        if (!itemId) return;
        try {
            await deleteWorkItem(itemId);
            setItems(prev => {
                const newItems = {};
                for (const [columnId, columnItems] of Object.entries(prev)) {
                    newItems[columnId] = columnItems.filter(item => item.id !== itemId);
                }
                return newItems;
            });
            await invalidateQuery();
        } catch (error) {
            showError(error?.response?.data?.message || error?.message || 'Failed to delete work item.');
        }
    };

    const handleAddItem = async (newItem, columnId) => {
        const tempId = `temp-${Date.now()}`;

        const {position, ...uiChanges} = newItem;

        const tempItem = {
            id: tempId,
            ...uiChanges,
            isLoading: true
        };

        setItems(prev => ({
            ...prev,
            [columnId]: [tempItem, ...prev[columnId]]
        }));

        setUpdatingItemId(tempId);

        try {
            const response = await createWorkItem({
                data: {
                    ...newItem,
                    project: projectId,
                    repo: selectedRepo?.id,
                }
            });

            const createdItem = response?.data?.data;

            setItems(prev => ({
                ...prev,
                [columnId]: prev[columnId].map(item =>
                    item.id === tempId
                        ? { ...createdItem, id: createdItem._id || createdItem.id, isLoading: false }
                        : item
                )
            }));

        } catch (error) {
            setItems(prev => ({
                ...prev,
                [columnId]: prev[columnId].filter(item => item.id !== tempId)
            }));
            showError(error?.response?.data?.message || error?.message || 'Failed to create work item.');
        } finally {
            setUpdatingItemId(null);
        }
    };

    // Handle item click - update URL to open work item modal
    const handleItemClick = (item) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('workItem', item.id);
        window.history.pushState(null, '', `${pathname}?${params.toString()}`);
        // Force re-render by dispatching a popstate event
        window.dispatchEvent(new PopStateEvent('popstate'));
    };

    // Handle modal close - remove workItem from URL
    const handleCloseModal = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('workItem');
        const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
        window.history.pushState(null, '', newUrl);
        window.dispatchEvent(new PopStateEvent('popstate'));
        fetchWorkItems();
    };

    // No repo selected
    if (!selectedRepo) {
        return <Banner message="Please select a repository first" type="warning" />;
    }

    // Error state
    if (isError) {
        return (
            <ErrorState
                variant="fullscreen"
                title="Error loading work items"
                message={error?.message || 'An unexpected error occurred.'}
                onRetry={fetchWorkItems}
            />
        );
    }

    // Render column for KanbanBoard
    const renderColumn = (column, columnItems, props) => (
        <BoardColumn
            key={column.id}
            id={column.id}
            title={column.title}
            count={columnItems.length}
            items={columnItems}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            onAddItem={handleAddItem}
            onItemClick={handleItemClick}
            columns={BOARD_COLUMNS}
            members={members}
            showConfirm={showConfirm}
            allowAdd={props.index === 0}
            isOver={props.isOver}
            updatingItemId={updatingItemId}
            setUpdatingItemId={setUpdatingItemId}
            type={filters.type}
        />
    );

    // Render card for drag overlay
    const renderCard = (item, isDragging) => {
        // Check if this is a sub-item being dragged
        const isSubItem = draggingSubItem !== null;

        if (isSubItem && draggingSubItem) {
            // Render sub-item drag overlay
            return (
                <div className="bg-white border-2 border-blue-500 rounded shadow-lg px-3 py-2 flex items-center gap-2 max-w-[300px]">
                    <WorkItemTypeIcon type={draggingSubItem.subItem?.type} size={16} />
                    <span className="text-sm font-medium text-gray-800 truncate">
                        {draggingSubItem.subItem?.title || 'Sub-item'}
                    </span>
                </div>
            );
        }

        // Render work item card overlay
        return (
            <WorkItemCard
                item={item}
                isDragging={isDragging}
                columns={BOARD_COLUMNS}
            />
        );
    };

    return (
        <div className="flex flex-col h-screen">
            <div ref={contentRef} className="flex-1 bg-gray-100">
                <div className="px-6">
                    {/* Top Section */}
                    <div className="mb-4">
                        {/* Team Selector and Controls */}
                        <PageToolbar
                            left={
                                <>
                                    <Dropdown
                                        options={TEAM_OPTIONS}
                                        onSelect={(option) => console.log(option)}
                                        icon={<Menu size={16} />}
                                        initialValue="Synxa Team"
                                        defaultSelected={['Synxa Team']}
                                        hasSearch={true}
                                        searchPlaceholder="Search backlogs"
                                    />
                                    <IconButton icon="☆" />
                                    <IconButton icon="👥" />
                                </>
                            }
                            right={
                                <Link href="/projects/Synxa/Boards/Backlogs">
                                    <button className="inline-flex items-center px-3 gap-2 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-sm cursor-pointer">
                                        <CircleArrowRight size={16} />View as backlog
                                    </button>
                                </Link>
                            }
                        />

                        {/* Tabs and Controls */}
                        <TabBar
                            tabs={BOARD_TABS}
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                        >
                            <div className="flex items-center">
                                <Dropdown
                                    options={[
                                        { id: 'Epic', label: 'Epic' },
                                        { id: 'Issue', label: 'Issue' }
                                    ]}
                                    icon={<Menu size={16} />}
                                    onSelect={(e) => onFilterChange(e.id, 'type')}
                                    initialValue={'Epic'}
                                />
                                {activeTab === 'board' && (
                                    <>
                                        <IconButton icon={<Filter size={16} />} onClick={() => setIsFilterOpen(!isFilterOpen)} />
                                        <IconButton icon={<Settings size={16} />} />
                                    </>
                                )}
                                <IconButton
                                    icon={isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                                    onClick={toggleFullscreen}
                                />
                            </div>
                        </TabBar>

                        {/* Filter Panel */}
                        {activeTab === 'board' && (
                            <section className='mt-3'>
                                <WorkItemsFilter
                                    isOpen={isFilterOpen}
                                    onClose={() => setIsFilterOpen(false)}
                                    filters={{
                                        search: searchText,
                                        types: [], // Not used in boards, filtering is done via top dropdown
                                        states: filters.state,
                                        area: filters.area,
                                        tags: tagFilter,
                                        assignedUsers: assignedUsersFilter
                                    }}

                                    filterOptions={{
                                        types: WORK_ITEM_TYPES,
                                        states: STATES_OPTIONS,
                                        areas: AREA_OPTIONS,
                                        tags: allTags,
                                        assigneeUsers: assignedUsersOptions
                                    }}

                                    config={{
                                        showSearch: true,
                                        showTypes: false, // Type selection is handled by top dropdown
                                        showStates: true,
                                        showArea: true,
                                        showTags: true,
                                        showAssignTo: true
                                    }}

                                    callbacks={{
                                        onAreaChange: (selected) => handleOptionsChange('area', selected, setFilters),
                                        onStatesChange: (selected) => handleOptionsChange('state', selected, setFilters),
                                        onSearchChange: setSearchText,
                                        onTagsChange: handleTagsChange,
                                        onAssignToChange: handleAssignedUsersChange
                                    }}

                                    renderAssignedUserOption={renderAssignedUserOption}
                                />
                            </section>
                        )}
                    </div>
                </div>

                {/* Content Section */}
                <div className="px-6">
                    {activeTab === 'board' ? (
                        <KanbanBoard
                            columns={BOARD_COLUMNS}
                            items={items}
                            sensors={sensors}
                            collisionDetection={collisionDetection}
                            onDragStart={handleDragStart}
                            onDragOver={handleDragOver}
                            onDragEnd={handleDragEnd}
                            onDragCancel={handleDragCancel}
                            activeId={activeId}
                            activeItem={activeItem}
                            overId={overId}
                            renderColumn={renderColumn}
                            renderCard={renderCard}
                            isLoading={isLoading}
                            loadingMessage="Loading work items..."
                            isDragDisabled={isDragDisabled}
                        />
                    ) : (
                        // Analytics Content
                        <div className="bg-gray-100">
                            <div className="grid grid-cols-3 gap-6">
                                {/* Cumulative Flow Diagram Card */}
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

                                {/* Velocity Card */}
                                <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 cursor-pointer">
                                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Velocity</h2>
                                    <div className="flex flex-col items-center justify-center h-[calc(100%-2rem)]">
                                        <p className="text-lg font-medium text-gray-800 mb-2">There was an error</p>
                                        <p className="text-sm text-gray-500 text-center">
                                            Iteration dates must be set to use this report. Click to set iteration dates
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Work Item Modal - Opens based on URL search param */}
            <Modal
                open={!!selectedWorkItemId}
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
                        actionType={filters.type}
                        workItemId={selectedWorkItemId}
                        type={WORKITEM_PAGE_TYPE.MODAL}
                    />
                </Box>
            </Modal>
        </div>
    );
};

// Wrapper component that provides ErrorModalProvider and ConfirmModalProvider
const Boards = () => {
    return (
        <ErrorModalProvider>
            <ConfirmModalProvider>
                <BoardsInner />
            </ConfirmModalProvider>
        </ErrorModalProvider>
    );
};

// Inner component that uses the hooks
const BoardsInner = () => {
    const { showError } = useErrorModal();
    const { showConfirm } = useConfirmModal();
    return (
        <SubItemsProvider>
            <BoardsContent showError={showError} showConfirm={showConfirm} />
        </SubItemsProvider>
    );
};

export default Boards;