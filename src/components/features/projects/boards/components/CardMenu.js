'use client';

import React, { useState, useRef } from 'react';
import { Popover, MenuItem, MenuList, Divider, ListItemIcon, ListItemText } from '@mui/material';
import { MoreHorizontal, Edit2, MoveRight, Plus, GitBranch, Trash2, RotateCcw, ChevronRight } from 'lucide-react';

const CardMenu = ({
    onEditTitle,
    onMoveToColumn,
    onAddUserStory,
    onAddTest,
    onDelete,
    onMoveToIteration,
    onOpen,
    onNewBranch,
    columns,
    currentColumn,
    item
}) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [columnAnchorEl, setColumnAnchorEl] = useState(null);
    const [iterationAnchorEl, setIterationAnchorEl] = useState(null);

    const isOpen = Boolean(anchorEl);
    const isColumnSubmenuOpen = Boolean(columnAnchorEl);
    const isIterationSubmenuOpen = Boolean(iterationAnchorEl);

    const handleOpenMenu = (event) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
        setColumnAnchorEl(null);
        setIterationAnchorEl(null);
    };

    const handleOpenColumnSubmenu = (event) => {
        setColumnAnchorEl(event.currentTarget);
        setIterationAnchorEl(null);
    };

    const handleOpenIterationSubmenu = (event) => {
        setIterationAnchorEl(event.currentTarget);
        setColumnAnchorEl(null);
    };

    const handleCloseColumnSubmenu = () => {
        setColumnAnchorEl(null);
    };

    const handleCloseIterationSubmenu = () => {
        setIterationAnchorEl(null);
    };

    const menuItemStyles = {
        fontSize: '0.875rem',
        py: 1,
        px: 2,
        '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
        },
    };

    const listItemIconStyles = {
        minWidth: '28px',
        color: 'inherit',
    };

    const popoverStyles = {
        '& .MuiPaper-root': {
            borderRadius: '6px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            minWidth: '180px',
        },
    };

    return (
        <div className="relative">
            <button
                onClick={handleOpenMenu}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200 opacity-0 group-hover:opacity-100"
                aria-label="Card options"
            >
                <MoreHorizontal size={16} className="text-gray-600" />
            </button>

            {/* Main Menu */}
            <Popover
                open={isOpen}
                anchorEl={anchorEl}
                onClose={handleCloseMenu}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                sx={popoverStyles}
            >
                <MenuList dense sx={{ py: 0.5 }}>
                    {/* Open */}
                    <MenuItem
                        onClick={(e) => {
                            onOpen?.(e);
                            handleCloseMenu();
                        }}
                        sx={menuItemStyles}
                    >
                        <ListItemIcon sx={listItemIconStyles}>
                            <RotateCcw size={14} />
                        </ListItemIcon>
                        <ListItemText>Open</ListItemText>
                    </MenuItem>

                    {/* Edit Title */}
                    <MenuItem
                        onClick={() => {
                            onEditTitle?.();
                            handleCloseMenu();
                        }}
                        sx={menuItemStyles}
                    >
                        <ListItemIcon sx={listItemIconStyles}>
                            <Edit2 size={14} />
                        </ListItemIcon>
                        <ListItemText>Edit title</ListItemText>
                    </MenuItem>

                    {/* Move to Iteration */}
                    {/* <MenuItem
                        onClick={handleOpenIterationSubmenu}
                        sx={menuItemStyles}
                    >
                        <ListItemIcon sx={listItemIconStyles}>
                            <MoveRight size={14} />
                        </ListItemIcon>
                        <ListItemText>Move to iteration</ListItemText>
                        <ChevronRight size={14} className="ml-2 text-gray-400" />
                    </MenuItem> */}

                    {/* Move to Column */}
                    <MenuItem
                        onClick={handleOpenColumnSubmenu}
                        sx={menuItemStyles}
                    >
                        <ListItemIcon sx={listItemIconStyles}>
                            <MoveRight size={14} />
                        </ListItemIcon>
                        <ListItemText>Move to column</ListItemText>
                        <ChevronRight size={14} className="ml-2 text-gray-400" />
                    </MenuItem>

                    <Divider sx={{ my: 0.5 }} />

                    {/* Add User Story */}
                    {/* <MenuItem
                        onClick={() => {
                            onAddUserStory?.();
                            handleCloseMenu();
                        }}
                        sx={menuItemStyles}
                    >
                        <ListItemIcon sx={listItemIconStyles}>
                            <Plus size={14} />
                        </ListItemIcon>
                        <ListItemText>Add User Story</ListItemText>
                    </MenuItem> */}

                    {/* Add Test */}
                    {/* <MenuItem
                        onClick={() => {
                            onAddTest?.();
                            handleCloseMenu();
                        }}
                        sx={menuItemStyles}
                    >
                        <ListItemIcon sx={listItemIconStyles}>
                            <Plus size={14} />
                        </ListItemIcon>
                        <ListItemText>Add Test</ListItemText>
                    </MenuItem> */}


                    {/* Delete */}
                    <MenuItem
                        onClick={() => {
                            onDelete?.();
                            handleCloseMenu();
                        }}
                        sx={{
                            ...menuItemStyles,
                            color: '#dc2626',
                            '&:hover': {
                                backgroundColor: 'rgba(220, 38, 38, 0.04)',
                            },
                        }}
                    >
                        <ListItemIcon sx={{ ...listItemIconStyles, color: '#dc2626' }}>
                            <Trash2 size={14} />
                        </ListItemIcon>
                        <ListItemText>Delete</ListItemText>
                    </MenuItem>


                    {/* New Branch */}
                    {/* <MenuItem
                        onClick={() => {
                            onNewBranch?.();
                            handleCloseMenu();
                        }}
                        sx={menuItemStyles}
                    >
                        <ListItemIcon sx={listItemIconStyles}>
                            <GitBranch size={14} />
                        </ListItemIcon>
                        <ListItemText>New branch...</ListItemText>
                    </MenuItem> */}
                </MenuList>
            </Popover>

            {/* Column Submenu */}
            <Popover
                open={isColumnSubmenuOpen}
                anchorEl={columnAnchorEl}
                onClose={handleCloseColumnSubmenu}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                sx={popoverStyles}
            >
                <MenuList dense sx={{ py: 0.5 }}>
                    {columns?.filter(col => col.id !== currentColumn).map((column) => (
                        <MenuItem
                            key={column.id}
                            onClick={() => {
                                onMoveToColumn?.(column.id);
                                handleCloseMenu();
                            }}
                            sx={menuItemStyles}
                        >
                            <span className={`w-2 h-2 rounded-full mr-3 ${column.id === 'doing' ? 'bg-blue-500' :
                                    column.id === 'done' ? 'bg-green-500' :
                                        'bg-gray-400'
                                }`}></span>
                            {column.title}
                        </MenuItem>
                    ))}
                </MenuList>
            </Popover>

            {/* Iteration Submenu */}
            <Popover
                open={isIterationSubmenuOpen}
                anchorEl={iterationAnchorEl}
                onClose={handleCloseIterationSubmenu}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                sx={popoverStyles}
            >
                <MenuList dense sx={{ py: 0.5 }}>
                    {['Sprint 1', 'Sprint 2', 'Sprint 3'].map((iteration) => (
                        <MenuItem
                            key={iteration}
                            onClick={() => {
                                onMoveToIteration?.(iteration);
                                handleCloseMenu();
                            }}
                            sx={menuItemStyles}
                        >
                            {iteration}
                        </MenuItem>
                    ))}
                </MenuList>
            </Popover>
        </div>
    );
};

export default CardMenu;