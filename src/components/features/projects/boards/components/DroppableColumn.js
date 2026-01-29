import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskCard } from './TaskCard';

export function DroppableColumn({ id, title, items }) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className="col-span-1">
      <div className="bg-gray-100 px-3 py-2 mb-4 rounded-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{title}</span>
          <span className="bg-white text-gray-600 text-xs px-2 py-0.5 rounded">
            {items.length}
          </span>
        </div>
      </div>
      <div
        ref={setNodeRef}
        className="min-h-[200px] transition-colors rounded-sm"
      >
        <SortableContext
          id={id}
          items={items}
          strategy={verticalListSortingStrategy}
        >
          {items.map((item) => (
            <TaskCard key={item.id} task={item} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
} 