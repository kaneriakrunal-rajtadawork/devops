import { ApiResponse } from "@/lib/api-response";
import { 
  getRepoBranchFiles,
} from '@/services/repo.service';
import { ValidationError } from "@/lib/errors";
import { parseToken } from "@/lib/parseToken";

/**
 * GET /api/repos/[repoId]/files - Get repository files
 */
export async function GET(request, { params }) {
  try {

    const { id } = await params;
    const branchName = request.nextUrl.searchParams.get('branchName') || '';
    const path = request.nextUrl.searchParams.get('path') || '';
    if(!branchName) {
      throw new ValidationError("Branch name is required");
    }
    const user = await parseToken(request.headers.get("Authorization"));

    if (!id) {
      throw new ValidationError("Repository ID is required");
    }

    const branches = await getRepoBranchFiles(id, branchName, path, user.id);
    return ApiResponse.success(branches, "Repository branches retrieved successfully");
  } catch (error) {
    console.error("GET /api/repos/[id]/branches error:", error);
    return ApiResponse.error(error);
  }
}