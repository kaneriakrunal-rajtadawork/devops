import { ApiResponse } from "@/lib/api-response";
import { getUserProfile } from "@/services/user.service";
import { UnauthorizedError } from "@/lib/errors";
import { headers } from 'next/headers';
import userService from "@/services/user.service";

/**
 * GET /api/auth/me - Get current user profile
 */
export async function GET(request) {
  try {
    const headersList = headers();
    const authorization = headersList.get('authorization');
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedError("Authorization token is required");
    }

    const token = authorization.split(' ')[1];
    const decoded = userService.verifyToken(token);
    
    const user = await getUserProfile(decoded.id);
    return ApiResponse.success(user, "User profile retrieved successfully");
  } catch (error) {
    console.error('Error getting user profile:', error);
    return ApiResponse.error(error);
  }
}

/**
 * PUT /api/auth/me - Update current user profile
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
    const updatedUser = await userService.updateProfile(decoded.id, body);
    
    return ApiResponse.success(updatedUser, "Profile updated successfully");
  } catch (error) {
    console.error('Error updating user profile:', error);
    return ApiResponse.error(error);
  }
}
