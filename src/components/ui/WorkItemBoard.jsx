import { useState } from 'react';
import { ViewIcon, SettingsIcon, ChevronDownIcon, PlusIcon } from '@chakra-ui/icons';

const WorkItemBoard = () => {
  const [workItems] = useState([
    { id: 1, type: 'User Story', title: 'ok', state: 'New', story: 4, valueArea: 'Business', iteration: 'Synxa' },
    { id: 2, type: 'User Story', title: 'nbnb', state: 'New', story: 6, valueArea: 'Business', iteration: 'Synxa' },
    { id: 3, type: 'User Story', title: 'sample_user_story', state: 'Active', story: 5, valueArea: 'Business', iteration: 'Synxa' },
    { id: 4, type: 'User Story', title: 'sssss', state: 'New', story: null, valueArea: 'Business', iteration: 'Synxa' },
  ]);

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">Synxa Team</h1>
          <button className="text-gray-500 hover:bg-gray-100 p-1 rounded">
            <ChevronDownIcon />
          </button>
          <button className="ml-2 text-gray-500 hover:bg-gray-100 p-1 rounded">⭐</button>
          <button className="text-gray-500 hover:bg-gray-100 p-1 rounded">💫</button>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2">
            <PlusIcon /> New Work Item
          </button>
          <button className="flex items-center gap-1 px-3 py-2 border rounded hover:bg-gray-50">
            <ViewIcon /> View as Board
          </button>
          <button className="flex items-center gap-1 px-3 py-2 border rounded hover:bg-gray-50">
            <SettingsIcon /> Column Options
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-4 border-b mb-4">
        <button className="px-4 py-2 hover:bg-gray-50">Backlog</button>
        <button className="px-4 py-2 hover:bg-gray-50">Analytics</button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left border-b">
              <th className="p-2 w-16">#</th>
              <th className="p-2">Work Item Type</th>
              <th className="p-2">Title</th>
              <th className="p-2">State</th>
              <th className="p-2">Story</th>
              <th className="p-2">Value Area</th>
              <th className="p-2">Iteration</th>
            </tr>
          </thead>
          <tbody>
            {workItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 border-b">
                <td className="p-2">{item.id}</td>
                <td className="p-2">{item.type}</td>
                <td className="p-2">{item.title}</td>
                <td className="p-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${item.state === 'Active' ? 'bg-blue-500' : 'bg-gray-400'}`}></span>
                    {item.state}
                  </div>
                </td>
                <td className="p-2">{item.story}</td>
                <td className="p-2">{item.valueArea}</td>
                <td className="p-2">{item.iteration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WorkItemBoard; 