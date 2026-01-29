import { ApiResponse } from "@/lib/api-response";
import { 
  addProjectMember, 
  removeProjectMember,
  getProjectById,
  updateProjectMember
} from "@/services/project.service";
import { withValidation } from "@/lib/validation";
import { projectMemberSchema } from "@/lib/validations";
import { UnauthorizedError } from "@/lib/errors";

/**
 * GET /api/projects/[id]/members - Get project members
 */
export async function GET(request, { params }) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    
    const project = await getProjectById(params.id, userId);
    
    // Return member information
    const members = {
      creator: project.projectCreatorId,
      members: project.members,
      memberCount: project.memberCount
    };
    
    return ApiResponse.success(members, "Project members retrieved successfully");
  } catch (error) {
    console.error('Error fetching project members:', error);
    return ApiResponse.error(error);
  }
}

export async function PUT(request, {params}) {
  try {
    const body = await request.json();
    const resolvedParams = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || body.requesterId;

    if (!userId) {
      throw new UnauthorizedError("User ID is required");
    }

    if (!resolvedParams.id) {
      throw new Error("Project ID is required");
    }

    const project = await updateProjectMember(resolvedParams.id, body, userId);
    return ApiResponse.success(project, "Member updated successfully");
  } catch (error) {
    console.error('Error updating project member:', error);
    return ApiResponse.error(error);
  }
}

/**
 * POST /api/projects/[id]/members - Add member to project
 */
export async function POST(request, { params }) {
  try {
    const body = await request.json();
    const resolvedParams = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || body.requesterId;
    
    if (!userId) {
      throw new UnauthorizedError("User ID is required");
    }

    const memberData = {
      userId: body.userId || body.memberId,
      action: 'add'
    };

    const project = await addProjectMember(resolvedParams.id, memberData, userId);
    return ApiResponse.success(project, "Member added successfully");
  } catch (error) {
    console.error('Error adding project member:', error);
    return ApiResponse.error(error);
  }
}

/**
 * DELETE /api/projects/[id]/members - Remove member from project
 */
export async function DELETE(request, { params }) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id') || body.requesterId;
    
    if (!userId) {
      throw new UnauthorizedError("User ID is required");
    }

    const memberData = {
      userId: body.userId || body.memberId,
      action: 'remove'
    };

    const project = await removeProjectMember(params.id, memberData, userId);
    return ApiResponse.success(project, "Member removed successfully");
  } catch (error) {
    console.error('Error removing project member:', error);
    return ApiResponse.error(error);
  }
} 