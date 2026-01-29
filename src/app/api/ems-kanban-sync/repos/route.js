import { ApiResponse } from "@/lib/api-response";
import { createRepoFromEMS } from "@/services/repo.service";

/**
 * POST /api/ems-kanban-sync/repos - Create repository from EMS system
 */
export async function POST(request) {
  try {
    const payload = await request.json();
    const newRepo = await createRepoFromEMS(payload);
    return ApiResponse.created(newRepo, "Repository created from EMS successfully");
  } catch (error) {
    console.error("POST /api/ems-kanban-sync/repos error:", error);
    return ApiResponse.error(error);
  }
}