import { ApiResponse } from "@/lib/api-response";
import { 
  getProjectById, 
  updateProject, 
  deleteProject 
} from "@/services/project.service";
import { withValidation } from "@/lib/validation";
import { updateProjectSchema } from "@/lib/validations";
import { UnauthorizedError } from "@/lib/errors";

/**
 * GET /api/projects/[id] - Get project by ID
 */
export async function GET(request, { params }) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id'); // Optional for permission check
    
    const project = await getProjectById(params.id, userId);
    return ApiResponse.success(project, "Project retrieved successfully");
  } catch (error) {
    console.error('Error fetching project:', error);
    return ApiResponse.error(error);
  }
}

/**
 * PUT /api/projects/[id] - Update project
 */
export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id') || body.user_id;
    
    if (!userId) {
      throw new UnauthorizedError("User ID is required for updates");
    }

    // Transform legacy field names for backward compatibility
    const updateData = {
      title: body.title,
      description: body.description,
      status: body.status,
      favourite: body.favorite || body.favourite,
      startDate: body.startDate,
      endDate: body.endDate,
      liveUrl: body.liveUrl || body.repository,
      featured: body.featured,
      technologies: body.technologies,
      tags: body.tags,
      about: body.about,
      images: body.images,
      visibility: body.visibility,
      priority: body.priority
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );

    const project = await updateProject(params.id, updateData, userId);
    return ApiResponse.success(project, "Project updated successfully");
  } catch (error) {
    console.error('Error updating project:', error);
    return ApiResponse.error(error);
  }
}

/**
 * PATCH /api/projects/[id] - Partial update project
 */
export async function PATCH(request, { params }) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id') || body.user_id;
    
    if (!userId) {
      throw new UnauthorizedError("User ID is required for updates");
    }

    // Handle specific patch operations
    const updateData = {};
    
    if (body.description !== undefined) updateData.description = body.description;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.about !== undefined) updateData.about = body.about;
    if (body.repository !== undefined) updateData.liveUrl = body.repository;
    if (body.progress !== undefined) updateData.progress = body.progress;
    if (body.status !== undefined) updateData.status = body.status;

    const project = await updateProject(params.id, updateData, userId);
    return ApiResponse.success(project, "Project updated successfully");
  } catch (error) {
    console.error('Error patching project:', error);
    return ApiResponse.error(error);
  }
}

/**
 * DELETE /api/projects/[id] - Delete project
 */
export async function DELETE(request, { params }) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    
    if (!userId) {
      throw new UnauthorizedError("User ID is required for deletion");
    }

    const result = await deleteProject(params.id, userId);
    return ApiResponse.success(result, "Project deleted successfully");
  } catch (error) {
    console.error('Error deleting project:', error);
    return ApiResponse.error(error);
  }
} 