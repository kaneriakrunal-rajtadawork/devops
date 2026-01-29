import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import workItemService from '@/services/workitem.service.js';
import { ApiResponse } from '@/lib/response.js';
import { AppError, ValidationError, NotFoundError, UnauthorizedError } from '@/lib/errors.js';
import { getUserFromRequest, requireAuth } from '@/utils/authHelpers.js';
import { withRoute } from '@/utils/errorHandler';
import Logger from '@/lib/logger';

// export async function GET(request, { params }) {
//   try {
//     await connectDB();
    
//     // Get user from middleware (optional for GET)
//     const user = getUserFromRequest(request);
//     const userId = user?.id || null;
    
//     const workItem = await workItemService.getWorkItemById(params.id, userId);
    
//     return ApiResponse.success(workItem, 'Work item retrieved successfully');
    
//   } catch (error) {
//     console.error('Error fetching work item:', error);
    
//     if (error instanceof NotFoundError) {
//       return ApiResponse.error(error.message, 404);
//     }
    
//     if (error instanceof UnauthorizedError) {
//       return ApiResponse.error(error.message, 403);
//     }
    
//     if (error instanceof AppError) {
//       return ApiResponse.error(error.message, error.statusCode, error.errors);
//     }
    
//     return ApiResponse.error('Internal server error', 500);
//   }
// }

export const GET = withRoute(async (request, context, {params}) => {
    const logger = new Logger("Get Work Item");
    logger.info("Getting work item",context);
    const {id:workItemId} = await params;
    const workItem = await workItemService.getWorkItemById(workItemId,context.userId);
    return ApiResponse.success(workItem,'Work item retrieved successfully');
},{requireAuth:true})

export const PUT = withRoute(async (request, context, {params}) => {
    
    const logger = new Logger("Update Work Item");
    logger.info("Updating work item",context);
    const {id:workItemId} = await params;
    const body = await request.json();
    const workItem = await workItemService.updateWorkItem(workItemId,body,context.userId);
    return ApiResponse.success(workItem,'Work item updated successfully');

    
},{requireAuth:true})

export const DELETE = withRoute(async (request, {userId}, {params}) => {
    const logger = new Logger("Delete Work Item");
    logger.info("Deleting work item",userId);
    const {id:workItemId} = await params;
    await workItemService.deleteWorkItem(workItemId,userId);
    return ApiResponse.success('Work item deleted successfully');
}, {requireAuth:true})

