'use client';

import React, { useMemo, useState, useCallback } from 'react';
import Image from "next/image";
import {
    useReactTable,
    getCoreRowModel,
    getExpandedRowModel,
    flexRender,
} from '@tanstack/react-table';
import {
    DndContext,
    DragOverlay,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import {
    ChevronRight,
    ChevronDown,
    Loader2,
    MoreHorizontal,
    GripVertical,
    Plus,
} from 'lucide-react';
import WorkItemTypeIcon from '@/components/ui/WorkItemTypeIcon';
import StateIndicator from '@/components/ui/StateIndicator';
import BacklogContextMenu from './BacklogContextMenu';
import SortableBacklogRow from './SortableBacklogRow';
import { findItemById, getItemDepthAndParent } from '@/utils/treeUtils';
import { WORKITEMTYPE } from '@/constants/common.constants';
import Tooltip from '@/components/ui/Tooltip';

// State color mapping
const getStateColor = (state) => {
    const stateNormalized = (state || '').toLowerCase().replace(/\s+/g, '');
    switch (stateNormalized) {
        case 'todo':
        case 'new':
            return 'bg-gray-400';
        case 'doing':
        case 'inprogress':
        case 'active':
            return 'bg-blue-500';
        case 'done':
        case 'closed':
        case 'resolved':
            return 'bg-green-500';
        default:
            return 'bg-gray-400';
    }
};

// Tags display component
const TagsCell = ({ value }) => {
    if (!value?.length) return null;
    return (
        <div className="flex gap-1 flex-wrap">
            {value.slice(0, 2).map((tag, i) => (
                <span key={i} className="px-1.5 py-0.5 text-xs bg-gray-100 rounded">
                    {tag.name || tag}
                </span>
            ))}
            {value.length > 2 && (
                <span className="text-xs text-gray-400">+{value.length - 2}</span>
            )}
        </div>
    );
};

// Resize handle component - visible border line on column edge
const ResizeHandle = ({ header, isResizing }) => {
    return (
        <div
            onMouseDown={header.getResizeHandler()}
            onTouchStart={header.getResizeHandler()}
            className={`
                absolute right-0 top-0 h-full w-[4px] cursor-col-resize select-none touch-none
                group flex items-center justify-center
            `}
            style={{
                userSelect: 'none',
            }}
        >
            {/* Visible resize line */}
            <div
                className={`
                    h-full w-[2px] transition-colors
                    ${isResizing ? 'bg-blue-500' : 'bg-gray-300 group-hover:bg-blue-400'}
                `}
            />
        </div>
    );
};

/**
 * BacklogsDataGrid - Backlog table with resizable columns and expandable rows
 */
export default function BacklogsDataGrid({
    data = [],
    loading = false,
    error = null,
    onRowClick,
    onRetry,
    onAddSubItem, // Callback when "+" icon is clicked to add a sub-item
    onEdit, // Callback when Edit is clicked from context menu
    onAssign, // Callback when Assign is clicked from context menu
    onDelete, // Callback when Delete is clicked from context menu
    onChangeParent, // Callback when Change Parent is clicked from context menu
    onChangeType, // Callback when Change Type is clicked from context menu
    onReorder, // Callback when top-level items are reordered
    onReorderSubItem, // Callback when sub-items are reordered (with level restrictions)
    repoId, // Repository ID for fetching members in context menu
    isDragDisabled = false, // Disable drag and drop when filters are active
}) {
    const [columnSizing, setColumnSizing] = useState({
        order: 60,
        sequenceId: 70,
        title: 400,
        assignedTo: 150,
        state: 100,
        tags: 150,
    });
    const [expanded, setExpanded] = useState({});
    const [hoveredRowId, setHoveredRowId] = useState(null);
    const [contextMenu, setContextMenu] = useState(null); // { x, y, workItem }

    // Drag and drop state
    const [activeId, setActiveId] = useState(null);
    const [overId, setOverId] = useState(null);

    // dnd-kit sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // 8px movement before drag starts
            },
        }),
        useSensor(KeyboardSensor)
    );

    // Define columns with resizing support
    const columns = useMemo(() => [
        {
            id: 'order',
            header: 'Order',
            size: 60,
            minSize: 30,
            enableResizing: true,
            cell: ({ row }) => {
                // Only show order for top-level items
                if (row.depth === 0) {
                    return <span className="text-gray-500">{row.index + 1}</span>;
                }
                return null;
            },
        },
        {
            accessorKey: 'sequenceId',
            header: 'ID',
            size: 70,
            minSize: 30,
            enableResizing: true,
            cell: ({ getValue, row }) => (
                <span className="text-blue-600 hover:underline cursor-pointer">
                    {getValue() || row.original.id?.slice(-6)}
                </span>
            ),
        },
        {
            accessorKey: 'title',
            header: 'Title',
            size: 400,
            minSize: 30,
            enableResizing: true,
            cell: ({ row, getValue, table }) => {
                const hasChildren = row.original.children?.length > 0;
                const depth = row.depth;
                const isHovered = table.options.meta?.hoveredRowId === row.id;
                const openContextMenu = table.options.meta?.openContextMenu;

                return (
                    <div
                        className="flex items-center justify-between gap-2"
                        style={{ paddingLeft: depth * 24 }}
                    >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            {/* Expand/Collapse button for items with children */}
                            {hasChildren ? (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        row.toggleExpanded();
                                    }}
                                    className="p-0.5 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                                >
                                    {row.getIsExpanded() ? (
                                        <ChevronDown size={16} className="text-gray-500" />
                                    ) : (
                                        <ChevronRight size={16} className="text-gray-500" />
                                    )}
                                </button>
                            ) : (
                                <span className="w-[20px] flex-shrink-0" />
                            )}

                            {/* Work item type icon */}
                            <WorkItemTypeIcon type={row.original.type} size={16} />

                            {/* Title */}
                            <span className="text-blue-600 hover:underline cursor-pointer truncate">
                                {getValue()}
                            </span>
                        </div>

                        {/* 3-dot menu at end of title */}
                        {isHovered && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openContextMenu?.(e, row.original);
                                }}
                                className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded flex-shrink-0"
                                title="More actions"
                            >
                                <MoreHorizontal size={18} />
                            </button>
                        )}
                    </div>
                );
            },
        },
        {
            id: 'assignedTo',
            header: 'Assigned To',
            size: 150,
            minSize: 30,
            enableResizing: true,
            accessorFn: (row) => row.assignedUser?.name || '',
            cell: ({ getValue }) => (
                <span className="text-gray-700 truncate">{getValue()}</span>
            ),
        },
        {
            accessorKey: 'state',
            header: 'State',
            size: 100,
            minSize: 30,
            enableResizing: true,
            cell: ({ getValue }) => {
                const state = getValue();
                const color = getStateColor(state);
                return (
                    <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${color}`} />
                        <span className="text-gray-700">{state || 'To Do'}</span>
                    </div>
                );
            },
        },
        {
            accessorKey: 'tags',
            header: 'Tags',
            size: 150,
            minSize: 30,
            enableResizing: true,
            enableSorting: false,
            cell: ({ getValue }) => <TagsCell value={getValue()} />,
        },
    ], []);

    // Flatten data for expandable rows
    const tableData = useMemo(() => data, [data]);

    // Get sub rows for expansion
    const getSubRows = useCallback((row) => row.children || [], []);

    const table = useReactTable({
        data: tableData,
        columns,
        state: {
            columnSizing,
            expanded,
        },
        onColumnSizingChange: setColumnSizing,
        onExpandedChange: setExpanded,
        getSubRows,
        // Use item ID instead of row index for tracking expansion
        getRowId: (row) => row.id,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        enableColumnResizing: true,
        columnResizeMode: 'onChange',
        columnResizeDirection: 'ltr',
        meta: {
            hoveredRowId,
            openContextMenu: (e, workItem) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setContextMenu({
                    x: rect.right - 200,
                    y: rect.bottom + 2,
                    workItem,
                });
            },
        },
    });

    // Expand all rows (can be called multiple times to expand deeper levels)
    const expandAll = () => {
        const allRows = table.getRowModel().rows;
        const newExpanded = { ...expanded };

        allRows.forEach(row => {
            if (row.subRows && row.subRows.length > 0) {
                newExpanded[row.id] = true;
            }
        });

        setExpanded(newExpanded);
    };

    // Collapse all rows
    const collapseAll = () => {
        setExpanded({});
    };

    // Get sortable item IDs from the data prop (top-level items only)
    const sortableItems = useMemo(() => {
        return data.map(item => item.id);
    }, [data]);

    // Drag handlers
    const handleDragStart = useCallback((event) => {
        const { active } = event;
        setActiveId(active.id);
    }, []);

    const handleDragOver = useCallback((event) => {
        const { over } = event;
        setOverId(over?.id || null);
    }, []);

    const handleDragEnd = useCallback(async (event) => {
        const { active, over } = event;

        setActiveId(null);
        setOverId(null);

        if (!over || active.id === over.id) {
            return;
        }

        // Get depth and parent info for both source and target
        const sourceInfo = getItemDepthAndParent(data, active.id);
        const targetInfo = getItemDepthAndParent(data, over.id);

        if (!sourceInfo || !targetInfo) {
            console.warn('Could not find source or target item');
            return;
        }

        // LEVEL RESTRICTION:
        // - Same depth: reorder among siblings
        // - Target is one level up (parent level): add as child of target
        // - Any other depth difference: not allowed
        const depthDiff = sourceInfo.depth - targetInfo.depth;

        if (depthDiff !== 0 && depthDiff !== 1) {
            console.warn(`Cannot move item from level ${sourceInfo.depth} to level ${targetInfo.depth}`);
            return;
        }

        // Top-level items (depth 0) reordering among themselves
        if (sourceInfo.depth === 0 && targetInfo.depth === 0) {
            const oldIndex = data.findIndex(item => item.id === active.id);
            const newIndex = data.findIndex(item => item.id === over.id);

            if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                await onReorder?.(oldIndex, newIndex, active.id, over.id);
            }
        } else if (depthDiff === 1) {
            // Dropping a child onto a parent-level item (making it a child of target)
            // Auto-expand the target parent so the moved item is visible
            setExpanded(prev => ({
                ...prev,
                [over.id]: true,
            }));

            onReorderSubItem?.({
                sourceId: active.id,
                targetId: over.id,
                sourceParentId: sourceInfo.parentId,
                targetParentId: over.id, // Target becomes the new parent
                depth: sourceInfo.depth,
                moveToParent: true, // Flag to indicate this is a move-to-parent action
            });
        } else {
            // Same depth: reorder among siblings (same or different parent)
            // If moving to a different parent, expand it
            if (sourceInfo.parentId !== targetInfo.parentId) {
                setExpanded(prev => ({
                    ...prev,
                    [targetInfo.parentId]: true,
                }));
            }

            onReorderSubItem?.({
                sourceId: active.id,
                targetId: over.id,
                sourceParentId: sourceInfo.parentId,
                targetParentId: targetInfo.parentId,
                depth: sourceInfo.depth,
                moveToParent: false,
            });
        }
    }, [data, onReorder, onReorderSubItem]);

    const handleDragCancel = useCallback(() => {
        setActiveId(null);
        setOverId(null);
    }, []);

    // Loading state
    if (loading) {
        return (
            <div style={{ height: 'calc(100vh - 280px)' }} className="flex items-center justify-center bg-white rounded">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 size={32} className="animate-spin text-blue-600" />
                    <span className="text-sm text-gray-500">Loading work items...</span>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div style={{ height: 'calc(100vh - 280px)' }} className="flex items-center justify-center bg-white rounded">
                <div className="flex flex-col items-center gap-3">
                    <span className="text-red-500 text-lg">⚠️</span>
                    <span className="text-sm text-gray-700">
                        {error?.message || 'Failed to load work items'}
                    </span>
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Retry
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // Empty state
    if (!tableData.length) {
        return (
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
        );
    }

    // Render the table content
    const tableContent = (
        <div className="bg-white rounded shadow-sm overflow-hidden">
            <div className="overflow-auto hide-scrollbar" style={{ height: 'calc(100vh - 280px)' }}>
                <table
                    className="text-sm border-collapse min-w-full"
                    style={{ width: table.getCenterTotalSize() }}
                >
                    <thead className="sticky top-0 bg-gray-50 z-10">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id} className="border-b border-gray-200">
                                {/* Expand/Collapse All Buttons */}
                                <th className="px-2 py-2" style={{ width: '60px' }}>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={expandAll}
                                            className="w-6 h-6 flex items-center justify-center border border-gray-400 text-gray-600 hover:bg-gray-200 text-xs font-bold"
                                            title="Expand all"
                                        >
                                            +
                                        </button>
                                        <button
                                            onClick={collapseAll}
                                            className="w-6 h-6 flex items-center justify-center border border-gray-400 text-gray-600 hover:bg-gray-200 text-xs font-bold"
                                            title="Collapse all"
                                        >
                                            −
                                        </button>
                                    </div>
                                </th>
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        className="text-left px-4 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wide relative select-none"
                                        style={{
                                            width: header.getSize(),
                                        }}
                                    >
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                        {header.column.getCanResize() && (
                                            <ResizeHandle
                                                header={header}
                                                isResizing={header.column.getIsResizing()}
                                            />
                                        )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map((row) => {
                            const isChild = row.depth > 0;
                            const isHovered = hoveredRowId === row.id;

                            const handleContextMenu = (e) => {
                                e.preventDefault();
                                setContextMenu({
                                    x: e.clientX,
                                    y: e.clientY,
                                    workItem: row.original,
                                });
                            };

                            return (
                                <SortableBacklogRow
                                    key={row.original.id}
                                    id={row.original.id}
                                    isChild={isChild}
                                    isHovered={isHovered}
                                    onClick={() => onRowClick?.(row.original)}
                                    onContextMenu={handleContextMenu}
                                    onMouseEnter={() => setHoveredRowId(row.id)}
                                    onMouseLeave={() => setHoveredRowId(null)}
                                    overId={overId}
                                    disabled={isDragDisabled}
                                >
                                    {/* Extra cell for expand/collapse column alignment */}
                                    <td className="relative px-2 py-2" style={{ width: '60px' }}>
                                        {/* Hover "+" icon to add sub-item */}
                                        {isHovered && row.original.type !== WORKITEMTYPE.TASK && onAddSubItem && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onAddSubItem(row.original);
                                                }}
                                                style={{ boxSizing: "content-box" }}
                                                className="w-5 h-5 flex items-center justify-center cursor-pointer text-gray-400 hover:bg-gray-200 transition-colors text-xs font-bold rounded-sm p-1"
                                            >
                                                <Tooltip title={`Add: ${row.original.type === WORKITEMTYPE.EPIC ? 'Issue' : 'Task'}`}>
                                                    <Plus size={20} />
                                                </Tooltip>
                                            </button>
                                        )}
                                    </td>
                                    {row.getVisibleCells().map((cell) => (
                                        <td
                                            key={cell.id}
                                            className="px-4 py-2"
                                            style={{
                                                width: cell.column.getSize(),
                                            }}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </td>
                                    ))}
                                </SortableBacklogRow>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Context Menu */}
            {contextMenu && (
                <BacklogContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    workItem={contextMenu.workItem}
                    onClose={() => setContextMenu(null)}
                    // onEdit={(workItem) => {
                    //     onEdit?.(workItem);
                    // }}
                    onAssign={(workItem, member) => {
                        onAssign?.(workItem, member);
                    }}
                    onDelete={(workItem) => {
                        onDelete?.(workItem);
                    }}
                    onChangeParent={(workItem) => {
                        onChangeParent?.(workItem);
                    }}
                    onChangeType={(workItem) => {
                        onChangeType?.(workItem);
                    }}
                    onCopy={(workItem) => {
                        // Copy work item details to clipboard
                        const text = `${workItem.sequenceId || workItem.id}: ${workItem.title}`;
                        navigator.clipboard.writeText(text);
                    }}
                    onEmail={(workItem) => {
                        // Open email with work item details
                        const subject = encodeURIComponent(`Work Item: ${workItem.title}`);
                        const body = encodeURIComponent(`${workItem.sequenceId || workItem.id}: ${workItem.title}\n\nState: ${workItem.state}\nAssigned To: ${workItem.assignedUser?.name || 'Unassigned'}`);
                        window.location.href = `mailto:?subject=${subject}&body=${body}`;
                    }}
                    repoId={repoId}
                />
            )}
        </div>
    );

    // If drag is disabled, render table without DndContext
    if (isDragDisabled) {
        return tableContent;
    }

    // Otherwise, wrap with DndContext for drag and drop functionality
    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
            <SortableContext items={sortableItems} strategy={verticalListSortingStrategy}>
                {tableContent}
            </SortableContext>

            {/* Drag Overlay - shows a clean preview of the dragged item */}
            <DragOverlay modifiers={[snapCenterToCursor]}>
                {activeId ? (() => {
                    const draggedItem = findItemById(data, activeId);
                    // Only show drag overlay for sub-items (items with parentId)
                    return (
                        draggedItem?.parentId ? (
                            <div className={`bg-white border border-blue-500 rounded shadow-lg px-4 justify-center py-2 flex items-center gap-2 max-w-[200px]`}>
                                <WorkItemTypeIcon
                                    type={draggedItem?.type}
                                    size={16}
                                />
                                <span className="text-sm font-medium text-gray-800">
                                    {draggedItem?.title || 'Work Item'}
                                </span>
                            </div>
                        ) : null
                    );
                })() : null}
            </DragOverlay>
        </DndContext>
    );
}
