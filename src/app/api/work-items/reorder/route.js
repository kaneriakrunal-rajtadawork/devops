import workItemService from '@/services/workitem.service.js';
import { ApiResponse } from '@/lib/response.js';
import { withRoute } from '@/utils/errorHandler.js';
import {validateData} from "../../../../lib/validation";
import { reorderWorkItemSchema } from '../../../../lib/validations';
import Logger from "@/lib/logger.js";

const logger = new Logger("Work-Items-Reorder");

export const PATCH = withRoute(async (request , {userId}) => {
    const body = await request.json();

    const validatedData = validateData(reorderWorkItemSchema,body);

    const result = await workItemService.reorderWorkItem(validatedData, userId);

    return ApiResponse.success(result, 'Work items reordered successfully');

}, {requireAuth:true})