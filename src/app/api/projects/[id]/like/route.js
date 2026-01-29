import { ApiResponse } from "@/lib/api-response";
import { toggleProjectLike } from "@/services/project.service";
import { UnauthorizedError } from "@/lib/errors";

/**
 * PATCH /api/projects/[id]/like - Toggle like on project
 */
export async function PATCH(request, { params }) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id') || body.userId;
    
    if (!userId) {
      throw new UnauthorizedError("User ID is required");
    }

    const likeData = { userId };
    const project = await toggleProjectLike(params.id, likeData);
    
    return ApiResponse.success(project, "Project like toggled successfully");
  } catch (error) {
    console.error('Error toggling like:', error);
    return ApiResponse.error(error);
  }
} 