'use client';

import React from 'react';
import { Filter, X } from 'lucide-react';
import Dropdown from '@/utils/Dropdown';
import TagsDropdown from './TagsDropdown';
import IconButton from '@/utils/IconButton';

/**
 * WorkItemsFilter - Reusable filter panel component with transition animation
 * 
 * @param {boolean} isOpen - Controls visibility of the filter panel
 * @param {function} onClose - Callback when close button is clicked
 * @param {object} filters - Current filter values { search, types, states, area, tags }
 * @param {object} filterOptions - Available options for each filter { types, states, areas, tags }
 * @param {object} callbacks - Callback functions for filter changes
 * @param {object} config - Configuration for which filters to show
 * @param {function} renderStateOption - Custom render function for state options
 */
const WorkItemsFilter = ({
    // Visibility & control
    isOpen = false,
    onClose,

    // Current filter values
    filters = {
        search: '',
        types: [],
        states: [],
        area: [],
        tags: { tags: [], operator: 'or' },
        assignedUsers: []
    },

    // Available options for dropdowns
    filterOptions = {
        types: [],
        states: [],
        areas: [],
        tags: [],
        assigneeUsers: []
    },

    // Callbacks for filter changes
    callbacks = {
        onSearchChange: () => { },
        onTypesChange: () => { },
        onStatesChange: () => { },
        onAreaChange: () => { },
        onTagsChange: () => { },
        onAssignToChange: () => { },
    },

    // Configuration for visibility
    config = {
        showSearch: true,
        showTypes: true,
        showStates: true,
        showArea: true,
        showTags: true,
        showAssignTo: true
    },

    backgroundColor = "bg-white",

    // Custom renderers
    renderStateOption,
    renderAssignedUserOption
}) => {
    const {
        onSearchChange,
        onTypesChange,
        onStatesChange,
        onAreaChange,
        onTagsChange,
        onAssignToChange
    } = callbacks;

    const {
        showSearch,
        showTypes,
        showStates,
        showArea,
        showTags,
        showAssignTo
    } = config;

    return (
        <div
            className={`transition-all duration-300  ease-in-out ${isOpen ? 'max-h-20 opacity-100 mb-3' : 'max-h-0 opacity-0'
                }`}
        >
            <div className={`${backgroundColor} rounded flex items-center justify-between px-4 py-2 w-full`}>
                {/* Search Input */}
                {showSearch && (
                    <div className="relative flex-grow">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                            <Filter size={16} />
                        </span>
                        <input
                            type="text"
                            placeholder="Filter by keyword"
                            value={filters.search}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full pl-9 pr-3 py-1 rounded border border-transparent focus:border-blue-500 outline-none transition duration-200"
                        />
                    </div>
                )}

                {/* Filter Dropdowns */}
                <div className="flex items-center gap-2 text-sm text-gray-700 whitespace-nowrap ml-4">
                    {/* Types Filter */}
                    {showTypes && filterOptions.types.length > 0 && (
                        <Dropdown
                            options={filterOptions.types}
                            onSelect={onTypesChange}
                            initialValue="Types"
                            defaultSelected={filters.types}
                            multiSelect={true}
                        />
                    )}

                    {/* States Filter */}
                    {showStates && filterOptions.states.length > 0 && (
                        <Dropdown
                            options={filterOptions.states}
                            onSelect={onStatesChange}
                            initialValue="States"
                            defaultSelected={filters.states}
                            multiSelect={true}
                            renderOption={renderStateOption}
                            minWidth={160}
                        />
                    )}

                    {showAssignTo && filterOptions.assigneeUsers && filterOptions.assigneeUsers.length > 0 && (
                        <Dropdown
                            options={filterOptions.assigneeUsers}
                            onSelect={onAssignToChange}
                            initialValue="Assigned To"
                            defaultSelected={filters.assignedUsers}
                            multiSelect={true}
                            renderOption={renderAssignedUserOption || renderStateOption}
                            minWidth={180}
                        />
                    )}

                    {/* Area Filter */}
                    {showArea && filterOptions.areas.length > 0 && (
                        <Dropdown
                            options={filterOptions.areas}
                            onSelect={onAreaChange}
                            initialValue="Area"
                            defaultSelected={filters.area}
                            multiSelect={true}
                        />
                    )}

                    {/* Tags Filter */}
                    {showTags && filterOptions.tags.length > 0 && (
                        <TagsDropdown
                            tags={filterOptions.tags}
                            onTagsChange={onTagsChange}
                            selectedTags={filters.tags.tags}
                            operator={filters.tags.operator}
                        />
                    )}

                    {/* Close Button */}
                    {onClose && (
                        <IconButton
                            onClick={onClose}
                            icon={<X size={16} />}
                            label=""
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default WorkItemsFilter;
