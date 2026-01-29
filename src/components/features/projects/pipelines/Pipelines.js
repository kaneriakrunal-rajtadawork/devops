import React from 'react';
import { MoreVertical } from 'lucide-react';

const PipelineEmptyState = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="p-8 flex flex-col items-center w-full max-w-lg">
      {/* Illustration Placeholder */}
      <img
        src="/_assets/image/pipeline-empty-state.png"
        alt="Pipeline Illustration"
        className="mb-8 w-72 h-40 object-contain"
      />
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-4">Create your first Pipeline</h1>
      <p className="text-gray-600 text-center mb-8 max-w-md">
        Automate your build and release processes using our wizard, and go from code to cloud-hosted within minutes.
      </p>
      <div className="flex items-center gap-2">
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400">
          Create Pipeline
        </button>
        <button className="p-2 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400">
          <MoreVertical className="w-6 h-6 text-gray-500" />
        </button>
      </div>
    </div>
  </div>
);

export default PipelineEmptyState; 