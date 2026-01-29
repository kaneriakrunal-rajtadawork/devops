import { BaseService } from './base.service.js';
import WorkComment from '@/models/WorkItemComment.model.js';
import { workItemCommentReactionSchema, workItemCommentSchema } from '@/lib/commentValidations.js';
import { validateData } from '@/lib/validation.js';
import { UnauthorizedError } from '@/lib/errors.js';
import Logger from '@/lib/logger.js';

class WorkItemCommentService extends BaseService {
    constructor() {
        super(WorkComment, 'WorkItemComment');
        this.logger = new Logger('WorkItemCommentService');
    }

    /**
     * Create a new comment on a work item
     */
    async createComment(text, workItemId, userId) {
        // const workItem = await workitemService.findByIdOrThrow(workItemId, 'Work item not found');
        // const repo = await repoService.findById(workItem.repo,{
        //     populate:"projectId",
        //     select:"members projectCreatorId"
        // });

        // this.logger.debug('Repo found', { repo });
        // const project = repo.project;

        // requireRepoMember(userId, repo);

        // requireProjectMember(userId, project);

        const validatedData = validateData(workItemCommentSchema, {
            comment:text,
            workItemId,
            createdBy: userId,
            reactions: []
        });

        const comment = await this.create(validatedData);
        return comment;
    }

    /**
     * Get all comments for a work item
     */
    async getCommentsByWorkItem(workItemId, options = {}) {
        this.logger.debug('Fetching comments for work item', { workItemId });

        const comments = await this.findMany(
            { workItemId },
            {
                populate: options.populate || 'createdByUser',
                sort: options.sort || { createdAt: -1 },
                limit: options.limit,
                skip: options.skip
            }
        );

        return comments;
    }

    /**
     * Get a single comment by ID
     */
    async getCommentById(commentId) {
        const comment = await this.findByIdOrThrow(commentId, 'Comment');
        return comment;
    }

    /**
     * Update a comment
     */
    async updateComment(commentId, updateData, userId) {
        this.logger.debug('Updating comment', { commentId, userId });

        const comment = await this.findByIdOrThrow(commentId, 'Comment');

        // Only the creator can edit their comment
        if (comment.createdBy.toString() !== userId.toString()) {
            throw new UnauthorizedError('You can only edit your own comments');
        }

        // Only allow updating the comment text
        if (updateData.comment) {
            comment.comment = updateData.comment;
        }

        await comment.save();
        return comment;
    }

    /**
     * Delete a comment
     */
    async deleteComment(commentId, userId) {
        this.logger.debug('Deleting comment', { commentId, userId });

        const comment = await this.findByIdOrThrow(commentId, 'Comment');

        // Only the creator can delete their comment
        if (comment.createdBy.toString() !== userId.toString()) {
            throw new UnauthorizedError('You can only delete your own comments');
        }

        await this.delete(commentId);
        return { message: 'Comment deleted successfully' };
    }

    /**
     * Add a reaction to a comment
     */
    async addReaction(commentId, reaction, userId) {
        this.logger.debug('Adding reaction', { commentId, reaction, userId });

        const validatedData = validateData(workItemCommentReactionSchema,{commentId,reaction})

        const comment = await this.findByIdOrThrow(validatedData.commentId, 'Comment');

        if (!comment.reactions) {
            comment.reactions = [];
        }

        const existingReaction = comment.reactions.find((reaction) => reaction.reaction === validatedData.reaction);
        // Add reaction if not already present
        if (!existingReaction) {
            comment.reactions.push({reaction:validatedData.reaction,reactedUsers:[userId]});
        } else {
            if(existingReaction.reactedUsers.includes(userId)) {
                existingReaction.reactedUsers.splice(existingReaction.reactedUsers.indexOf(userId), 1);
                if(existingReaction.reactedUsers.length === 0) {
                    comment.reactions = comment.reactions.filter((r) => r.reaction !== validatedData.reaction);
                }
            } else {
                existingReaction.reactedUsers.push(userId);
            }
        }

        await comment.save();
        return comment;
    }

    /**
     * Remove a reaction from a comment
     */
    async removeReaction(commentId, reaction, userId) {
        this.logger.debug('Removing reaction', { commentId, reaction, userId });

        const comment = await this.findByIdOrThrow(commentId, 'Comment');

        if (comment.reactions) {
            comment.reactions = comment.reactions.filter(r => r !== reaction);
            await comment.save();
        }

        return comment;
    }

    /**
     * Get comment count for a work item
     */
    async getCommentCount(workItemId) {
        return await this.count({ workItemId });
    }
}

// Create singleton instance
const workItemCommentService = new WorkItemCommentService();

export { workItemCommentService, WorkItemCommentService };
export default workItemCommentService;
