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

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('q') || searchParams.get('search') || '';
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const priority = searchParams.get('priority');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 50;
    const sortBy = searchParams.get('sortBy') || 'lastActivityAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    const authHeader = request.headers.get('authorization');
    const userId = await getUserFromToken(authHeader);
    
    // Build filters
    const filters = {
      page,
      limit,
      sortBy,
      sortOrder
    };

    if (status) filters.status = status;
    if (type) filters.type = type;
    if (priority) filters.priority = parseInt(priority);
    
    const result = await workItemService.searchWorkItems(search, filters, userId);
    
    return ApiResponse.success(result, 'Work items search completed successfully');
    
  } catch (error) {
    console.error('Error searching work items:', error);
    
    if (error instanceof ValidationError) {
      return ApiResponse.error('Validation failed', 400, error.errors);
    }
    
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    
    return ApiResponse.error('Internal server error', 500);
  }
}
