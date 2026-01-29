import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import workItemService from '@/services/workitem.service.js';
import { ApiResponse } from '@/lib/response.js';
import { AppError, ValidationError, NotFoundError, UnauthorizedError } from '@/lib/errors.js';
import { verifyToken } from '@/utils/verifyToken';

// Helper function to get user ID from token
async function getUserFromToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  try {
    const token = authHeader.split(' ')[1];
    const req = { headers: { authorization: authHeader } };
    
    let userId = null;
    await verifyToken(async (req2) => { userId = req2.user.id; })(req, {});
    return userId;
  } catch (error) {
    return null;
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const authHeader = request.headers.get('authorization');
    const userId = await getUserFromToken(authHeader);
    
    if (!userId) {
      return ApiResponse.error('Authentication required', 401);
    }
    
    const body = await request.json();
    
    const result = await workItemService.toggleWorkItemBlock(params.id, body, userId);
    
    return ApiResponse.success(result, 'Work item block status updated successfully');
    
  } catch (error) {
    console.error('Error updating work item block status:', error);
    
    if (error instanceof ValidationError) {
      return ApiResponse.error('Validation failed', 400, error.errors);
    }
    
    if (error instanceof NotFoundError) {
      return ApiResponse.error(error.message, 404);
    }
    
    if (error instanceof UnauthorizedError) {
      return ApiResponse.error(error.message, 403);
    }
    
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    
    return ApiResponse.error('Internal server error', 500);
  }
}
