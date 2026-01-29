import { ApiResponse } from "@/lib/api-response";
import { 
  getRepoBranches,
} from '@/services/repo.service';
import { ValidationError } from "@/lib/errors";
import { parseToken } from "@/lib/parseToken";

/**
 * GET /api/repos/[repoId]/branches - Get repository branches
 */
export async function GET(request, { params }) {
  try {

    const { id } = await params;
    const user = await parseToken(request.headers.get("Authorization"));
    if (!id) {
      throw new ValidationError("Repository ID is required");
    }

    const branches = await getRepoBranches(id, user.id);
    return ApiResponse.success(branches, "Repository branches retrieved successfully");
  } catch (error) {
    console.error("GET /api/repos/[id]/branches error:", error);
    return ApiResponse.error(error);
  }
}