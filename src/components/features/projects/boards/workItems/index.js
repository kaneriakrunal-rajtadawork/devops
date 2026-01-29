'use client';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Dropdown from '@/utils/Dropdown';
import IconButton from '@/utils/IconButton';
import WorkItemsFilter from '../components/WorkItemsFilter';
import DataTable from '@/utils/DataTable';
import { Upload, Filter, Plus, AudioLines, Fullscreen, X, Menu } from 'lucide-react';
import { useModal } from '@/context/ModalContext';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import Banner from '@/components/ui/WarningBanner';
import { useGetWorkItemsList, deleteWorkItem } from "@/api-client";
import { WORKITEMLISTTYPES } from '@/constants/common.constants';
import { useDebounce } from '@/hooks/useDebounce';
import StateIndicator, { STATE_CONFIG } from '@/components/ui/StateIndicator';
import { ErrorModalProvider, useErrorModal } from '../hooks/useErrorModal';
import { ConfirmModalProvider, useConfirmModal } from '../hooks/useConfirmModal';
import useFetchMembers from '../hooks/useFetchMembers';

const WorkItemsContent = ({ showError, showConfirm }) => {
    const pathname = usePathname();
    const router = useRouter();
    const { handleOpenBugIndexModal } = useModal();
    const [isFocused, setIsFocused] = useState(false);
    const [isFilterOpen, setisFilterOpen] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [typeFilter, setTypeFilter] = useState([]);
    const [stateFilter, setStateFilter] = useState([]);
    const [areaFilter, setAreaFilter] = useState([]);
    const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(WORKITEMLISTTYPES.MY_ACTIVITY);
    const { name, description, id: projectId } = useSelector((state) => state.project);
    const userDetails = useSelector((state) => state?.auth?.user);
    const { selectedRepo } = useSelector(state => state.repo);

    // Work items data state
    const [workItems, setWorkItems] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [allTags, setAllTags] = useState([]);
    const [tagFilter, setTagFilter] = useState({ tags: [], operator: 'or' });
    const [assignedUsersFilter, setAssignedUsersFilter] = useState([]);

    // Debounce search text to avoid excessive API calls while typing
    const debouncedSearchText = useDebounce(searchText, 400);

    // API mutation hook
    const {
        mutate: fetchWorkItems,
        isPending: isLoading,
        isError,
        error,
        data: workItemsResponse
    } = useGetWorkItemsList({
        mutation: {
            onSuccess: (response) => {
                const responseData = response?.data?.data;
                if (responseData) {
                    setWorkItems(responseData.data || []);
                    setPagination(responseData.pagination || null);
                    setAllTags(responseData.allTags || []);
                }
            },
            onError: (err) => {
                console.error("Error fetching work items:", err);
            }
        }
    });

    // Fetch members using the reusable hook
    const { members, isLoading: membersLoading } = useFetchMembers(selectedRepo?.id, {
        apiEndpoint: 'ems-kanban-sync'
    });




    // Fetch work items when project/repo change
    const loadWorkItems = useCallback((page = 1) => {
        if (projectId && selectedRepo?.id) {
            fetchWorkItems({
                data: {
                    project: projectId,
                    repo: selectedRepo.id,
                    status: selectedStatus || undefined,
                    search: debouncedSearchText || undefined,
                    type: typeFilter.map((t) => t.id),
                    state: stateFilter.map((s) => s.id),
                    tags: tagFilter,
                    area: areaFilter.map(a => a.label),
                    assignedUsers: assignedUsersFilter.map(u => u.userId),
                    pagination: {
                        page: page,
                        limit: 20
                    },
                    sortBy: 'createdAt',
                    sortOrder: 'desc'
                }
            });
        }
    }, [projectId, selectedRepo?.id, selectedStatus, debouncedSearchText, typeFilter, stateFilter, areaFilter, tagFilter, assignedUsersFilter, fetchWorkItems]);

    // Convert members to dropdown options format
    const assignedUsersOptions = useMemo(() => {
        if (!members || members.length === 0) return [];

        const createdMembersOptions = members.map(member => ({
            label: member.name,
            userId: member.userId,
            id: member.userId || member.id,
        }));

        createdMembersOptions.push({
            label:"@Me",
            userId:'@me',
            id:'@me',            
        })

        return createdMembersOptions;
    }, [members]);

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

    // Handle page change from DataTable
    const handlePageChange = useCallback((newPage) => {
        setCurrentPage(newPage);
        loadWorkItems(newPage);
    }, [loadWorkItems]);

    // Fetch work items on mount and when filters change (reset to page 1)
    useEffect(() => {
        setCurrentPage(1);
        loadWorkItems(1);
    }, [loadWorkItems]);

    // Status filter options mapped to API values
    const AssignedtoMeoptions = [
        { id: WORKITEMLISTTYPES.ASSIGNED_TO_ME, label: 'Assigned to me' },
        // { id: WORKITEMLISTTYPES.FOLLOWING, label: 'Following' },
        // { id: WORKITEMLISTTYPES.MENTIONED, label: 'Mentioned' },
        { id: WORKITEMLISTTYPES.MY_ACTIVITY, label: 'My activity' },
        { id: WORKITEMLISTTYPES.RECENTLY_UPDATED, label: 'Recently updated' },
        { id: WORKITEMLISTTYPES.RECENTLY_COMPLETED, label: 'Recently completed' },
        { id: WORKITEMLISTTYPES.RECENTLY_CREATED, label: 'Recently created' },
    ];

    const WORK_ITEM_TYPES = [
        { id: 'Task', label: 'Task' },
        { id: 'Issue', label: 'Issue' },
        { id: 'Epic', label: 'Epic' },
    ];

    const states = [
        { id: 'To Do', label: 'To Do' },
        { id: 'Doing', label: 'Doing' },
        { id: 'Done', label: 'Done' },
    ];

    // Custom render function for state options with colored indicators
    const renderStateOption = (option) => {
        const config = STATE_CONFIG[option.label] || { color: '#6B7280' };
        return (
            <span className="inline-flex items-center gap-2">
                <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: config.color }}
                />
                <span className="text-gray-700">{option.label}</span>
            </span>
        );
    };

    const area = [
        { id: name || 'Synxa', label: name || 'Synxa' }
    ];

    const handleSelect = (option) => {
        setSelectedStatus(option.id);
    };

    const handleWorkItemTypeSelect = (option) => {
        // Navigate to create page: /projects/[project]/boards/work-items/create/[type]
        // pathname is already /projects/[project]/boards/work-items
        router.push(`${pathname}/create/${option.id.toLowerCase()}`);
    };

    // Handle row click to navigate to work item detail page
    const handleRowClick = (workItem) => {
        // Navigate to: /projects/[project]/boards/work-items/[id]/edit
        const workItemId = workItem._id || workItem.id;
        if (workItemId) {
            router.push(`${pathname}/${workItemId}/edit`);
        }
    };

    const handleFilterOptionsChange = (selectedOptions, setterFunction) => {
        if (!setterFunction || !selectedOptions) {
            return;
        }
        setterFunction(selectedOptions);
    }

    const handleTagsChange = (tags, operator) => {
        setTagFilter({ tags, operator });
    };

    const handleAssignedUsersChange = (selectedUsers) => {
        setAssignedUsersFilter(selectedUsers);
    };

    // Handle delete work item with confirmation
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
    };

    // Handle delete from context menu
    const handleDeleteWorkItem = async (workItem) => {
        if (!workItem) return;
        try {
            await deleteWorkItem(workItem._id || workItem.id);
            loadWorkItems(currentPage);
        } catch (error) {
            showError(error?.response?.data?.message || error?.message || 'Failed to delete work item.');
        }
    };

    // Handle delete action from row menu
    const handleRowAction = (action, workItem) => {
        if (action === 'delete') {
            handleDeleteWorkItemWithConfirmation(workItem);
        }
    };

    if (!selectedRepo) {
        return (
            <Banner message="Please select repository first" type="warning" />
        )
    }


    // Error state
    if (isError) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <X className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                            Error loading work items
                        </h3>
                        <p className="mt-1 text-sm text-red-700">
                            {error?.message || 'An unexpected error occurred. Please try again.'}
                        </p>
                        <button
                            onClick={() => loadWorkItems()}
                            className="mt-2 text-sm font-medium text-red-600 hover:text-red-500"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className=" px-3 bg-white">
                {/* Header */}
                <div className="py-2">
                    <h1 className="text-xl ml-2 font-light">Work items</h1>
                </div>

                {/* Dropdown and Command Bar */}
                <div className="flex flex-col md:flex-row items-start md:items-center py-3">
                    <div className="relative w-45">
                        <Dropdown
                            options={AssignedtoMeoptions}
                            onSelect={handleSelect}
                            separatorIndexes={[4]}
                            initialValue="All"
                            alignRight={false}
                        />
                    </div>

                    <div className="border-t md:border-t-0 md:border-l md:h-6 md:mx-1 border-gray-300"></div>

                    {/* Command Bar */}
                    <div className="flex flex-wrap items-center w-full">
                        {/* Command Button */}
                        <div className="flex flex-wrap items-center">
                            <Dropdown
                                options={WORK_ITEM_TYPES}
                                onSelect={handleWorkItemTypeSelect}
                                icon={<Plus size={16} />}
                                initialValue='New Work Item'
                            />

                            <Link href="/projects/Synxa/Boards/Queries">
                                <IconButton icon="⤴" label="Open in Queries" />
                            </Link>
                            <IconButton icon="🛠" label="Column Options" />
                            <IconButton icon={<Upload size={16} />} label="Import Work Items" />
                            <IconButton icon="🗑" label="Recycle Bin" />
                        </div>

                        {/* Right-aligned Buttons */}
                        <div className="flex items-center ml-auto">
                            <AudioLines className='p-2 rounded hover:bg-gray-100 cursor-pointer transition' size={16} />
                            <Filter
                                onClick={() => setisFilterOpen(!isFilterOpen)}
                                className={`p-2 rounded cursor-pointer transition w-8 h-8 ${isFilterOpen ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                                size={16}
                            />
                            <Fullscreen className='p-2 rounded hover:bg-gray-100 cursor-pointer transition' size={16} />
                        </div>
                    </div>
                </div>

                {/* Filter Panel */}
                <WorkItemsFilter
                    isOpen={isFilterOpen}
                    backgroundColor="bg-gray-100"
                    onClose={() => setisFilterOpen(false)}
                    filters={{
                        search: searchText,
                        types: typeFilter,
                        states: stateFilter,
                        area: areaFilter,
                        tags: tagFilter,
                        assignedUsers: assignedUsersFilter
                    }}
                    filterOptions={{
                        types: WORK_ITEM_TYPES,
                        states: states,
                        areas: area,
                        tags: allTags,
                        assigneeUsers: assignedUsersOptions
                    }}
                    callbacks={{
                        onSearchChange: setSearchText,
                        onTypesChange: (selectedOptions) => handleFilterOptionsChange(selectedOptions, setTypeFilter),
                        onStatesChange: (selectedOptions) => handleFilterOptionsChange(selectedOptions, setStateFilter),
                        onAreaChange: (selectedOptions) => handleFilterOptionsChange(selectedOptions, setAreaFilter),
                        onTagsChange: handleTagsChange,
                        onAssignToChange: handleAssignedUsersChange
                    }}
                    config={{
                        showSearch: true,
                        showTypes: true,
                        showStates: true,
                        showArea: true,
                        showTags: true,
                        showAssignTo:true
                    }}
                    renderStateOption={renderStateOption}
                    renderAssignedUserOption={renderAssignedUserOption}
                />
            </div>

            <div className="px-3 mt-2 h-[70vh]">
                <DataTable
                    workItems={workItems}
                    loading={isLoading}
                    searchText={searchText}
                    typeFilter={typeFilter}
                    stateFilter={stateFilter}
                    areaFilter={areaFilter}
                    onRowClick={handleRowClick}
                    onAction={handleRowAction}
                    pagination={pagination}
                    onPageChange={handlePageChange}
                />
            </div>
        </>
    );
};

// Main component with providers
const WorkItems = () => {
    return (
        <ErrorModalProvider>
            <ConfirmModalProvider>
                <WorkItemsContentWithHooks />
            </ConfirmModalProvider>
        </ErrorModalProvider>
    );
};

// Connect hooks to content
const WorkItemsContentWithHooks = () => {
    const { showError } = useErrorModal();
    const { showConfirm } = useConfirmModal();

    return <WorkItemsContent showError={showError} showConfirm={showConfirm} />;
};

export default WorkItems;
