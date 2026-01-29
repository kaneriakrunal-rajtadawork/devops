'use client';

import React, { useState } from 'react';
import { Popover, MenuItem, MenuList, Divider, ListItemIcon, ListItemText, Avatar } from '@mui/material';
import { Ellipsis, ExternalLink, Trash2, UserPlus, ChevronRight, Edit, User } from 'lucide-react';

/**
 * SubItemMenu - A reusable menu component for sub work items
 * Displays options like Open, Assign To (with user list), and Delete
 */
const SubItemMenu = ({
    subItem,
    members = [],
    onOpen,
    onAssignTo,
    onEditTitle,
    onDelete,
}) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [assignAnchorEl, setAssignAnchorEl] = useState(null);

    const isOpen = Boolean(anchorEl);
    const isAssignSubmenuOpen = Boolean(assignAnchorEl);

    const handleOpenMenu = (event) => {
        event.stopPropagation();
        event.preventDefault();
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
        setAssignAnchorEl(null);
    };

    const [editTitleAnchorEl, setEditTitleAnchorEl] = useState(null);
    const isEditTitleSubmenuOpen = Boolean(editTitleAnchorEl);

    const handleOpenEditTitleSubmenu = (event) => {
        event.stopPropagation();
        setEditTitleAnchorEl(event.currentTarget);
    };

    const handleCloseEditTitleSubmenu = () => {
        setEditTitleAnchorEl(null);
    };

    const handleOpenAssignSubmenu = (event) => {
        event.stopPropagation();
        setAssignAnchorEl(event.currentTarget);
    };

    const handleCloseAssignSubmenu = () => {
        setAssignAnchorEl(null);
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

    // Get initials from name
    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <>
            <div
                onClick={handleOpenMenu}
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onDragStart={(e) => e.preventDefault()}
                draggable={false}
                className="hover:bg-blue-100 transition-colors mr-1 p-0.5 rounded cursor-pointer"
            >
                <Ellipsis size={16} />
            </div>

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
                slotProps={{
                    paper: {
                        onPointerDown: (e) => e.stopPropagation(),
                        onMouseDown: (e) => e.stopPropagation(),
                    },
                    backdrop: {
                        onPointerDown: (e) => e.stopPropagation(),
                        onMouseDown: (e) => e.stopPropagation(),
                        onClick: (e) => e.stopPropagation(),
                    }
                }}
            >
                <MenuList dense sx={{ py: 0.5 }}>
                    {/* Open */}
                    <MenuItem
                        onClick={(e) => {
                            e.stopPropagation();
                            onOpen?.(subItem);
                            handleCloseMenu();
                        }}
                        sx={menuItemStyles}
                    >
                        <ListItemIcon sx={listItemIconStyles}>
                            <ExternalLink size={14} />
                        </ListItemIcon>
                        <ListItemText>Open</ListItemText>
                    </MenuItem>

                    <Divider sx={{ my: 0.5 }} />

                    {/* Assign To */}
                    <MenuItem
                        onClick={handleOpenAssignSubmenu}
                        sx={menuItemStyles}
                    >
                        <ListItemIcon sx={listItemIconStyles}>
                            <UserPlus size={14} />
                        </ListItemIcon>
                        <ListItemText>Assign To</ListItemText>
                        <ChevronRight size={14} className="ml-2 text-gray-400" />
                    </MenuItem>

                    {/* Edit Title */}
                    <MenuItem
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            // Close menu first, then trigger edit after a small delay
                            handleCloseMenu();
                            setTimeout(() => {
                                onEditTitle?.(subItem);
                            }, 50);
                        }}
                        sx={menuItemStyles}
                    >
                        <ListItemIcon sx={listItemIconStyles}>
                            <Edit size={14} />
                        </ListItemIcon>
                        <ListItemText>Edit Title</ListItemText>
                    </MenuItem>


                    {/* Delete */}
                    <MenuItem
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete?.(subItem);
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
                </MenuList>
            </Popover>

            {/* Assign To Submenu */}
            <Popover
                open={isAssignSubmenuOpen}
                anchorEl={assignAnchorEl}
                onClose={handleCloseAssignSubmenu}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                sx={popoverStyles}
                slotProps={{
                    paper: {
                        onPointerDown: (e) => e.stopPropagation(),
                        onMouseDown: (e) => e.stopPropagation(),
                    },
                    backdrop: {
                        onPointerDown: (e) => e.stopPropagation(),
                        onMouseDown: (e) => e.stopPropagation(),
                        onClick: (e) => e.stopPropagation(),
                    }
                }}
            >
                <MenuList dense sx={{ py: 0.5, maxHeight: '240px', overflowY: 'auto' }}>
                    {/* Unassigned option */}
                    <MenuItem
                        onClick={(e) => {
                            e.stopPropagation();
                            onAssignTo?.(subItem, null);
                            handleCloseMenu();
                        }}
                        sx={menuItemStyles}
                    >
                       <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                            <User size={12} className="text-gray-500" />
                        </div>
                        <ListItemText>Unassigned</ListItemText>
                    </MenuItem>

                    <Divider sx={{ my: 0.5 }} />

                    {/* Members list */}
                    {members.map((member) => (
                        <MenuItem
                            key={member._id}
                            onClick={(e) => {
                                e.stopPropagation();
                                onAssignTo?.(subItem, member);
                                handleCloseMenu();
                            }}
                            sx={menuItemStyles}
                        >
                            <Avatar
                                sx={{
                                    width: 24,
                                    height: 24,
                                    fontSize: '0.75rem',
                                    mr: 1.5,
                                    bgcolor: '#3b82f6'
                                }}
                            >
                                {getInitials(member.name)}
                            </Avatar>
                            <ListItemText>{member.name}</ListItemText>
                        </MenuItem>
                    ))}

                    {members.length === 0 && (
                        <MenuItem disabled sx={{ ...menuItemStyles, color: '#9ca3af' }}>
                            <ListItemText>No members available</ListItemText>
                        </MenuItem>
                    )}
                </MenuList>
            </Popover>
        </>
    );
};

export default SubItemMenu;
