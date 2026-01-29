'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Fade, Box, CircularProgress } from '@mui/material';
import { X, Menu } from 'lucide-react';
import Dropdown from '@/utils/Dropdown';
import WorkItemTypeIcon from '@/components/ui/WorkItemTypeIcon';
import { useGetBacklogWorkItems } from '@/api-client';
import { WORKITEMTYPE } from '@/constants/common.constants';

/**
 * ChangeParentModal - Modal for changing the parent of a work item
 * Slides in from the right side with fade animation
 * Full-screen on mobile, fixed width on desktop
 */
const ChangeParentModal = ({
    open,
    onClose,
    workItem,
    projectId,
    repoId,
    onSubmit,
    isSubmitting = false,
}) => {
    const [selectedParent, setSelectedParent] = useState(null);

    // Fetch potential parent work items (Epics for Issues, Issues for Tasks)
    const parentType = workItem?.type === WORKITEMTYPE.TASK
        ? WORKITEMTYPE.ISSUE
        : workItem?.type === WORKITEMTYPE.ISSUE
            ? WORKITEMTYPE.EPIC
            : WORKITEMTYPE.EPIC;

    const {
        data: parentWorkItemsData,
        isPending: isLoadingParents,
    } = useGetBacklogWorkItems(
        {
            project: projectId,
            repo: repoId,
            type: parentType,
        },
        {
            query: {
                enabled: open && !!projectId && !!repoId,
            }
        }
    );

    // Transform work items to dropdown options
    const parentOptions = React.useMemo(() => {
        const workItems = parentWorkItemsData?.data?.data?.workItems || [];
        return workItems
            .filter(item => item.id !== workItem?.id) // Exclude self
            .map(item => ({
                id: item.id,
                label: item.title,
                type: item.type,
                number: item.number,
            }));
    }, [parentWorkItemsData, workItem]);

    // Reset selection when modal opens
    useEffect(() => {
        if (open) {
            setSelectedParent(null);
        }
    }, [open]);

    const handleParentSelect = (option) => {
        setSelectedParent(option);
    };

    const handleSubmit = () => {
        if (selectedParent && onSubmit) {
            onSubmit(workItem, selectedParent.id);
        }
    };

    // Custom render for parent options with work item type icon
    const renderParentOption = (option) => (
        <div className="flex items-center gap-2">
            <WorkItemTypeIcon type={option.type} size={16} />
            <span className="text-gray-700">{option.label}</span>
        </div>
    );

    return (
        <Modal
            open={open}
            onClose={onClose}
            closeAfterTransition
            aria-labelledby="change-parent-modal"
        >
            <Fade in={open}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        right: 16,
                        transform: 'translateY(-50%)',
                        height: '95vh',
                        width: { xs: 'calc(100vw - 32px)', sm: '450px' },
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        display: 'flex',
                        flexDirection: 'column',
                        outline: 'none',
                        borderRadius: 2,
                    }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                Change Parent of Work Item(s)
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                This will replace any existing parent of the 1 selected item(s).
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X size={20} className="text-gray-500" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-auto px-6 py-4">
                        {/* Team Selector (placeholder) */}
                        <div className="mb-4">
                            <Dropdown
                                options={[{ id: 'synxa_team', label: 'Synxa Team' }]}
                                icon={<Menu size={16} />}
                                initialValue="Synxa Team"
                                className="max-w-[350px]"
                            />
                        </div>

                        {/* Parent Selector */}
                        <div className="mb-4">
                            <Dropdown
                                options={parentOptions}
                                initialValue="Select a new parent..."
                                onSelect={handleParentSelect}
                                renderOption={renderParentOption}
                                loading={isLoadingParents}
                                fullWidth={true}
                                className="w-full"
                            />
                        </div>



                        {/* Loading State */}
                        {isLoadingParents && (
                            <div className="flex items-center justify-center py-8">
                                <CircularProgress size={32} />
                            </div>
                        )}

                        {/* Empty State */}
                        {!isLoadingParents && parentOptions.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                No available parent items found.
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!selectedParent || isSubmitting}
                            className={`px-4 py-2 text-sm font-medium rounded transition-colors flex items-center gap-2 ${selectedParent && !isSubmitting
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            {isSubmitting && <CircularProgress size={14} className="text-white" />}
                            Change parent of selected work item(s)
                        </button>
                    </div>
                </Box>
            </Fade>
        </Modal>
    );
};

export default ChangeParentModal;
