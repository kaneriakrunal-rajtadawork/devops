import { ApiResponse } from "@/lib/api-response";
import { 
  getGithubRepoDetails, 
  getRepoById, 
  updateRepo, 
  deleteRepo,
  syncRepoWithGithub 
} from '@/services/repo.service';
import { ValidationError } from "@/lib/errors";
import { parseToken } from "@/lib/parseToken";

/**
 * GET /api/repos/[repoId] - Get repository details with GitHub data
 */
export async function GET(request, { params }) {
  try {

    const { id } = await params;
    const user = await parseToken(request.headers.get("Authorization"));
    if (!id) {
      throw new ValidationError("Repository ID is required");
    }

    const repoDetails = await getGithubRepoDetails(id, user.id);
    return ApiResponse.success(repoDetails, "Repository details retrieved successfully");
  } catch (error) {
    console.error("GET /api/repos/[id] error:", error);
    return ApiResponse.error(error);
  }
}

/**
 * PUT /api/repos/[repoId] - Update repository
 */
export async function PUT(request, { params }) {
  try {
    const { repoId } = await params;
    
    if (!repoId) {
      throw new ValidationError("Repository ID is required");
    }

    const body = await request.json();
    const updatedRepo = await updateRepo(repoId, body);
    return ApiResponse.success(updatedRepo, "Repository updated successfully");
  } catch (error) {
    console.error("PUT /api/repos/[repoId] error:", error);
    return ApiResponse.error(error);
  }
}

/**
 * DELETE /api/repos/[repoId] - Delete repository
 */
export async function DELETE(request, { params }) {
  try {
    const { repoId } = await params;
    
    if (!repoId) {
      throw new ValidationError("Repository ID is required");
    }

    await deleteRepo(repoId);
    return ApiResponse.success(null, "Repository deleted successfully");
  } catch (error) {
    console.error("DELETE /api/repos/[repoId] error:", error);
    return ApiResponse.error(error);
  }
}

/**
 * PATCH /api/repos/[repoId] - Sync repository with GitHub
 */
export async function PATCH(request, { params }) {
  try {
    const { repoId } = await params;
    
    if (!repoId) {
      throw new ValidationError("Repository ID is required");
    }

    const result = await syncRepoWithGithub(repoId);
    return ApiResponse.success(result, "Repository synced successfully");
  } catch (error) {
    console.error("PATCH /api/repos/[repoId] error:", error);
    return ApiResponse.error(error);
  }
}