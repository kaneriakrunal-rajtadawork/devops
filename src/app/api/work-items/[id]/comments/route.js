import { withRoute } from "@/utils/errorHandler";
import workitemService from "@/services/workitem.service";
import { ApiResponse } from "@/lib/response";
import { AppError } from "@/lib/errors";
import workItemCommentService from "@/services/workItemComment.service";

export const GET = withRoute(async (request, context, { params }) => {
    const { id: workItemId } = await params;
    if (!workItemId) {
        throw new AppError("Work item ID is required", 400);
    }
    const comments = await workItemCommentService.getCommentsByWorkItem(workItemId, {
        populate: [
            {
                path: "createdByUser",
                select: "name",
            },
            {
                path: "reactionUsers",
                select: "name",
            }
        ]
    });
    return ApiResponse.success(comments);
}, { requireAuth: true });


export const POST = withRoute(async (request, {userId}, { params }) => {
    const body = await request.json();
    const { id: workItemId } = await params;
    if (!workItemId) {
        throw new AppError("Work item ID is required", 400);
    }
    try {
        const comment = await workItemCommentService.createComment(body.comment, workItemId, userId);
        return ApiResponse.success(comment);

    } catch(error) {
        console.error("Error occured while creating new comment",error);
        return ApiResponse.error("Error creating comment",500);
    }
}, { requireAuth: true })

export const PUT = withRoute(async (request, {userId}, { params }) => {
    const body = await request.json();
    const { id: commentId } = await params;
    if (!commentId) {
        throw new AppError("Comment ID is required", 400);
    }
    const comment = await workItemCommentService.updateComment(commentId, body, userId);
    return ApiResponse.success(comment);
}, { requireAuth: true })

export const DELETE = withRoute(async (request, {userId}, { params }) => {
    const { id: commentId } = await params;
    if (!commentId) {
        throw new AppError("Comment ID is required", 400);
    }
    const comment = await workItemCommentService.deleteComment(commentId, userId);
    return ApiResponse.success(comment);
}, { requireAuth: true })
