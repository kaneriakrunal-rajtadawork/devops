import { ApiResponse } from "@/lib/api-response";
import { changeUserPassword } from "@/services/user.service";
import { UnauthorizedError } from "@/lib/errors";
import { headers } from 'next/headers';
import userService from "@/services/user.service";

/**
 * PUT /api/auth/change-password - Change user password
 */
export async function PUT(request) {
  try {
    const headersList = headers();
    const authorization = headersList.get('authorization');
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedError("Authorization token is required");
    }

    const token = authorization.split(' ')[1];
    const decoded = userService.verifyToken(token);
    
    const body = await request.json();
    const result = await changeUserPassword(decoded.id, body);
    
    return ApiResponse.success(result, "Password changed successfully");
  } catch (error) {
    console.error('Error changing password:', error);
    return ApiResponse.error(error);
  }
}
