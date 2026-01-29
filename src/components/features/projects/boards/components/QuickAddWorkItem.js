'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Popper, Paper, Fade, ClickAwayListener } from '@mui/material';
import SplitButton from '@/components/reusables/SplitButton';
import WorkItemTypeIcon from '@/components/ui/WorkItemTypeIcon';
import InputBase from "@/components/reusables/InputBase";
// Position options for adding work items
const ADD_POSITION_OPTIONS = [
    { label: 'Add to top', value: 'top' },
    { label: 'Add to bottom', value: 'bottom' },
    // { label: 'Add at selection', value: 'selection' },
];

/**
 * QuickAddWorkItem - Inline work item creation with dropdown panel
 */
const QuickAddWorkItem = ({
    workItemType = 'Epic',
    isOpen: externalIsOpen,
    onToggle,
    onAdd,
    isLoading = false,
    placeholder = 'Enter title',
    className = '',
    defaultPosition = 'top',
}) => {
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const isControlled = externalIsOpen !== undefined;
    const isOpen = isControlled ? externalIsOpen : internalIsOpen;

    const [title, setTitle] = useState('');
    const [selectedPosition, setSelectedPosition] = useState(defaultPosition);
    const inputRef = useRef(null);
    const anchorRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    const handleToggle = () => {
        if (isControlled && onToggle) {
            onToggle(!isOpen);
        } else {
            setInternalIsOpen(!internalIsOpen);
        }
    };

    const handleClose = (event) => {
        // Don't close if clicking inside the split button dropdown
        if (event?.target?.closest('.MuiPopper-root')) return;

        if (isControlled && onToggle) {
            onToggle(false);
        } else {
            setInternalIsOpen(false);
        }
        setTitle('');
    };

    const handlePositionSelect = (option) => {
        setSelectedPosition(option.value);
    };

    const handleAdd = () => {
        if (!title.trim() || isLoading) return;
        if (onAdd) {
            onAdd(title.trim(), selectedPosition);
        }
        setTitle('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAdd();
        } else if (e.key === 'Escape') {
            handleClose();
        }
    };

    return (
        <div className={className}>
            {/* New Work Item Button */}
            <button
                ref={anchorRef}
                onClick={handleToggle}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded cursor-pointer"
            >
                + New Work Item
            </button>

            {/* Dropdown Panel */}
            <Popper
                open={isOpen}
                anchorEl={anchorRef.current}
                placement="bottom-start"
                transition
                sx={{ zIndex: 1300 }}
            >
                {({ TransitionProps }) => (
                    <Fade {...TransitionProps}>
                        <Paper elevation={8} sx={{ mt: 0.5, p: 1 }}>
                            <ClickAwayListener onClickAway={handleClose}>
                                <div className="flex items-center gap-2">
                                    <WorkItemTypeIcon type={workItemType} size={18} />

                                    <InputBase
                                        inputRef={inputRef}
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder={placeholder}
                                        disabled={isLoading}
                                        sx={{
                                            width: 180,
                                            border: '1px solid #ccc',
                                            borderRadius: '3px',
                                            px: 1,
                                            py: 0.25,
                                            fontSize: '13px',
                                            '&:focus-within': {
                                                borderColor: '#0078d4',
                                            },
                                        }}
                                    />

                                    <SplitButton
                                        options={ADD_POSITION_OPTIONS}
                                        selectedValue={selectedPosition}
                                        onSelect={handlePositionSelect}
                                        onClick={handleAdd}
                                        disabled={!title.trim() || isLoading}
                                    />
                                </div>
                            </ClickAwayListener>
                        </Paper>
                    </Fade>
                )}
            </Popper>
        </div>
    );
};

export default QuickAddWorkItem;
