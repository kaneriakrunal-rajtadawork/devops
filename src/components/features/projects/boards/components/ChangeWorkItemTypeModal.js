'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Fade, Box, CircularProgress } from '@mui/material';
import { X, ExternalLink } from 'lucide-react';
import Dropdown from '@/utils/Dropdown';
import WorkItemTypeIcon from '@/components/ui/WorkItemTypeIcon';
import { WORKITEMTYPE } from '@/constants/common.constants';

/**
 * ChangeWorkItemTypeModal - Modal for changing the type of a work item
 * Centered modal with fade animation
 */
const ChangeWorkItemTypeModal = ({
    open,
    onClose,
    workItem,
    projectId,
    repoId,
    onSubmit,
    isSubmitting = false,
}) => {
    const [selectedType, setSelectedType] = useState(null);
    const [reason, setReason] = useState('');

    // Define available work item types
    const workItemTypeOptions = React.useMemo(() => {
        const allTypes = [
            { id: WORKITEMTYPE.EPIC, label: 'Epic', type: WORKITEMTYPE.EPIC },
            { id: WORKITEMTYPE.ISSUE, label: 'Issue', type: WORKITEMTYPE.ISSUE },
            { id: WORKITEMTYPE.TASK, label: 'Task', type: WORKITEMTYPE.TASK },
        ];

        // Exclude the current type
        return allTypes.filter(item => item.id !== workItem?.type);
    }, [workItem]);

    // Reset selection when modal opens
    useEffect(() => {
        if (open) {
            setSelectedType(null);
            setReason('');
        }
    }, [open]);

    const handleTypeSelect = (option) => {
        setSelectedType(option);
    };

    const handleSubmit = () => {
        if (selectedType && onSubmit) {
            onSubmit(workItem, selectedType.id, reason);
        }
    };

    // Custom render for work item type options with icon
    const renderTypeOption = (option) => (
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
            aria-labelledby="change-type-modal"
        >
            <Fade in={open}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: { xs: '90%', sm: '500px' },
                        maxWidth: '500px',
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        display: 'flex',
                        flexDirection: 'column',
                        outline: 'none',
                        borderRadius: 1,
                    }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Change work item type
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            aria-label="Close"
                        >
                            <X size={18} className="text-gray-500" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-5 space-y-4">
                        {/* Type Selector */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Type
                            </label>
                            <Dropdown
                                options={workItemTypeOptions}
                                initialValue="Select a work item type"
                                onSelect={handleTypeSelect}
                                renderOption={renderTypeOption}
                                fullWidth={true}
                                className="w-full"
                            />
                        </div>

                        {/* Reason Text Area */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Add a reason for changing the type
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Click to add Notes for History"
                                rows={4}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-200 bg-gray-50">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!selectedType || isSubmitting}
                            className={`px-6 py-2 text-sm font-medium rounded transition-colors flex items-center gap-2 ${selectedType && !isSubmitting
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            {isSubmitting && <CircularProgress size={14} className="text-white" />}
                            OK
                        </button>
                    </div>
                </Box>
            </Fade>
        </Modal>
    );
};

export default ChangeWorkItemTypeModal;
