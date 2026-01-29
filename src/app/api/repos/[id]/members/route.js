import { ApiResponse } from "@/lib/api-response";
import { UnauthorizedError } from "@/lib/errors";
import { addRepoMember, removeRepoMember, updateRepoMember } from "@/services/repo.service";

/**
 * POST /api/repos/[id]/members - Add member to repository
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

    const repo = await addRepoMember(resolvedParams.id, memberData, userId);
    return ApiResponse.success(repo, "Member added successfully");
  } catch (error) {
    console.error('Error adding repository member:', error);
    return ApiResponse.error(error);
  }
}

/**
 * PUT /api/repos/[id]/members - Update member in repository
 */
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
      throw new Error("Repository ID is required");
    }

    const repo = await updateRepoMember(resolvedParams.id, body, userId);
    return ApiResponse.success(repo, "Member updated successfully");
  } catch (error) {
    console.error('Error updating repository member:', error);
    return ApiResponse.error(error);
  }
}

/**
 * DELETE /api/repos/[id]/members - Remove member from repository
 */
export async function DELETE(request, { params }) {
  try {
    const body = await request.json();
    const resolvedParams = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || body.requesterId;
    
    if (!userId) {
      throw new UnauthorizedError("User ID is required");
    }

     if (!resolvedParams.id) {
      throw new Error("Repository ID is required");
    }

    const memberData = {
      userId: body.userId || body.memberId,
      action: 'remove'
    };

    const repo = await removeRepoMember(resolvedParams.id, memberData, userId);
    return ApiResponse.success(repo, "Member removed successfully");
  } catch (error) {
    console.error('Error removing repository member:', error);
    return ApiResponse.error(error);
  }
} 