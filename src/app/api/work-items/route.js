import { NextResponse } from 'next/server';
import workItemService from '@/services/workitem.service.js';
import { ApiResponse } from '@/lib/response.js';
import { getUserFromRequest } from '@/utils/authHelpers.js';
import { withRoute } from '@/utils/errorHandler.js';
import Logger from "@/lib/logger.js";
import { validateData } from '../../../lib/validation';
import { workItemListSchema } from '../../../validations/workItems.validation';

const logger = new Logger("Work-Items");

export const PATCH = withRoute(async (request, {userId}) => {
    const body = await request.json();

    const validatedData = await validateData(workItemListSchema,body);

    logger.debug("ValidatedData",validatedData);
  

    // if (projectId) {
    //     // Get work items for specific project
    //     result = await workItemService.getWorkItemsByProject(projectId, filters, userId);
    // } else if (assignedTo === 'me' && userId) {
    //     // Get work items assigned to current user
    //     result = await workItemService.getAssignedWorkItems(userId, filters);
    // } else if (search) {
    //     // Search work items
    //     result = await workItemService.searchWorkItems(search, filters, userId);
    // } else {
    //     // Get all accessible work items (with filters)
    //     result = await workItemService.searchWorkItems('', filters, userId);
    // }

    const result = await workItemService.getWorkItems(validatedData,userId);

    return ApiResponse.success(result, 'Work items retrieved successfully');
}, { requireAuth: true });

export const POST = withRoute(async (request, {userId}) => {
    const body = await request.json();
    const workItem = await workItemService.createWorkItem(body, userId);
    return ApiResponse.success(workItem, 'Work item created successfully', 201);
}, { requireAuth: true });