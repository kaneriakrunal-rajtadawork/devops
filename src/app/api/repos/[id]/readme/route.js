import { ApiResponse } from "@/lib/api-response";
import { 
  getRepoReadme,
} from '@/services/repo.service';
import { ValidationError } from "@/lib/errors";
import { parseToken } from "@/lib/parseToken";

/**
 * GET /api/repos/[repoId]/readme - Get repository readme
 */
export async function GET(request, { params }) {
  try {

    const { id } = await params;
    const branchName = request.nextUrl.searchParams.get('branchName') || '';
    
    if(!branchName) {
      throw new ValidationError("Branch name is required");
    }
    const user = await parseToken(request.headers.get("Authorization"));

    if (!id) {
      throw new ValidationError("Repository ID is required");
    }

    const readme = await getRepoReadme(id, branchName, user.id);
    return ApiResponse.success(readme, "Repository readme retrieved successfully");
  } catch (error) {
    console.error("GET /api/repos/[id]/readme error:", error);
    return ApiResponse.error(error);
  }
}