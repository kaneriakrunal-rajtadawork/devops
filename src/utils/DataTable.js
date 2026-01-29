'use client';
import React from 'react';
import WorkItemsDataGrid from '@/components/ui/WorkItemsDataGrid';

/**
 * DataTable - Work items data table component
 * 
 * This is a wrapper around WorkItemsDataGrid that provides
 * backward compatibility with the existing API.
 * 
 * @param {Array} workItems - Array of work items to display
 * @param {string} searchText - Text search filter (applied externally via API)
 * @param {Array} typeFilter - Type filter (applied externally via API)
 * @param {Array} stateFilter - State filter (applied externally via API)
 * @param {Array} areaFilter - Area filter (applied externally via API)
 * @param {boolean} loading - Loading state
 * @param {Function} onRowClick - Callback when a row is clicked
 * @param {Object} pagination - Server-side pagination info { page, limit, total, totalPages, hasNext, hasPrev }
 * @param {Function} onPageChange - Callback when page changes (receives new page number)
 */
export default function DataTable({
    workItems = [],
    searchText = '',
    typeFilter = [],
    stateFilter = [],
    areaFilter = [],
    loading = false,
    onRowClick,
    onAction,
    pagination = null,
    onPageChange
}) {
    // The WorkItemsDataGrid handles all display logic
    // Filtering is now done server-side via the API
    return (
        <WorkItemsDataGrid
            workItems={workItems}
            loading={loading}
            onRowClick={onRowClick}
            onAction={onAction}
            pagination={pagination}
            onPageChange={onPageChange}
            sx={{ height: '100%', minHeight: 400 }}
        />
    );
}

