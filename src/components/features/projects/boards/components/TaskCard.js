import React, { useState, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MessageSquare } from 'lucide-react';
import CardMenu from './CardMenu';

export function TaskCard({ task, isDragging, onUpdateItem, onDeleteItem, columns }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const titleInputRef = useRef(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const statusColors = {
    New: 'border-red-500',
    Active: 'border-blue-500',
    Resolved: 'border-yellow-500',
    Closed: 'border-green-500'
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'new':
        return 'bg-gray-400';
      case 'active':
        return 'bg-blue-500';
      case 'resolved':
        return 'bg-yellow-500';
      case 'closed':
        return 'bg-green-500';
      default:
        return 'bg-gray-400';
    }
  };

  const handleEditTitle = () => {
    setIsEditing(true);
  };

  const handleTitleChange = (e) => {
    setEditedTitle(e.target.value);
  };

  const handleTitleSubmit = () => {
    if (editedTitle.trim() !== '') {
      onUpdateItem({
        ...task,
        title: editedTitle.trim()
      });
    }
    setIsEditing(false);
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditedTitle(task.title);
    }
  };

  const handleMoveToColumn = (columnId) => {
    onUpdateItem({
      ...task,
      status: columnId.charAt(0).toUpperCase() + columnId.slice(1)
    });
  };

  const handleMoveToIteration = (iteration) => {
    onUpdateItem({
      ...task,
      iteration
    });
  };

  const handleNewBranch = () => {
    // Implement new branch creation logic
    console.log('Creating new branch for task:', task.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white p-3 rounded-sm shadow-sm mb-2 border-l-4 ${
        statusColors[task.status]
      } ${isDragging ? 'shadow-lg opacity-75' : ''} relative group`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-2">{task.id}</span>
          {isEditing ? (
            <input
              ref={titleInputRef}
              type="text"
              value={editedTitle}
              onChange={handleTitleChange}
              onBlur={handleTitleSubmit}
              onKeyDown={handleTitleKeyDown}
              className="text-sm border border-blue-500 rounded px-1 focus:outline-none"
              autoFocus
            />
          ) : (
            <span className="text-sm text-blue-600 hover:underline cursor-pointer">
              {task.title}
            </span>
          )}
        </div>
        <CardMenu
          onEditTitle={handleEditTitle}
          onMoveToColumn={handleMoveToColumn}
          onMoveToIteration={handleMoveToIteration}
          onDelete={() => onDeleteItem(task.id)}
          onNewBranch={handleNewBranch}
          columns={columns}
          currentColumn={task.status.toLowerCase()}
        />
      </div>
      <div className="flex items-center text-xs text-gray-600 mb-2">
        <div className="flex items-center">
          <span className={`w-2 h-2 ${getStatusColor(task.status)} rounded-full mr-1`}></span>
          <span>{task.status}</span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`w-6 h-6 rounded-full ${
            task.assignee.name === 'Unassigned' ? 'bg-gray-500' : 'bg-purple-700'
          } flex items-center justify-center text-white text-xs mr-2`}>
            {task.assignee.initials}
          </div>
          <span className="text-sm text-gray-600">{task.assignee.name}</span>
        </div>
        {task.comments > 0 && (
          <div className="flex items-center text-gray-500">
            <MessageSquare size={14} className="mr-1" />
            <span className="text-xs">{task.comments}</span>
          </div>
        )}
      </div>
    </div>
  );
} 