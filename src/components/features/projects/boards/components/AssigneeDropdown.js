'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, User, Loader2 } from 'lucide-react';
import Tooltip from '@/components/ui/Tooltip';

/**
 * MemberListItem - Reusable member item component
 */
export const MemberListItem = ({ member, isSelected, onSelect, getInitials }) => (
    <button
        onClick={() => onSelect(member)}
        className={`
            w-full px-3 py-2 text-left text-sm flex items-center gap-2
            ${isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}
        `}
    >
        <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-[10px] font-medium">
            {getInitials(member.name)}
        </div>
        <Tooltip title={member?.name} placement="bottom">
            <span className="flex-1 truncate">{member.name}</span>
        </Tooltip>
    </button>
);

/**
 * MembersList - Reusable member list with search, used by both dropdown and list variants
 */
const MembersList = ({
    members = [],
    selectedMember = null,
    onSelect,
    searchTerm = '',
    onSearchChange,
    showSearch = true,
    showUnassigned = true,
    isLoading = false,
    inputRef,
}) => {
    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const filteredMembers = members.filter(member =>
        member.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleUnassign = () => {
        onSelect?.(null);
    };

    if (isLoading) {
        return (
            <div className="px-4 py-3 text-sm text-gray-500 flex items-center justify-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                <span>Loading members...</span>
            </div>
        );
    }

    return (
        <>
            {/* Search Input */}
            {showSearch && (
                <div className="p-2 border-b border-gray-100">
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search members..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange?.(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-blue-400"
                    />
                </div>
            )}

            {/* Members List */}
            <div className="max-h-48 overflow-y-auto py-1">
                {/* Unassign Option */}
                {showUnassigned && (
                    <button
                        onClick={handleUnassign}
                        className="w-full px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                    >
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                            <User size={12} className="text-gray-500" />
                        </div>
                        <span>Unassigned</span>
                    </button>
                )}

                {/* Member Options */}
                {filteredMembers.length > 0 ? (
                    filteredMembers.map((member) => {
                        const isSelected = selectedMember && (
                            selectedMember.userId === member.userId ||
                            selectedMember._id === member._id
                        );
                        return (
                            <MemberListItem
                                key={member._id || member.userId}
                                member={member}
                                isSelected={isSelected}
                                onSelect={onSelect}
                                getInitials={getInitials}
                            />
                        );
                    })
                ) : (
                    <div className="px-3 py-4 text-sm text-gray-500 text-center">
                        {searchTerm ? 'No members found' : 'No members available'}
                    </div>
                )}
            </div>
        </>
    );
};

/**
 * AssigneeDropdown - Lightweight dropdown for assigning work items
 * Supports two variants: 'dropdown' (default) and 'list' (just the list without trigger button)
 * 
 * @param {Object[]} members - Array of member objects { _id, name, userId }
 * @param {Object} selectedMember - Currently assigned member { name, userId }
 * @param {function} onSelect - Callback when a member is selected
 * @param {boolean} disabled - Whether selection is disabled
 * @param {boolean} isLoading - Loading state
 * @param {string} variant - 'dropdown' or 'list'
 */
const AssigneeDropdown = ({
    members = [],
    selectedMember = null,
    onSelect,
    disabled = false,
    isLoading = false,
    variant = 'dropdown',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    // Close dropdown when clicking outside (only for dropdown variant)
    useEffect(() => {
        if (variant !== 'dropdown') return;

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [variant]);

    // Focus search input when dropdown opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const handleSelect = (member) => {
        onSelect?.(member);
        if (variant === 'dropdown') {
            setIsOpen(false);
            setSearchTerm('');
        }
    };

    const assigneeName = selectedMember?.name || 'Unassigned';
    const initials = getInitials(selectedMember?.name);

    // List variant - just render the members list directly
    if (variant === 'list') {
        return (
            <div
                className="bg-white border border-gray-200 rounded-lg shadow-lg min-w-[220px]"
                onClick={(e) => e.stopPropagation()}
            >
                <MembersList
                    members={members}
                    selectedMember={selectedMember}
                    onSelect={handleSelect}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    showSearch={true}
                    showUnassigned={true}
                    isLoading={isLoading}
                    inputRef={inputRef}
                />
            </div>
        );
    }

    // Dropdown variant - render trigger button with dropdown
    return (
        <div
            ref={dropdownRef}
            className="relative"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
        >
            {/* Trigger Button */}
            <button
                onClick={() => !disabled && !isLoading && setIsOpen(!isOpen)}
                disabled={disabled || isLoading}
                className={`
                    flex items-center gap-1.5 py-1 rounded-md
                    text-xs transition-all duration-150
                    ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer'}
                    ${isOpen ? 'bg-gray-100' : ''}
                `}
            >
                {isLoading ? (
                    <Loader2 size={14} className="animate-spin text-blue-600" />
                ) : (
                    <>
                        <div className={`
                            w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-medium
                            ${selectedMember ? 'bg-purple-600' : 'bg-gray-400'}
                        `}>
                            {selectedMember ? initials : <User size={10} />}
                        </div>
                        <span className="text-gray-700 max-w-[80px] truncate">
                            <Tooltip placement="top" title={assigneeName}>{assigneeName}</Tooltip>
                        </span>
                        <ChevronDown size={12} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </>
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute left-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <MembersList
                        members={members}
                        selectedMember={selectedMember}
                        onSelect={handleSelect}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        showSearch={true}
                        showUnassigned={!!selectedMember}
                        isLoading={isLoading}
                        inputRef={inputRef}
                    />
                </div>
            )}
        </div>
    );
};

// Export MembersList for direct use in other components
export { MembersList };
export default AssigneeDropdown;
