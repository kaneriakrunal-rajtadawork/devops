import workItemService from '@/services/workitem.service.js';
import { ApiResponse } from '@/lib/response.js';
import { withRoute } from '@/utils/errorHandler.js';
import Logger from "@/lib/logger.js";

const logger = new Logger("Work-Items-Board");

/**
 * GET /api/work-items/board
 * Get work items for Kanban board view with nested children
 * 
 * Query params:
 * - project: Project ID (required)
 * - repo: Repo ID (required)
 * - state: Filter by state (optional)
 * - type: Filter by type (optional)
 */
export const GET = withRoute(async (request, { userId }) => {
    const { searchParams } = new URL(request.url);

    const project = searchParams.get('project');
    const repo = searchParams.get('repo');

    const type = searchParams.get('type');
    const tagOperator = searchParams.get('tagOperator');
    const area =
        searchParams.getAll('area').length
            ? searchParams.getAll('area')
            : searchParams.getAll('area[]');
    const tags =
        searchParams.getAll('tags').length
            ? searchParams.getAll('tags')
            : searchParams.getAll('tags[]');
    const states =
    searchParams.getAll('state').length
        ? searchParams.getAll('state')
        : searchParams.getAll('state[]');
    const search = searchParams.get("search");
    const assignedUsers = searchParams.getAll('assignedUsers').length
        ? searchParams.getAll('assignedUsers')
        : searchParams.getAll('assignedUsers[]');

    // Validate required params
    if (!project || !repo) {
        return ApiResponse.error('project and repo are required query parameters', 400);
    }

    logger.debug("Getting work items for board", assignedUsers );

    const result = await workItemService.getWorkItemsForBoard(
        { project, repo, states, type, tagOperator, tags, area, search, assignedUsers },
        userId
    );

    return ApiResponse.success(result, 'Board work items retrieved successfully');
}, { requireAuth: true });
