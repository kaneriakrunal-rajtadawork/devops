import { ApiResponse } from "@/lib/api-response";
import { createProjectFromEMS } from "@/services/project.service";

/**
 * POST /api/ems-kanban-sync/projects - Create project from EMS system
 */
export async function POST(request) {
  try {
    const payload = await request.json();
    
    const newProject = await createProjectFromEMS(payload);
    return ApiResponse.created(newProject, "Project created from EMS successfully");
  } catch (error) {
    console.error("Error creating project:", error);
    return ApiResponse.error(error);
  }
}
