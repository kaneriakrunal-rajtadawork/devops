// src/components/features/projects/boards/workItems/WorkItemsRouter.js
'use client';

import React from 'react';
import WorkItems from './index';
import CreateWorkItem from './CreateWorkItem';
import { usePathname, useRouter } from 'next/navigation';
import { getWorkItemsBase } from '@/utils/functions';
// Import these when you create them:
// import ViewWorkItem from './ViewWorkItem';
// import UpdateWorkItem from './UpdateWorkItem';

/**
 * WorkItemsRouter handles nested routing for work-items
 * 
 * Routes:
 * - /projects/[project]/boards/work-items          → List all work items
 * - /projects/[project]/boards/work-items/create   → Create new work item
 * - /projects/[project]/boards/work-items/[id]     → View work item details
 * - /projects/[project]/boards/work-items/[id]/edit → Edit work item
 */
const WorkItemsRouter = ({ projectName, action, subAction }) => {
    const router = useRouter();
    const pathname = usePathname();

    const handleClose = () => {
        const basePath = getWorkItemsBase(pathname);
        router.push(basePath);
    };

    // Determine which view to render based on the action parameter
    const renderWorkItemsView = () => {
        // No action = list view
        if (!action) {
            return <WorkItems projectName={projectName} />;
        }

        

        const backUrl = pathname;

        // Handle specific actions
        switch (action) {
            case 'create':
                // Create new work item
                // You can also pass a workItemType from URL if needed
                return (
                    <CreateWorkItem
                        actionType={subAction}
                        onClose={handleClose}
                    />
                );

            // Add more actions as needed:
            // case 'edit':
            //     return <UpdateWorkItem projectName={projectName} />;

            default:
                // If action is a number/ID, treat it as viewing a specific work item
                // This handles URLs like /work-items/123 or /work-items/123/edit
                if (isWorkItemId(action)) {
                    return (
                        <CreateWorkItem
                            workItemId={action}
                            onClose={handleClose}
                        />
                    );
                }

                // Unknown action, fallback to list
                return <WorkItems projectName={projectName} />;
        }
    };

    return renderWorkItemsView();
};

/**
 * Helper to check if the action looks like a work item ID
 * Adjust this based on your ID format (MongoDB ObjectId, number, etc.)
 */
function isWorkItemId(action) {
    // Check if it's a MongoDB ObjectId (24 hex characters)
    if (/^[0-9a-fA-F]{24}$/.test(action)) {
        return true;
    }
    // Check if it's a numeric ID
    if (/^\d+$/.test(action)) {
        return true;
    }
    return false;
}



export default WorkItemsRouter;
