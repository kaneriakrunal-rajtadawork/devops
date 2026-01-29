'use client';

import React from 'react';
import { Filter, X } from 'lucide-react';
import clsx from 'clsx';
import IconButton from '@/utils/IconButton';

/**
 * FilterBar - A generic, reusable filter panel component
 * 
 * @example
 * <FilterBar
 *   isOpen={isFilterOpen}
 *   onClose={() => setIsFilterOpen(false)}
 *   searchValue={searchText}
 *   onSearchChange={(e) => setSearchText(e.target.value)}
 *   searchPlaceholder="Filter by keyword"
 * >
 *   <Dropdown options={types} onSelect={handleTypeFilter} />
 *   <Dropdown options={states} onSelect={handleStateFilter} />
 * </FilterBar>
 */
const FilterBar = ({
    isOpen = false,
    onClose,
    searchValue = '',
    onSearchChange,
    searchPlaceholder = 'Filter by keyword',
    showSearch = true,
    children, // Dropdown filters, custom filters
    className = '',
    searchClassName = '',
    filtersClassName = '',
}) => {
    if (!isOpen) return null;

    return (
        <div className={clsx(
            'bg-white shadow-sm rounded flex items-center justify-between px-4 py-2 w-full mt-2',
            className
        )}>
            {/* Search Input */}
            {showSearch && (
                <div className={clsx('relative flex-grow', searchClassName)}>
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                        <Filter size={16} />
                    </span>
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchValue}
                        onChange={onSearchChange}
                        className="w-full pl-9 pr-3 py-1 rounded border border-transparent focus:border-blue-500 outline-none transition duration-200"
                    />
                </div>
            )}

            {/* Filter Controls */}
            <div className={clsx(
                'flex items-center gap-2 text-sm text-gray-700 whitespace-nowrap',
                showSearch && 'ml-4',
                filtersClassName
            )}>
                {children}

                {onClose && (
                    <IconButton
                        onClick={onClose}
                        icon={<X size={16} />}
                        label=""
                    />
                )}
            </div>
        </div>
    );
};

export default FilterBar;
