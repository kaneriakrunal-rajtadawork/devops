import { z } from 'zod';
import { objectId } from './validations';

/**
 * Work Item Comment Input Schema
 * For user input when creating comments (workItemId and createdBy added server-side)
 */
export const workItemCommentInputSchema = z.object({
    comment: z.string().min(1, "Comment is required").max(50000, "Comment cannot exceed 50000 characters"),
    reactions: z.array(z.string()).optional(),
});

/**
 * Full Work Item Comment Schema
 * For service layer validation (includes all fields)
 */
export const workItemCommentSchema = workItemCommentInputSchema.extend({
    workItemId: z.string().min(1, "Work Item ID is required"),
    createdBy: z.string().min(1, "Creator ID is required"),
    comment: z.string().min(1, "Comment is required").max(50000, "Comment cannot exceed 50000 characters"),
    reactions: z.array(z.string()).optional(),
});

export const workItemCommentReactionSchema = z.object({
    commentId: objectId.describe("Comment ID is required"),
    reaction: z.string().min(1, "Reaction is required"),
});