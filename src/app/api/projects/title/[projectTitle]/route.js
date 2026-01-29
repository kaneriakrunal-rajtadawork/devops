import { ApiResponse } from "@/lib/response.js";
import Project from '@/models/Project.model';
import { withRoute } from "@/utils/errorHandler.js";
import { NotFoundError } from "@/lib/errors.js";
import Logger from "@/lib/logger.js";

const logger = new Logger('ProjectByTitleRoute');

/**
 * GET /api/projects/title/[projectTitle] - Get project by title
 */
export const GET = withRoute(async (request, { userId }, { params }) => {
    const { projectTitle } = await params;

    logger.debug('Fetching project by title', { projectTitle, userId });

    const project = await Project.findOne({ title: projectTitle });

    if (!project) {
        throw new NotFoundError('Project not found');
    }

    logger.info('Project retrieved successfully', { projectId: project._id });
    return ApiResponse.success(project, "Project retrieved successfully");
}, { requireAuth: true });

/**
 * PATCH /api/projects/title/[projectTitle] - Update project by title
 */
export const PATCH = withRoute(async (request, { userId }, { params }) => {
    const { projectTitle } = await params;
    const body = await request.json();

    logger.debug('Updating project by title', { projectTitle, userId });

    const project = await Project.findOne({ title: projectTitle });

    if (!project) {
        throw new NotFoundError('Project not found');
    }

    Object.assign(project, body);
    await project.save();

    logger.info('Project updated successfully', { projectId: project._id });
    return ApiResponse.success(project, "Project updated successfully");
}, { requireAuth: true });