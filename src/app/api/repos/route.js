import { ApiResponse } from "@/lib/api-response";
import { getRepo, createRepo, getReposByProjectId, getUserRepos } from "@/services/repo.service";
import { UnauthorizedError, ValidationError } from "@/lib/errors";
import { withValidation } from "@/lib/validation";
import { repoSchema } from "@/lib/validations";
import { parseToken } from "@/lib/parseToken";

/**
 * GET /api/repos - Get repositories by project ID
 */
export async function GET(request) {
  try {
    const projectId = request.nextUrl.searchParams.get("projectId");
    const user = await parseToken(request.headers.get("Authorization"));

    if (!projectId) {
      throw new ValidationError("Project ID is required");
    }

    let repos = [];
    if(projectId && !user) {
      repos = await getReposByProjectId(projectId);
    } else {
      repos = await getUserRepos(projectId, user?.userId);
    }
    return ApiResponse.success(repos, "Repositories retrieved successfully");
  } catch (error) {
    console.error("GET /api/repos error:", error);
    return ApiResponse.error(error);
  }
}

/**
 * POST /api/repos - Create a new repository
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const repo = await createRepo(body);
    return ApiResponse.created(repo, "Repository created successfully");
  } catch (error) {
    console.error("POST /api/repos error:", error);
    return ApiResponse.error(error);
  }
}