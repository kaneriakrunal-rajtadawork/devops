'use client';

import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { 
  Plus, 
  Star, 
  Users, 
  ChevronDown, 
  Settings, 
  SlidersHorizontal,
  Maximize2,
  ChevronRight,
  MessageSquare,
  Filter,
  LayoutGrid,
  X
} from 'lucide-react';
import { TaskCard } from './components/TaskCard';
import { DroppableColumn } from './components/DroppableColumn';

const Sprints = () => {
  const [activeTab, setActiveTab] = useState('taskboard');
  const [isStarred, setIsStarred] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [columns, setColumns] = useState({
    new: {
      id: 'new',
      title: 'New',
      items: [
        {
          id: '15',
          title: 'sample_task',
          status: 'New',
          assignee: { name: 'Unassigned', initials: 'UN' }
        },
      ]
    },
    active: {
      id: 'active',
      title: 'Active',
      items: [
        {
          id: '10',
          title: 'sample',
          status: 'Active',
          assignee: { name: 'subbaramiredd', initials: 'SK' }
        },
        {
          id: '22',
          title: 'sample ghana',
          status: 'Active',
          assignee: { name: 'subbaramiredd', initials: 'SK' }
        },
        {
          id: '28',
          title: 'rdfsd',
          status: 'Active',
          assignee: { name: 'Unassigned', initials: 'UN' }
        }
      ]
    },
    resolved: {
      id: 'resolved',
      title: 'Resolved',
      items: [
        {
          id: '7',
          title: 'Login is not working',
          status: 'Resolved',
          assignee: { name: 'subbaramiredd', initials: 'SK' },
          comments: 3
        },
        {
          id: '21',
          title: 'ghana',
          status: 'Resolved',
          assignee: { name: 'subbaramiredd', initials: 'SK' }
        },
        {
          id: '27',
          title: 'test bug',
          status: 'Resolved',
          assignee: { name: 'Unassigned', initials: 'UN' }
        }
      ]
    },
    closed: {
      id: 'closed',
      title: 'Closed',
      items: [
        {
          id: '11',
          title: 'sample_bug',
          status: 'Closed',
          assignee: { name: 'Unassigned', initials: 'UN' }
        },
        {
          id: '26',
          title: 'm',
          status: 'Closed',
          assignee: { name: 'subbaramiredd', initials: 'SK' }
        }
      ]
    }
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }

    if (active.id !== over.id) {
      const activeContainer = active.data.current.sortable.containerId;
      const overContainer = over.data.current?.sortable.containerId || over.id;
      
      if (activeContainer !== overContainer) {
        setColumns((prev) => {
          const activeItems = [...prev[activeContainer].items];
          const overItems = [...prev[overContainer].items];
          const activeIndex = activeItems.findIndex(item => item.id === active.id);
          const overIndex = overItems.length;

          const item = activeItems[activeIndex];
          item.status = prev[overContainer].title;
          
          activeItems.splice(activeIndex, 1);
          overItems.splice(overIndex, 0, item);

          return {
            ...prev,
            [activeContainer]: {
              ...prev[activeContainer],
              items: activeItems,
            },
            [overContainer]: {
              ...prev[overContainer],
              items: overItems,
            },
          };
        });
      }
    }
    
    setActiveId(null);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeContainer = active.data.current.sortable.containerId;
    const overContainer = over.data.current?.sortable.containerId || over.id;
    
    if (activeContainer !== overContainer) {
      setColumns((prev) => {
        const activeItems = [...prev[activeContainer].items];
        const overItems = [...prev[overContainer].items];
        const activeIndex = activeItems.findIndex(item => item.id === active.id);
        const overIndex = overItems.length;

        const item = activeItems[activeIndex];
        item.status = prev[overContainer].title;
        
        activeItems.splice(activeIndex, 1);
        overItems.splice(overIndex, 0, item);

        return {
          ...prev,
          [activeContainer]: {
            ...prev[activeContainer],
            items: activeItems,
          },
          [overContainer]: {
            ...prev[overContainer],
            items: overItems,
          },
        };
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Info Banner */}
      <div className="bg-[#f0f8ff] px-6 py-2 flex items-center justify-between border-b border-[#cae3ff]">
        <div className="flex items-center text-sm">
          <span className="text-gray-700">Did you notice Azure Boards has a new look and awesome new features? </span>
          <a href="#" className="text-blue-600 hover:underline ml-1">Learn more.</a>
        </div>
        <button className="text-gray-500 hover:text-gray-700">
          <X size={16} />
        </button>
      </div>

      {/* Header Section */}
      <div className="px-6 py-3 bg-white">
        {/* Team Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <Users size={16} className="text-gray-600 mr-2" />
              <h1 className="text-lg font-semibold text-gray-800">Synxa Team</h1>
              <ChevronDown size={16} className="text-gray-500 ml-1" />
            </div>
            <button 
              className="p-1 hover:bg-gray-100 rounded"
              onClick={() => setIsStarred(!isStarred)}
            >
              <Star size={16} className={isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'} />
            </button>
            <button className="p-1 hover:bg-gray-100 rounded">
              <Users size={16} className="text-gray-400" />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-[#0078d4] hover:bg-[#106ebe] rounded">
              <Plus size={16} className="mr-1.5" /> New Work Item
            </button>
            <button className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded">
              Column Options
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between">
          <div className="flex items-center -mb-px">
            <button
              className={`px-4 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'taskboard'
                  ? 'text-[#0078d4] border-[#0078d4]'
                  : 'text-gray-600 border-transparent hover:border-gray-200'
              }`}
              onClick={() => setActiveTab('taskboard')}
            >
              Taskboard
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'backlog'
                  ? 'text-[#0078d4] border-[#0078d4]'
                  : 'text-gray-600 border-transparent hover:border-gray-200'
              }`}
              onClick={() => setActiveTab('backlog')}
            >
              Backlog
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'capacity'
                  ? 'text-[#0078d4] border-[#0078d4]'
                  : 'text-gray-600 border-transparent hover:border-gray-200'
              }`}
              onClick={() => setActiveTab('capacity')}
            >
              Capacity
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'analytics'
                  ? 'text-[#0078d4] border-[#0078d4]'
                  : 'text-gray-600 border-transparent hover:border-gray-200'
              }`}
              onClick={() => setActiveTab('analytics')}
            >
              Analytics
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
              <Filter size={16} />
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
              <LayoutGrid size={16} />
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
              <Settings size={16} />
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
              <Maximize2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded">
              Iteration 1 <ChevronDown size={16} className="ml-2" />
            </button>
            <button className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded">
              Person: All <ChevronDown size={16} className="ml-2" />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">No iteration dates</span>
            <button className="text-sm text-[#0078d4] hover:underline">Set dates</button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 py-4 overflow-hidden">
        <div className="h-full flex flex-col">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
          >
            <div className="flex-1 overflow-auto">
              <div className="grid grid-cols-5 gap-4 h-full min-h-0">
                {/* Left Panel */}
                <div className="col-span-1">
                  <div className="flex items-center mb-4">
                    <button 
                      className="p-1 hover:bg-gray-200 rounded mr-2"
                      onClick={() => setIsCollapsed(!isCollapsed)}
                    >
                      <ChevronRight size={16} className={`transform transition-transform ${isCollapsed ? '' : 'rotate-90'}`} />
                    </button>
                    <span className="text-sm font-medium">Collapse all</span>
                  </div>
                  <div className="bg-white p-3 rounded-sm shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Unparented</span>
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">3</span>
                    </div>
                  </div>
                </div>

                {/* Status Columns */}
                {Object.entries(columns).map(([columnId, column]) => (
                  <DroppableColumn
                    key={columnId}
                    id={columnId}
                    title={column.title}
                    items={column.items}
                  />
                ))}
              </div>
            </div>

            <DragOverlay>
              {activeId ? (
                <TaskCard
                  task={Object.values(columns)
                    .flatMap(col => col.items)
                    .find(item => item.id === activeId)}
                  isDragging
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </div>
  );
};

export default Sprints; 