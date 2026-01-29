'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, MoreHorizontal, Search, Cross, X } from 'lucide-react';
import WorkItemCard from './WorkItemCard';
import InputBase from '@/components/reusables/InputBase';
import clsx from "clsx";
import { STATES } from '@/constants/common.constants';
import WorkItemTypeIcon from '@/components/ui/WorkItemTypeIcon';
const BoardColumn = ({
    id,
    title,
    count,
    items = [],
    onUpdateItem,
    onDeleteItem,
    onAddItem,
    onItemClick,
    columns,
    members = [], // Pre-fetched members list
    allowAdd = false,
    isOver = false,
    updatingItemId = null, // ID of item currently being updated via drag
    setUpdatingItemId, // Callback to set updating item ID,
    type,
    showConfirm, // Confirm modal hook
}) => {
    const { setNodeRef, isOver: isDroppableOver } = useDroppable({
        id,
        data: {
            type: 'column',
            columnId: id
        }
    });

    const [isAddingWorkItem, setIsAddingWorkItem] = useState(false);
    const [newWorkItemTitle, setNewWorkItemTitle] = useState('');
    const [searchOptions, setSearchOptions] = useState({
        isSearchOpen: false,
        text: ""
    });
    const inputRef = useRef(null);
    const searchContainerRef = useRef(null);
    const [filteredItems, setFilteredItems] = useState(items);

    const isHighlighted = isOver || isDroppableOver;

    useEffect(() => {
        if (isAddingWorkItem && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isAddingWorkItem]);

    const handleAddWorkItem = () => {
        if (newWorkItemTitle.trim()) {
            onAddItem?.({
                id: `temp-${Date.now()}`,
                title: newWorkItemTitle.trim(),
                state: id === 'to do' ? STATES.TODO : id === 'doing' ? STATES.DOING : STATES.DONE,
                type: type,
                assignee: null,
                position:"top"
            }, id);
            setNewWorkItemTitle('');
            setIsAddingWorkItem(false);
        }
    };    

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleAddWorkItem();
        } else if (e.key === 'Escape') {
            setIsAddingWorkItem(false);
            setNewWorkItemTitle('');
        }
    };

    useEffect(() => {
        if (searchOptions.text) {
            const filtered = items.filter(item => item.title.toLowerCase().includes(searchOptions.text.toLowerCase()));
            setFilteredItems(filtered);
        } else {
            // Show all items when search text is empty
            setFilteredItems(items);
        }
    }, [searchOptions.text, items]);

    const onSearchClick = () => {
        setSearchOptions({
            isSearchOpen: true,
            text: ""
        });
        if (searchContainerRef.current) {
            searchContainerRef.current.focus();
        }
    }

    const onSearchChange = (e) => {
        setSearchOptions((prev) => ({
            ...prev,
            text: e.target.value
        }));
    }

    const onSearchClose = () => {
        setSearchOptions({
            text: "",
            isSearchOpen: false
        })
    }

    // Close search when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchOptions.isSearchOpen &&
                searchContainerRef.current &&
                !searchContainerRef.current.contains(event.target)) {
                onSearchClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [searchOptions.isSearchOpen]);

    return (
        <div
            ref={setNodeRef}
            className={`
        flex flex-col w-[400px] 
        bg-gray-50 rounded-md mr-4 
        h-[calc(100vh-220px)]
        transition-all duration-200 ease-in-out
        ${isHighlighted ? 'bg-blue-50 ring-2 ring-blue-300 ring-opacity-50' : ''}
      `}
        >
            {/* Column Header */}
            <div className="p-3 bg-white border-b border-gray-200 rounded-t-md">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            {count ?? filteredItems.length}
                        </span>
                    </div>
                    <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                        <MoreHorizontal size={16} className="text-gray-500" />
                    </button>
                </div>
            </div>

            {/* Column Content */}
            <div className="p-2 flex-1 overflow-y-auto">
                {/* Add Task Button (only for first column or when allowAdd is true) */}
                {allowAdd && (
                    <div className="mb-3">
                        {isAddingWorkItem ? (
                            <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200">
                                <div className='flex gap-2 justify-center items-center'>
                                    <WorkItemTypeIcon type={type} size={18}/>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={newWorkItemTitle}
                                        onChange={(e) => setNewWorkItemTitle(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        onBlur={() => {
                                            if (!newWorkItemTitle.trim()) {
                                                setIsAddingWorkItem(false);
                                            }
                                        }}
                                        placeholder="Enter title..."
                                        className="w-full text-sm border border-blue-500 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="flex justify-end mt-2 gap-2">
                                    <button
                                        onClick={() => setIsAddingWorkItem(false)}
                                        className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddWorkItem}
                                        disabled={!newWorkItemTitle.trim()}
                                        className="px-3 py-1 text-xs text-white bg-blue-500 hover:bg-blue-600 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Add To Top
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsAddingWorkItem(true)}
                                    className="flex-1/2 flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-white hover:shadow-sm rounded-md transition-all duration-200"
                                >
                                    <Plus size={16} className="mr-2" />
                                    New Item
                                </button>
                                <div ref={searchContainerRef} className="flex items-center">
                                    {searchOptions.isSearchOpen && (
                                        <InputBase
                                            type='text'
                                            id="search"
                                            placeholder="Search"
                                            autoFocus
                                            value={searchOptions.text}
                                            onChange={onSearchChange}
                                            endAdornment={
                                                <button onClick={onSearchClose} className="p-1 text-gray-500 hover:text-gray-700 transition-colors">
                                                    <X size={14} />
                                                </button>
                                            }
                                        />
                                    )}
                                    <button
                                        onClick={onSearchClick}
                                        className={clsx("p-2 text-gray-600 hover:bg-white hover:shadow-sm rounded-md transition-all duration-200", searchOptions.isSearchOpen && "hidden")}
                                        title="Search items"
                                    >
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Work Items */}
                <SortableContext
                    id={id}
                    items={filteredItems.map(item => item.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {filteredItems.map((item) => (
                        <WorkItemCard
                            key={item.id}
                            item={item}
                            onUpdateItem={onUpdateItem}
                            onDeleteItem={onDeleteItem}
                            onClick={onItemClick}
                            columns={columns}
                            members={members}
                            isUpdatingFromDrag={updatingItemId === item.id}
                            setUpdatingItemId={setUpdatingItemId}
                            showConfirm={showConfirm}
                        />
                    ))}
                </SortableContext>

                {/* Empty State */}
                {filteredItems.length === 0 && !isAddingWorkItem && (
                    <div className={`
                        flex items-center justify-center h-20 
                        border-2 border-dashed rounded-md
                        transition-colors duration-200
                        ${isHighlighted ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}
                    `}>
                        <span className="text-sm text-gray-400">
                            {isHighlighted ? 'Drop here' : 'No items'}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BoardColumn;
