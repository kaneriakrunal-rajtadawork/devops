import { ApiResponse } from "@/lib/response.js";
import {
    createProject,
    getProjectsByUser
} from "@/services/project.service";
import { withRoute } from "@/utils/errorHandler.js";
import Logger from "@/lib/logger.js";

const logger = new Logger('ProjectsRoute');

/**
 * GET /api/projects - Get user projects with optional filters
 */
export const GET = withRoute(async (request, { userId }) => {
    const { searchParams } = new URL(request.url);

    // Check if specific user_id is requested (for backward compatibility)
    const requestedUserId = searchParams.get('user_id');
    const effectiveUserId = requestedUserId || userId;

    logger.debug('Fetching projects', { effectiveUserId, requestedUserId });

    // Extract filters from search params
    const filters = {};
    if (searchParams.get('status')) filters.status = searchParams.get('status');
    if (searchParams.get('featured')) filters.featured = searchParams.get('featured') === 'true';
    if (searchParams.get('createdFromEMS')) filters.createdFromEMS = searchParams.get('createdFromEMS') === 'true';
    if (searchParams.get('search')) filters.search = searchParams.get('search');
    if (searchParams.get('technologies')) filters.technologies = searchParams.get('technologies').split(',');
    if (searchParams.get('tags')) filters.tags = searchParams.get('tags').split(',');

    const projects = await getProjectsByUser(effectiveUserId, filters);

    logger.info('Projects retrieved successfully', { count: projects?.length || 0 });
    return ApiResponse.success(projects, "Projects retrieved successfully");
}, { requireAuth: true });

/**
 * POST /api/projects - Create a new project
 */
export const POST = withRoute(async (request, { userId }) => {
    const body = await request.json();

    logger.debug('Creating project', { userId, title: body.title });

    // Transform legacy field names for backward compatibility
    const projectData = {
        title: body.title,
        description: body.description,
        status: body.status,
        favourite: body.favorite || body.favourite,
        startDate: body.startDate,
        endDate: body.endDate,
        liveUrl: body.liveUrl || body.repository, // Support legacy field
        featured: body.featured,
        technologies: body.technologies,
        projectCreatorId: userId
    };

    const project = await createProject(projectData, userId);

    logger.info('Project created successfully', { projectId: project?.id || project?._id });
    return ApiResponse.success(project, "Project created successfully", 201);
}, { requireAuth: true });