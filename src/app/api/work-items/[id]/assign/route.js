import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import workItemService from '@/services/workitem.service.js';
import { ApiResponse } from '@/lib/response.js';
import { AppError, ValidationError, NotFoundError, UnauthorizedError } from '@/lib/errors.js';
import { requireAuth } from '@/utils/authHelpers.js';

export async function POST(request, { params }) {
  try {
    await connectDB();
    
    // Require authentication
    const user = requireAuth(request);
    const userId = user.id;
    
    const body = await request.json();
    
    const result = await workItemService.assignWorkItem(params.id, body, userId);
    
    return ApiResponse.success(result, 'Work item assignment updated successfully');
    
  } catch (error) {
    console.error('Error updating work item assignment:', error);
    
    if (error.status === 401) {
      return ApiResponse.error('Authentication required', 401);
    }
    
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
