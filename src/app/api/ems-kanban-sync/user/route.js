import { ApiResponse } from "@/lib/api-response";
import { createUser } from "@/services/user.service";

/**
 * POST /api/ems-kanban-sync/user - Create user from EMS system
 */
export async function POST(request) {
  try {
    const userData = await request.json();
    
    const result = await createUser(userData);
    return ApiResponse.created(result, "User created from EMS successfully");
  } catch (error) {
    console.error("Error creating user:", error);
    return ApiResponse.error(error);
  }
}