import { withRoute } from "@/utils/errorHandler";
import workItemCommentService from "@/services/workItemComment.service";
import { ApiResponse } from "@/lib/response.js";
import { AppError } from "@/lib/errors";

export const POST = withRoute(async (request, {userId}, { params }) => {
    const body = await request.json();
    const { id: commentId } = await params;
    if (!commentId) {
        throw new AppError("Comment ID is required", 400);
    }
    const comment = await workItemCommentService.addReaction(commentId, body.reaction, userId);
    return ApiResponse.success(comment);
}, { requireAuth: true })

export const DELETE = withRoute(async (request, {userId}, { params }) => {
    const body = await request.json();
    const { id: commentId } = await params;
    if (!commentId) {
        throw new AppError("Comment ID is required", 400);
    }
    const comment = await workItemCommentService.removeReaction(commentId, body.reaction, userId);
    return ApiResponse.success(comment);
}, { requireAuth: true })


