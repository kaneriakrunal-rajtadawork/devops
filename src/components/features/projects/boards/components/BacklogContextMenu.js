'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
    Trash2,
    UserPlus,
    Link2,
    Network,
    ArrowLeftRight,
    ChevronRight,
    Menu
} from 'lucide-react';
import useFetchMembers from '../hooks/useFetchMembers';
import AssigneeDropdown from './AssigneeDropdown';
import { WORKITEMTYPE } from '@/constants/common.constants';

/**
 * BacklogContextMenu - Right-click context menu for backlog rows
 * Uses AssigneeDropdown with variant="list" for consistent member selection UI
 */
export default function BacklogContextMenu({
    x,
    y,
    workItem,
    onClose,
    onAssign,
    onDelete,
    onCopy,
    onEmail,
    onMovePosition,
    onChangeType,
    onChangeParent,
    repoId,
}) {
    const menuRef = useRef(null);
    const submenuRef = useRef(null);
    const [assignSubmenuOpen, setAssignSubmenuOpen] = useState(false);
    const [assignSubmenuPosition, setAssignSubmenuPosition] = useState({ x: 0, y: 0 });

    // Fetch members using the reusable hook
    const { members, isLoading: membersLoading } = useFetchMembers(repoId, {
        apiEndpoint: 'ems-kanban-sync'
    });


    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            const isInsideMenu = menuRef.current?.contains(event.target);
            const isInsideSubmenu = submenuRef.current?.contains(event.target);

            if (!isInsideMenu && !isInsideSubmenu) {
                onClose();
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                if (assignSubmenuOpen) {
                    setAssignSubmenuOpen(false);
                } else {
                    onClose();
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose, assignSubmenuOpen]);

    // Handle assign submenu open
    const handleOpenAssignSubmenu = (e) => {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        setAssignSubmenuPosition({
            x: rect.right + 2,
            y: rect.top,
        });
        setAssignSubmenuOpen(true);
    };

    // Handle assign to member
    const handleAssignTo = (member) => {
        onAssign?.(workItem, member);
        onClose();
    };

    const menuItems = [
        {
            id: 'assign',
            label: 'Assign to',
            icon: <UserPlus size={16} />,
            hasSubmenu: true,
        },
        // {
        //     id: 'link',
        //     label: 'Copy link',
        //     icon: <Link2 size={16} />,
        //     action: () => {
        //         const link = `${window.location.origin}${window.location.pathname}?id=${workItem.id}`;
        //         navigator.clipboard.writeText(link);
        //         onClose();
        //     },
        // },
        {
            id: 'delete',
            label: 'Delete',
            icon: <Trash2 size={16} />,
            action: onDelete,
            danger: false,
        },
        { type: 'divider' },
        {
            id: 'changeParent',
            label: 'Change Parent',
            icon: <Network size={16} />,
            action: onChangeParent,
            disabled: workItem?.type === WORKITEMTYPE.EPIC, // Epics cannot have parents
        },
        // {
        //     id: 'movePosition',
        //     label: 'Move Position',
        //     icon: <Menu size={16} />,
        //     action: onMovePosition,
        // },
        // { type: 'divider' },
        {
            id: 'changeType',
            label: 'Change Type',
            icon: <ArrowLeftRight size={16} />,
            action: onChangeType,
        },
    ];

    const handleItemClick = (item) => {
        if (item.hasSubmenu || item.disabled) return;
        if (item.action) {
            item.action(workItem);
        }
        onClose();
    };

    return (
        <>
            <div
                ref={menuRef}
                className="fixed bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50 min-w-[200px]"
                style={{
                    left: `${x}px`,
                    top: `${y}px`,
                }}
            >
                {menuItems.map((item, index) => {
                    if (item.type === 'divider') {
                        return (
                            <div
                                key={`divider-${index}`}
                                className="h-px bg-gray-200 my-1"
                            />
                        );
                    }

                    if (item.hasSubmenu) {
                        return (
                            <button
                                key={item.id}
                                onMouseEnter={handleOpenAssignSubmenu}
                                className="w-full text-left px-4 py-2 text-sm flex items-center justify-between gap-3 transition-colors text-gray-700 hover:bg-gray-100"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="flex-shrink-0">{item.icon}</span>
                                    <span>{item.label}</span>
                                </div>
                                <ChevronRight size={14} className="text-gray-400" />
                            </button>
                        );
                    }

                    return (
                        <button
                            key={item.id}
                            onClick={() => handleItemClick(item)}
                            onMouseEnter={() => setAssignSubmenuOpen(false)}
                            disabled={item.disabled}
                            className={`
                                w-full text-left px-4 py-2 text-sm flex items-center gap-3
                                transition-colors
                                ${item.disabled
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : item.danger
                                        ? 'text-red-600 hover:bg-red-50'
                                        : 'text-gray-700 hover:bg-gray-100'
                                }
                            `}
                        >
                            <span className="flex-shrink-0">{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Assign To Submenu - Using AssigneeDropdown with list variant */}
            {assignSubmenuOpen && (
                <div
                    ref={submenuRef}
                    className="fixed z-[60]"
                    style={{
                        left: `${assignSubmenuPosition.x}px`,
                        top: `${assignSubmenuPosition.y}px`,
                    }}
                    onMouseEnter={() => setAssignSubmenuOpen(true)}
                    onMouseLeave={() => setAssignSubmenuOpen(false)}
                >
                    <AssigneeDropdown
                        variant="list"
                        members={members}
                        selectedMember={workItem?.assignedUser}
                        onSelect={handleAssignTo}
                        isLoading={membersLoading}
                    />
                </div>
            )}
        </>
    );
}
