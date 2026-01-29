'use client';
import React, { useMemo, useState } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    flexRender,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, ChevronsUpDown, MessageSquare, ChevronLeft, ChevronRight, Check, Minus, MoreHorizontal, Ellipsis, Loader2, User } from 'lucide-react';
import WorkItemTypeIcon from './WorkItemTypeIcon';
import StateIndicator from './StateIndicator';
import Tooltip from './Tooltip';
import Image from "next/image";

// Cell Components
const TitleCell = ({ row }) => (
    <div className="flex items-center gap-2 min-w-0">
        <WorkItemTypeIcon type={row.original.type} size={18} />
        <span className="text-blue-600 hover:underline cursor-pointer truncate">
            {row.original.title}
        </span>
    </div>
);

const TagsCell = ({ value }) => {
    if (!value?.length) return null;
    return (
        <div className="flex gap-1 flex-wrap">
            {value.slice(0, 2).map((tag, i) => (
                <span key={i} className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded">{tag}</span>
            ))}
            {value.length > 2 && <span className="text-xs text-gray-500">+{value.length - 2}</span>}
        </div>
    );
};

const CommentsCell = ({ value }) => {
    const count = !isNaN(value) ? value : 0;
    if (!count) return null;
    return (
        <div className="flex items-center gap-1 text-gray-500">
            <MessageSquare size={14} />
            <span>{count}</span>
        </div>
    );
};

const DateCell = ({ value }) => {
    if (!value) return null;
    const d = new Date(value);
    return (
        <span className="text-gray-500 whitespace-nowrap">
            {d.toLocaleDateString()} {d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
        </span>
    );
};

// Assigned User Cell with avatar
const AssignedUserCell = ({ value }) => {
    if (!value || !value.name) {
        return (
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                    <User size={12} className="text-gray-500" />
                </div>
                <span className="text-sm text-gray-500">Unassigned</span>
            </div>
        );
    }

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-[10px] font-medium">
                {getInitials(value.name)}
            </div>
            <Tooltip title={value.name}>
                <span className="text-sm text-gray-700 truncate max-w-[120px]">{value.name}</span>

            </Tooltip>
        </div>
    );
};

const SortIcon = ({ column }) => {
    const sorted = column.getIsSorted();
    if (!column.getCanSort()) return null;
    return (
        <span className="ml-1 opacity-50">
            {sorted === 'asc' ? <ChevronUp size={14} /> : sorted === 'desc' ? <ChevronDown size={14} /> : <ChevronsUpDown size={14} />}
        </span>
    );
};

// Selection checkbox component
const SelectionCheckbox = ({ checked, indeterminate, onChange }) => (
    <div
        onClick={(e) => { e.stopPropagation(); onChange(e); }}
        className={`w-5 h-5 rounded-full border flex items-center justify-center cursor-pointer transition-colors
      ${checked ? 'bg-blue-600 border-blue-600' : 'border-gray-300 hover:border-blue-400'}`}
    >
        {checked && <Check size={14} className="text-white" />}
    </div>
);

// Row actions dropdown that appears on hover
const RowHoverActions = ({ row, onAction, showMenu, setShowMenu }) => {
    const menuItems = [
        // { id: 'openInQueries', label: 'Open selected items in Queries', icon: null },
        // { id: 'copy', label: 'Copy to clipboard', icon: null },
        // { id: 'email', label: 'Email...', icon: null },
        { id: 'delete', label: 'Delete', icon: null, danger: true },
    ];

    return (
        <div className="relative">
            <button
                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 text-gray-500"
            >
                <Ellipsis size={14} />
            </button>

            {showMenu && (
                <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg py-1 z-50 min-w-[200px]">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={(e) => {
                                e.stopPropagation();
                                onAction?.(item.id, row.original);
                                setShowMenu(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 
                ${item.danger ? 'text-red-600' : 'text-gray-700'}`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default function WorkItemsDataGrid({
    workItems = [],
    loading = false,
    onRowClick,
    onAction,
    onSelectionChange,
    pageSize = 20,
    pagination = null, // Server-side pagination info: { page, limit, total, totalPages, hasNext, hasPrev }
    onPageChange // Callback for server-side pagination: (newPage) => void
}) {
    const [sorting, setSorting] = useState([]);
    const [rowSelection, setRowSelection] = useState({});
    const [hoveredRowId, setHoveredRowId] = useState(null);
    const [activeMenuRowId, setActiveMenuRowId] = useState(null);

    // Clear selection when data changes (page change, filter change, etc.)
    React.useEffect(() => {
        setRowSelection({});
    }, [workItems]);

    // Determine if using server-side pagination
    const isServerPagination = pagination !== null && onPageChange !== undefined;

    const columns = useMemo(() => [
        // Selection column
        {
            id: 'select',
            header: ({ table }) => (
                <SelectionCheckbox
                    checked={table.getIsAllRowsSelected()}
                    indeterminate={table.getIsSomeRowsSelected()}
                    onChange={table.getToggleAllRowsSelectedHandler()}
                />
            ),
            cell: ({ row }) => {
                const isSelected = row.getIsSelected();
                const isHovered = hoveredRowId === row.id;
                return (
                    <div style={{ visibility: isHovered || isSelected ? 'visible' : 'hidden' }}>
                        <SelectionCheckbox
                            checked={isSelected}
                            onChange={row.getToggleSelectedHandler()}
                        />
                    </div>
                );
            },
            size: 50,
            enableSorting: false,
        },
        { accessorKey: 'number', header: 'ID', size: 70 },
        {
            accessorKey: 'title',
            header: 'Title',
            size: 350,
            cell: ({ row }) => (
                <div className="flex items-center justify-between gap-2">
                    <TitleCell row={row} />
                    <div style={{ visibility: hoveredRowId === row.id ? 'visible' : 'hidden' }}>
                        <RowHoverActions
                            row={row}
                            onAction={onAction}
                            showMenu={activeMenuRowId === row.id}
                            setShowMenu={(show) => setActiveMenuRowId(show ? row.id : null)}
                        />
                    </div>
                </div>
            )
        },
        { accessorKey: 'state', header: 'State', size: 120, cell: ({ getValue }) => <StateIndicator state={getValue()} /> },
        {
            accessorKey: 'assignedUser',
            header: 'Assigned To',
            size: 150,
            cell: ({ getValue }) => <AssignedUserCell value={getValue()} />,
            enableSorting: false
        },
        { id: 'areaPath', header: 'Area Path', size: 180, accessorFn: (row) => row.area || row.project?.title || 'N/A' },
        { accessorKey: 'tags', header: 'Tags', size: 150, enableSorting: false, cell: ({ getValue }) => <TagsCell value={getValue()} /> },
        { accessorKey: 'commentsCount', header: 'Comments', size: 100, cell: ({ getValue }) => <CommentsCell value={getValue()} /> },
        { accessorKey: 'updatedAt', header: 'Changed Date', size: 180, cell: ({ getValue }) => <DateCell value={getValue()} /> },
    ], [hoveredRowId, activeMenuRowId, onAction]);

    const data = useMemo(() => workItems.map((item, i) => ({ ...item, id: item.id || item._id || `row-${i}` })), [workItems]);

    const table = useReactTable({
        data,
        columns,
        state: { sorting, rowSelection },
        onSortingChange: setSorting,
        onRowSelectionChange: (updater) => {
            const newSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
            setRowSelection(newSelection);
            // Notify parent of selected items
            if (onSelectionChange) {
                const selectedRows = Object.keys(newSelection).filter(k => newSelection[k]).map(k => data[parseInt(k)]);
                onSelectionChange(selectedRows);
            }
        },
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        // Only use client-side pagination if not using server-side
        ...(isServerPagination ? {} : { getPaginationRowModel: getPaginationRowModel() }),
        enableRowSelection: true,
        initialState: { pagination: { pageSize } },
        // For server-side pagination, manually set page count
        ...(isServerPagination ? {
            manualPagination: true,
            pageCount: pagination.totalPages || 1
        } : {}),
    });

    if (loading)
        return (
            <div style={{ height: 'calc(80vh - 280px)' }} className="flex items-center justify-center bg-white rounded">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 size={32} className="animate-spin text-blue-600" />
                    <span className="text-sm text-gray-500">Loading work items...</span>
                </div>
            </div>
        );

    if (!data.length) return (
        <div style={{ height: 'calc(100vh - 280px)' }} className="flex items-center justify-center bg-white rounded">
            <div className="flex flex-col items-center">
                <Image
                    src="/_assets/image/no-result-found.svg"
                    alt="Empty Dashboard"
                    className="w-64 mb-8"
                    width={64}
                    height={64}
                />
                <p className="text-sm text-gray-700 mb-1">No work items found</p>
                <p className="text-xs text-gray-500">
                    Try adjusting your filters or create a new work item
                </p>
            </div>
        </div>
    )

    // Calculate pagination display values
    const currentPage = isServerPagination ? pagination.page : table.getState().pagination.pageIndex + 1;
    const totalPages = isServerPagination ? pagination.totalPages : table.getPageCount();
    const totalItems = isServerPagination ? pagination.total : data.length;
    const canPrevPage = isServerPagination ? pagination.hasPrev : table.getCanPreviousPage();
    const canNextPage = isServerPagination ? pagination.hasNext : table.getCanNextPage();

    const handlePrevPage = () => {
        if (isServerPagination) {
            onPageChange(pagination.page - 1);
        } else {
            table.previousPage();
        }
    };

    const handleNextPage = () => {
        if (isServerPagination) {
            onPageChange(pagination.page + 1);
        } else {
            table.nextPage();
        }
    };

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="flex-1 overflow-auto  hide-scrollbar">
                <table className="w-full text-sm border-collapse">
                    <thead className="sticky top-0 ">
                        {table.getHeaderGroups().map((hg) => (
                            <tr className='bg-white' key={hg.id}>
                                {hg.headers.map((h) => (
                                    <th key={h.id} onClick={h.column.getCanSort() ? h.column.getToggleSortingHandler() : undefined}
                                        className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer select-none"
                                        style={{ width: h.getSize() }}>
                                        {flexRender(h.column.columnDef.header, h.getContext())}
                                        <SortIcon column={h.column} />
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map((row) => {
                            const isSelected = row.getIsSelected();
                            const isHovered = hoveredRowId === row.id;

                            return (
                                <tr
                                    key={row.id}
                                    onClick={() => onRowClick?.(row.original)}
                                    onMouseEnter={() => setHoveredRowId(row.id)}
                                    onMouseLeave={() => {
                                        setHoveredRowId(null);
                                        setActiveMenuRowId(null);
                                    }}
                                    className={`cursor-pointer transition-colors
                    ${isSelected ? 'bg-blue-50' : isHovered ? 'bg-gray-50' : ''}`}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className="px-4 py-3">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-white text-sm text-gray-600">
                <span>
                    {Object.keys(rowSelection).filter(k => rowSelection[k]).length > 0 && (
                        <span className="mr-3 text-blue-600 font-medium">
                            {Object.keys(rowSelection).filter(k => rowSelection[k]).length} selected
                        </span>
                    )}
                    Page {currentPage} of {totalPages} ({totalItems} items)
                </span>
                <div className="flex gap-2">
                    <button onClick={handlePrevPage} disabled={!canPrevPage}
                        className="px-3 py-1.5 border rounded flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100">
                        <ChevronLeft size={16} /> Prev
                    </button>
                    <button onClick={handleNextPage} disabled={!canNextPage}
                        className="px-3 py-1.5 border rounded flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100">
                        Next <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}

