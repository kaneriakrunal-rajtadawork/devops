import { ApiResponse } from "@/lib/api-response";
import { getAllUsers } from "@/services/user.service";
import { UnauthorizedError } from "@/lib/errors";

/**
 * GET /api/users - Get all users with optional filters
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters = {};
    if (searchParams.get('role')) filters.role = searchParams.get('role');
    if (searchParams.get('isFromEMS')) filters.isFromEMS = searchParams.get('isFromEMS') === 'true';
    if (searchParams.get('isActive')) filters.isActive = searchParams.get('isActive') === 'true';

    const users = await getAllUsers(filters);
    return ApiResponse.success(users, "Users retrieved successfully");
  } catch (error) {
    console.error('Error fetching users:', error);
    return ApiResponse.error(error);
  }
} 