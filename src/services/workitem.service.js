import { BaseService } from './base.service.js';
import WorkItem, { workItemFilterConfig } from '@/models/WorkItem.model.js';
import Project from '@/models/Project.model.js';
import User from '@/models/User.model.js';
import {
    workItemSchema,
    createWorkItemSchema,
    updateWorkItemSchema,
    workItemAssignmentSchema,
    workItemStatusSchema,
    workItemPullRequestSchema,
    workItemCommentSchema,
    createWorkItemCommentSchema
} from '@/lib/validations.js';
import { AppError, ValidationError, NotFoundError, UnauthorizedError } from '@/lib/errors.js';
import Repo from '@/models/Repo.model.js';
import { requireRepoAdmin, requireRepoMember, requireProjectMember, requireOrganizationMember } from '@/utils/authHelpers.js';
import { validateData } from "@/lib/validation";
import Logger from "@/lib/logger";
import projectService from './project.service.js';
import { repoService } from './repo.service.js';
import mongoose from 'mongoose';
import workItemCommentService from './workItemComment.service.js';
import { HttpStatusCode } from 'axios';
import userService from './user.service.js';
import { workItemListSchema } from '../validations/workItems.validation.js';
import { LexoRank } from 'lexorank';
import { STATES, WORKITEMTYPE } from '@/constants/common.constants.js';

class WorkItemService extends BaseService {
    constructor() {
        super(WorkItem, 'WorkItem');
        this.logger = new Logger('WorkItemService');
    }

    /**
     * Create a new work item
     */
    async createWorkItem(workItemData, creatorId) {

        const { comments, position, ...workItemWithoutComments } = workItemData;

        // Verify project exists and user has access
        const project = await projectService.findByIdOrThrow(workItemWithoutComments.project, "Project");
        const repo = await repoService.findByIdOrThrow(workItemWithoutComments.repo, "Repo");

        // Check if user has permission to create work items (must be Scrum Master or Department Lead)
        requireRepoAdmin(creatorId, repo);

        if (workItemWithoutComments.assignedTo) {
            requireRepoMember(workItemWithoutComments.assignedTo, repo);
        }

        // Set creator and updatedBy
        workItemWithoutComments.createdBy = creatorId;
        workItemWithoutComments.updatedBy = creatorId;

        //If no area is found the assign the repo name
        if (!workItemWithoutComments.area) {
            workItemWithoutComments.area = project.title;
        }

        //If no iteration is found the assign the repo iteration
        if (!workItemWithoutComments.iteration) {
            workItemWithoutComments.iteration = 'Synxa/Iteration1';
        }

        //Update the number of workitem
        const lastWorkItem = await this.findOne({ repo: workItemWithoutComments.repo }, {
            select: {
                number: 1
            },
            sort: {
                createdAt: -1
            }
        });

        if (lastWorkItem) {
            workItemWithoutComments.number = lastWorkItem.number + 1;
        } else {
            workItemWithoutComments.number = 1;
        }



        const validatedData = validateData(createWorkItemSchema, workItemWithoutComments);

        const workItem = new WorkItem(validatedData);

        // Pass the position preference to the pre-save hook
        workItem._position = position || 'bottom';

        const createdWorkItem = await workItem.save();

        //If the workItemData has comments then need to create WorkItemComment also
        if (Array.isArray(comments) && comments.length > 0) {
            //Fetch only one comment because we are not creating multiple comments at once
            const commentDetails = comments[0];
            await workItemCommentService.createComment(commentDetails.comment, createdWorkItem._id.toString(), creatorId);
        }

        return createdWorkItem;

    }


    /**
     * Update work item
     */
    async updateWorkItem(workItemId, updateData, userId) {
        this.logger.debug('Updating work item', updateData);
        const { comments, ...workItemWithoutComments } = updateData;
        const validatedData = validateData(updateWorkItemSchema, workItemWithoutComments);
        const workItem = await this.findByIdOrThrow(workItemId, "Work item not found");
        const repo = await repoService.findByIdOrThrow(workItem.repo, "Repo not found");
        console.log("workItem.repo",workItem.repo);

        // Check edit permissions
        requireRepoAdmin(userId, repo);

        if (validatedData.assignedTo) {
            requireRepoMember(validatedData.assignedTo, repo);
        }

        // if (workItemWithoutComments.type && workItem.type !== workItemWithoutComments.type) {
        //     throw new AppError('You cannot change the type of a work item', HttpStatusCode.Unauthorized);
        // }

        //Frontend can send position 'bottom' to directly add the work item at bottom of the list
        if(validatedData.position === "bottom") {
            const findQuery = {
                repo:repo.id,
                type: validatedData.type || workItem.type,
                state: validatedData.state || workItem.state,
                isDeleted:false
            };

            if(validatedData.parentId) {
                findQuery.parentId = validatedData.parentId;
            }

            // Find the current LAST item (maximum rank)
            const lastItem = await WorkItem.findOne(findQuery).sort({ stackRank: -1 });

            validatedData.stackRank = lastItem
                ? LexoRank.parse(lastItem.stackRank).genNext().toString()
                : LexoRank.middle().toString()
            delete validatedData.position;
        }

        // Update the updatedBy field
        validatedData.updatedBy = userId;

        Object.assign(workItem, validatedData);
        const updatedWorkItem = await workItem.save();

        // Populate assignedUser virtual for response
        await updatedWorkItem.populate({ path: 'assignedUser', select: 'name userId' });

        this.logger.debug("Comments", comments);

        //If the workItemData has comments then need to create WorkItemComment also
        if (Array.isArray(comments) && comments.length > 0) {
            //Fetch only one comment because we are not creating multiple comments at once
            const commentDetails = comments[0];
            await workItemCommentService.createComment(commentDetails.comment, updatedWorkItem._id.toString(), userId);
        }

        return updatedWorkItem;
    }

    async followWorkItem(workItemId, userId) {
        const workItem = await this.findByIdOrThrow(workItemId);
        const user = await userService.findByIdOrThrow(userId);
        workItem.followedBy.push(userId);
        await workItem.save();
        return workItem;
    }

    async unFollowWorkItem(workItemId, userId) {
        const workItem = await this.findByIdOrThrow(workItemId);
        const user = await userService.findByIdOrThrow(userId);
        workItem.followedBy.pull(userId);
        await workItem.save();
        return workItem;
    }

    async addWorkItemComment(workItemId, userId, commentData) {
        this.logger.debug("Comment data", commentData);

        const validtedData = validateData(createWorkItemCommentSchema, commentData);
        validtedData.workItemId = workItemId;
        validtedData.createdBy = userId;
        const workItem = await this.findById(workItemId, {
            populate: {
                path: "repo",
                select: "members _id roles id",

                populate: {
                    path: "projectId",
                    select: "members _id id"
                },
            }
        });
        const user = await userService.findByIdOrThrow(userId)
        this.logger.debug("Work item", workItem);
        // requireRepoMember(userId, workItem.repo);

        const comment = new WorkItemComment({
            workItem: workItem._id,
            user: user._id,
            comment: commentData.comment,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        await comment.save();
        workItem.comments.push(comment._id);
        await workItem.save();
        return comment;
    }

    /**
     * Get work item by ID with access control
     */
    async getWorkItemById(workItemId, userId = null) {
        const workItem = await WorkItem.findById(workItemId)
            .populate('project', 'title description projectCreatorId members visibility')
            .populate('createdBy', 'name email')

        if (!workItem) {
            throw new NotFoundError('Work item not found');
        }

        return workItem;
    }


    /**
     * Delete work item
     */
    async deleteWorkItem(workItemId, userId) {
        const workItem = await this.findById(workItemId, {
            populate: {
                path: "repo",
                select: "members _id roles id"
            }
        });

        if(!workItem) throw new NotFoundError(this.modelName);

        this.logger.debug("workItem", workItem);

        requireRepoAdmin(userId, workItem.repo);

        workItem.isDeleted = true;
        workItem.deletedAt = new Date();


        await workItem.save();

        await WorkItem.updateMany(
            { parentId: workItem._id },
            { $set:{ parentId: null } }
        )

    }

    /**
     * Get work items by project for Boards
     * Returns parent items with nested children (sub-items)
     * Uses MongoDB aggregation pipeline for efficient single-query approach
     */
    async getWorkItemsForBoard(body, userId = null) {
        // Verify project access
        const project = await projectService.getProjectMemberDetails(body.project);
        const repo = await repoService.getRepoMemberDetails(body.repo);

        requireOrganizationMember(userId, project, repo);

        // Build match stage for filtering
        const matchStage = {
            repo: new mongoose.Types.ObjectId(body.repo),
            isDeleted: false,
        };

        // Add optional filters
        if (body.states?.length > 0) {
            matchStage.state = {$in: body.states};
        }
        if (body.type) {
            matchStage.type = body.type;
        }
        
        if(body.tags?.length > 0 && body.tagOperator) {
            if(body.tagOperator === "or") {
                matchStage.tags={$in: body.tags}
            } else if(body.tagOperator === "and") {
                matchStage.tags = {$all:body.tags}
            }
        }

        if(body.area?.length > 0) {
            matchStage.area={$in: body.area}
        }

        if(body.search) {
            matchStage.$or = [
                { title: { $regex: body.search, $options: 'i' } },
                { description: { $regex: body.search, $options: 'i' } },
                
            ];
        }

        if(body.assignedUsers?.length > 0) {
            const resolvedUsers = body.assignedUsers.map((user) => {
                if(user === "@me") {
                    return new mongoose.Types.ObjectId(userId);
                }
                return new mongoose.Types.ObjectId(user);
            })
            matchStage.assignedTo={$in: resolvedUsers}
        };

        const pipeline = [
            // Match parent items only
            { $match: matchStage },
            { $sort: { stackRank: 1 } },
            // Lookup children (sub-items)
            {
                $lookup: {
                    from: 'workitems',
                    let: { parentId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$parentId', '$$parentId'] },
                                isDeleted: false
                            }
                        },
                        // Lookup assignedUser for children
                        {
                            $lookup: {
                                from: 'users',
                                let: { assignedToId: '$assignedTo' },
                                 pipeline: [
                                    { $match: { $expr: { $and: [
                                        { $eq: ['$userId', '$$assignedToId'] },
                                        { $ne: ['$$assignedToId', null] } // <-- ensure assignedTo is not null
                                    ] } } },
                                    { $project: { name: 1, userId: 1, id:'$_id', _id:0 } }
                                ],
                                as: 'assignedUser'
                            }
                        },
                        { $unwind: { path: '$assignedUser', preserveNullAndEmptyArrays: true } },
                        // Select only needed fields for children
                        {
                            $project: {
                                id: '$_id',
                                number: 1,
                                title: 1,
                                type: 1,
                                state: 1,
                                priority: 1,
                                parentId: 1,
                                assignedUser: 1,
                                stackRank: 1
                            }
                        },
                        { $sort: { stackRank: 1 } }
                    ],
                    as: 'children'
                }
            },

            // Lookup assignedUser for parent
            {
                $lookup: {
                    from: 'users',
                    let: { assignedToId: '$assignedTo' },
                    pipeline: [
                        { $match: { $expr: { $and: [
                            { $eq: ['$userId', '$$assignedToId'] },
                            { $ne: ['$$assignedToId', null] } // <-- ensure assignedTo is not null
                        ] } } },
                        { $project: { name: 1, userId: 1, id:'$_id', _id:0 } }
                    ],
                    as: 'assignedUser'
                }
            },
            { $unwind: { path: '$assignedUser', preserveNullAndEmptyArrays: true } },

            // Project final shape
            {
                $project: {
                    id: '$_id',
                    number: 1,
                    title: 1,
                    type: 1,
                    state: 1,
                    area:1,
                    createdBy:1,
                    updatedBy:1,
                    tags:1,
                    assignedTo:1,
                    priority: 1,
                    assignedUser: 1,
                    children: 1,
                    _id:0,
                    stackRank:1,
                    childrenCount: { $size: '$children' }
                }
            },

            // Sort by stackRank
            { $sort: { stackRank: 1 } }
        ];

        const [workItems,allTags] = await Promise.all([
            WorkItem.aggregate(pipeline),
            // Get all unique tags for this repo (for filter dropdown)
            WorkItem.distinct('tags', {
                repo: new mongoose.Types.ObjectId(body.repo),
                isDeleted: false
            })
        ]);

        return {
            workItems,
            total: workItems.length,
            allTags
        };
    }

    /**
     * Get work items by project for Backlogs
     * Returns parent items with nested children (sub-items)
     * Uses MongoDB aggregation pipeline for efficient single-query approach
     */
    async getWorkItemsForBacklogs(body, userId = null) {
         // Verify project access
        const project = await projectService.getProjectMemberDetails(body.project);
        const repo = await repoService.getRepoMemberDetails(body.repo);

        requireOrganizationMember(userId, project, repo);

        // Build match stage for filtering
        const matchStage = {
            repo: new mongoose.Types.ObjectId(body.repo),
            isDeleted: false,
        };

        const parentMatchStage = {
            repo: new mongoose.Types.ObjectId(body.repo),
            isDeleted:false,
        }

        const childMatchStage = {
            isDeleted: false,
        };

        const stateMatches = [];
        const childStateMatches = [STATES.TODO, STATES.DOING];

        // Add optional filters
        // if (body.state) {
        //     matchStage.state = body.state;
        // }

        if (body.type) {
            parentMatchStage.type = body.type;
        }

        if(body.type === WORKITEMTYPE.EPIC) {
            parentMatchStage.$or = [
                { parentId: { $exists: false } },
                { parentId: null }
            ]
        }

        if(body.states?.length > 0) {
            stateMatches.push(...body.states);
        } else if(body.inProgressItems == "true") {
            stateMatches.push(STATES.TODO,STATES.DOING);
        } else {
            stateMatches.push(STATES.TODO);
        }

        if(body.assignedUsers?.length > 0) {
            const resolvedUsers = body.assignedUsers.map((user) => {
                if(user === "@me") {
                    return new mongoose.Types.ObjectId(userId);
                }
                return new mongoose.Types.ObjectId(user)
            })
            parentMatchStage.assignedTo={$in: resolvedUsers}
        };

        
        if(stateMatches.length > 0) {
            parentMatchStage.state = { $in: stateMatches };
        }

        
        if(body.area.length > 0) {
            parentMatchStage.area = {$in: body.area}
        }

        if(body.tags?.length > 0 && body.tagOperator) {
            if(body.tagOperator === "or") {
                parentMatchStage.tags={$in: body.tags}
            } else if(body.tagOperator === "and") {
                parentMatchStage.tags = {$all:body.tags}
            }
        }

        if(body.completedChildItems == "true") {
            childStateMatches.push(STATES.DONE);
        }

        if(childStateMatches.length > 0) {
            childMatchStage.state = {$in: childStateMatches}
        }
        
       const pipeline = [
        { $match: parentMatchStage },
        
        { $sort: { stackRank: 1 } }, // Sort Top Level

        // LEVEL 2: LOOKUP CHILDREN (e.g. Issues/Features)
        {
            $lookup: {
                from: 'workitems',
                let: { parentId: '$_id' },
                pipeline: [
                    {
                        $match: {
                              $expr: { $eq: ['$parentId', '$$parentId'] },
                              ...childMatchStage
                        }
                    },
                    { $sort: { stackRank: 1 } },
                    
                    // --- NESTED LEVEL 3: LOOKUP GRANDCHILDREN (e.g. Tasks) ---
                    {
                        $lookup: {
                            from: 'workitems',
                            let: { grandParentId: '$_id' },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: { $eq: ['$parentId', '$$grandParentId'] },
                                        ...childMatchStage
                                    }
                                },
                                { $sort: { stackRank: 1 } },
                                {
                                    $project: {
                                        id: '$_id', number: 1, title: 1, type: 1, state: 1, 
                                        priority: 1, parentId: 1, stackRank: 1, tags:1
                                    }
                                }
                            ],
                            as: 'children' // Grandchildren
                        }
                    },
                    // --- END LEVEL 3 ---

                    // Lookup assignedUser for Level 2
                    {
                        $lookup: {
                            from: 'users',
                            let: { assignedToId: '$assignedTo' },
                            pipeline: [
                                { $match: { $expr: { $and: [
                                    { $eq: ['$userId', '$$assignedToId'] },
                                    { $ne: ['$$assignedToId', null] } // <-- ensure assignedTo is not null
                                ] } } },
                                { $project: { name: 1, userId: 1, id:'$_id', _id:0 } }
                            ],
                            as: 'assignedUser'
                        }
                    },
                    { $unwind: { path: '$assignedUser', preserveNullAndEmptyArrays: true } },
                    {
                        $project: {
                            id: '$_id', number: 1, title: 1, type: 1, state: 1, 
                            priority: 1, parentId: 1, stackRank: 1,
                            assignedUser: { name: 1, userId: 1, id: '$assignedUser._id' },
                            children: 1,
                            tags:1,
                            childrenCount: { $size: '$children' }
                        }
                    }
                ],
                as: 'children' // Children
            }
        },

        // Lookup assignedUser for Level 1 (Top Level)
        {
            $lookup: {
                from: 'users',
                let: { assignedToId: '$assignedTo' },
                pipeline: [
                    { $match: { $expr: { $and: [
                        { $eq: ['$userId', '$$assignedToId'] },
                        { $ne: ['$$assignedToId', null] } // <-- ensure assignedTo is not null
                    ] } } },
                    { $project: { name: 1, userId: 1, id:'$_id', _id:0 } }
                ],
                as: 'assignedUser'
            }
        },
        { $unwind: { path: '$assignedUser', preserveNullAndEmptyArrays: true } },

        // Final Projection
        {
            $project: {
                id: '$_id',
                number: 1,
                title: 1,
                type: 1,
                state: 1,
                area: 1,
                priority: 1,
                stackRank: 1,
                tags:1,
                assignedUser: { name: 1, userId: 1, id: '$assignedUser._id' },
                children: 1,
                childrenCount: { $size: '$children' },
                parentId:1,
                _id: 0
            }
        }
    ];

        const [workItems,allTags] = await Promise.all([
            WorkItem.aggregate(pipeline),
            // Get all unique tags for this repo (for filter dropdown)
            WorkItem.distinct('tags', {
                repo: new mongoose.Types.ObjectId(body.repo),
                isDeleted: false
            })
        ]);

        return {
            workItems,
            tags:allTags,
            total: workItems.length
        };
    }

    async reorderWorkItem(body, userId = null) {
      
         // Verify project access
        const project = await projectService.getProjectMemberDetails(body.project);
        const repo = await repoService.getRepoMemberDetails(body.repo);

        requireRepoAdmin(userId, repo);

        let newRank;

        const {nextRank, prevRank, workItemId, parentId, status = "", state = ""} = body;

        // 1. Calculate the New Rank
        if(!prevRank && !nextRank) {
            newRank = LexoRank.middle().toString()
        } else if (!prevRank) {
            // Case: Moved to the very top
            // Generate a rank alphabetically BEFORE the current first item
            newRank = LexoRank.parse(nextRank).genPrev().toString()
        } else if(!nextRank) {
            // Case: Moved to the very bottom
            // Generate a rank alphabetically AFTER the current last item
            newRank = LexoRank.parse(prevRank).genNext().toString()
        } else if (prevRank === nextRank) {
            /** 
                 * FIX: Handle identical ranks. 
                 * If the ranks are the same, we cannot find a value "between" them.
                 * We fall back to generating a rank immediately after the prevRank.
             */
            newRank = LexoRank.parse(prevRank).genNext().toString();
        } else {
            // Case: Moved between two items
            // Calculate a string that is alphabetically between the two
            const p = LexoRank.parse(prevRank);
            const n = LexoRank.parse(nextRank);

            // Defensive: ensure we call between on the lower value
            if (p.compareTo(n) < 0) {
                newRank = p.between(n).toString();
            } else {
                newRank = n.between(p).toString();
            }
        }

        const updateFields = { stackRank: newRank };

        if(parentId !== undefined) {
            updateFields.parentId = parentId;
        }

        if(status) {
            updateFields.status = status;
        }

        if(state) {
            updateFields.state = state;
        }

        return await this.update(workItemId, updateFields);


    }

    /**
     * Get work items by project
     */
    async getWorkItems(body, userId = null) {
        // Verify project access
        const project = await projectService.getProjectMemberDetails(body.project);
        const repo = await repoService.getRepoMemberDetails(body.repo);

        requireOrganizationMember(userId, project, repo);

        // Run both queries in parallel for better performance
        const [workItemsResult, allTags] = await Promise.all([
            // Get work items with filters
            this.findWithFilters(
                body,
                workItemFilterConfig,
                workItemListSchema,
                {
                    userId, // Pass userId as context for status filter handling
                    populate: [{
                        path: 'commentsCount'
                    }, {
                        path: 'assignedUser',
                        select: 'name userId'
                    }],
                    select: "id number title type state priority area createdBy updatedAt tags assignedTo",
                }
            ),
            // Get all unique tags for this repo (for filter dropdown)
            WorkItem.distinct('tags', {
                repo: body.repo,
                isDeleted: false
            })
        ]);

        // Add allTags to the response
        return {
            ...workItemsResult,
            allTags: allTags.filter(tag => tag) // Filter out null/empty tags
        };
    }

    /**
     * Get work items assigned to user
     */
    async getAssignedWorkItems(userId, filters = {}) {
        const validatedFilters = workItemFilterSchema.parse(filters);

        const query = {
            $or: [{ assignedTo: userId }, { assignee: userId }],
            isArchived: false
        };

        if (validatedFilters.status) query.status = validatedFilters.status;
        if (validatedFilters.type) query.type = validatedFilters.type;
        if (validatedFilters.priority) query.priority = validatedFilters.priority;

        const { page = 1, limit = 50, sortBy = 'lastActivityAt', sortOrder = 'desc' } = validatedFilters;
        const skip = (page - 1) * limit;
        const sortQuery = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

        const [workItems, total] = await Promise.all([
            WorkItem.find(query)
                .populate('project', 'title description')
                .populate('createdBy', 'name email')
                .sort(sortQuery)
                .skip(skip)
                .limit(limit),
            WorkItem.countDocuments(query)
        ]);

        return {
            workItems,
            pagination: {
                current: page,
                total: Math.ceil(total / limit),
                count: workItems.length,
                totalItems: total
            }
        };
    }

    /**
     * Assign work item to user
     */
    async assignWorkItem(workItemId, assignmentData, userId) {
        const validatedData = workItemAssignmentSchema.parse(assignmentData);
        const workItem = await this.getWorkItemById(workItemId, userId);

        if (!this.canUserEditWorkItem(workItem, userId)) {
            throw new UnauthorizedError('You do not have permission to assign this work item');
        }

        // Verify assignee exists if provided
        if (validatedData.assignedTo) {
            const assignee = await User.findById(validatedData.assignedTo);
            if (!assignee) {
                throw new NotFoundError('Assignee not found');
            }
        }

        await workItem.assign(validatedData.assignedTo);
        return await this.getWorkItemById(workItem._id, userId);
    }


    /**
     * Update work item status
     */
    async updateWorkItemStatus(workItemId, statusData, userId) {
        const validatedData = workItemStatusSchema.parse(statusData);
        const workItem = await this.getWorkItemById(workItemId, userId);

        if (!this.canUserEditWorkItem(workItem, userId)) {
            throw new UnauthorizedError('You do not have permission to update this work item status');
        }

        await workItem.updateStatus(validatedData.status, validatedData.state);
        return await this.getWorkItemById(workItem._id, userId);
    }

    /**
     * Add pull request to work item
     */
    async addPullRequest(workItemId, pullRequestData, userId) {
        const validatedData = workItemPullRequestSchema.parse(pullRequestData);
        const workItem = await this.getWorkItemById(workItemId, userId);

        if (!this.canUserEditWorkItem(workItem, userId)) {
            throw new UnauthorizedError('You do not have permission to add pull request to this work item');
        }

        await workItem.addPullRequest(validatedData);
        return await this.getWorkItemById(workItem._id, userId);
    }

    /**
     * Block/unblock work item
     */
    async toggleWorkItemBlock(workItemId, blockData, userId) {
        const workItem = await this.getWorkItemById(workItemId, userId);

        if (!this.canUserEditWorkItem(workItem, userId)) {
            throw new UnauthorizedError('You do not have permission to block/unblock this work item');
        }

        if (blockData.block) {
            await workItem.block(blockData.reason || 'Blocked by user');
        } else {
            await workItem.unblock();
        }

        return await this.getWorkItemById(workItem._id, userId);
    }

    /**
     * Archive/unarchive work item
     */
    async toggleWorkItemArchive(workItemId, userId) {
        const workItem = await this.getWorkItemById(workItemId, userId);

        if (!this.canUserDeleteWorkItem(workItem, userId)) {
            throw new UnauthorizedError('You do not have permission to archive this work item');
        }

        if (workItem.isArchived) {
            await workItem.unarchive();
        } else {
            await workItem.archive();
        }

        return await this.getWorkItemById(workItem._id, userId);
    }

    /**
     * Get work item statistics
     */
    async getWorkItemStats(projectId = null, userId = null) {
        if (projectId) {
            const project = await Project.findById(projectId);
            if (!project) {
                throw new NotFoundError('Project not found');
            }
            if (userId && !this.canUserAccessProject(project, userId)) {
                throw new UnauthorizedError('You do not have permission to access this project');
            }
        }

        const stats = await WorkItem.getWorkItemStats(projectId);
        return stats[0] || {
            total: 0,
            byStatus: [],
            byType: [],
            byPriority: [],
            overdue: 0,
            blocked: 0
        };
    }

    /**
     * Search work items
     */
    async searchWorkItems(searchTerm, filters = {}, userId = null) {
        const validatedFilters = workItemFilterSchema.parse(filters);

        let accessibleProjects = [];
        if (userId) {
            // Get projects user has access to
            accessibleProjects = await Project.find({
                $or: [
                    { projectCreatorId: userId },
                    { members: userId },
                    { visibility: 'public' }
                ]
            }).select('_id');
            accessibleProjects = accessibleProjects.map(p => p._id);
        }

        const query = {
            $and: [
                {
                    $or: [
                        { title: { $regex: searchTerm, $options: 'i' } },
                        { description: { $regex: searchTerm, $options: 'i' } },
                        { tags: { $in: [new RegExp(searchTerm, 'i')] } },
                        { labels: { $in: [new RegExp(searchTerm, 'i')] } }
                    ]
                },
                { isArchived: false }
            ]
        };

        // Add project access filter if user is provided
        if (userId && accessibleProjects.length > 0) {
            query.$and.push({ project: { $in: accessibleProjects } });
        }

        // Add additional filters
        if (validatedFilters.status) query.$and.push({ status: validatedFilters.status });
        if (validatedFilters.type) query.$and.push({ type: validatedFilters.type });
        if (validatedFilters.priority) query.$and.push({ priority: validatedFilters.priority });

        const { page = 1, limit = 50, sortBy = 'lastActivityAt', sortOrder = 'desc' } = validatedFilters;
        const skip = (page - 1) * limit;
        const sortQuery = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

        const [workItems, total] = await Promise.all([
            WorkItem.find(query)
                .populate('project', 'title description')
                .populate('createdBy', 'name email')
                .populate('assignedTo', 'name email')
                .sort(sortQuery)
                .skip(skip)
                .limit(limit),
            WorkItem.countDocuments(query)
        ]);

        return {
            workItems,
            pagination: {
                current: page,
                total: Math.ceil(total / limit),
                count: workItems.length,
                totalItems: total
            }
        };
    }

    /**
     * Get overdue work items
     */
    async getOverdueWorkItems(userId = null) {
        let query = {
            dueDate: { $lt: new Date() },
            status: { $nin: ['completed', 'resolved'] },
            isArchived: false
        };

        if (userId) {
            // Filter by accessible projects
            const accessibleProjects = await Project.find({
                $or: [
                    { projectCreatorId: userId },
                    { members: userId },
                    { visibility: 'public' }
                ]
            }).select('_id');

            if (accessibleProjects.length > 0) {
                query.project = { $in: accessibleProjects.map(p => p._id) };
            } else {
                return []; // No accessible projects
            }
        }

        return await WorkItem.find(query)
            .populate('project', 'title description')
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email')
            .sort({ dueDate: 1 });
    }

    /**
     * Get blocked work items
     */
    async getBlockedWorkItems(userId = null) {
        let query = { isBlocked: true, isArchived: false };

        if (userId) {
            // Filter by accessible projects
            const accessibleProjects = await Project.find({
                $or: [
                    { projectCreatorId: userId },
                    { members: userId },
                    { visibility: 'public' }
                ]
            }).select('_id');

            if (accessibleProjects.length > 0) {
                query.project = { $in: accessibleProjects.map(p => p._id) };
            } else {
                return []; // No accessible projects
            }
        }

        return await WorkItem.find(query)
            .populate('project', 'title description')
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email')
            .sort({ lastActivityAt: -1 });
    }

    // Permission helper methods
    canUserAccessProject(project, userId) {
        if (!userId) return project.visibility === 'public';
        return project.projectCreatorId === userId ||
            (project.members && project.members.includes(userId)) ||
            project.visibility === 'public';
    }

    canUserEditWorkItem(repoDetails, userId) {
        if (!userId) return false;
        return Object.values(repoDetails.roles).includes(userId);

    }

    canUserAccessWorkItem(workItem, userId) {
        if (!userId) return false;
        return this.canUserAccessProject(workItem.project, userId);
    }

    //   canUserEditWorkItem(workItem, userId) {
    //     if (!userId) return false;
    //     // Creator, assignee, or project owner/member can edit
    //     return workItem.createdBy === userId ||
    //            workItem.assignedTo === userId ||
    //            workItem.assignee === userId ||
    //            workItem.project.projectCreatorId === userId ||
    //            (workItem.project.members && workItem.project.members.includes(userId));
    //   }

    canUserDeleteWorkItem(workItem, userId) {
        if (!userId) return false;
        // Only creator or project owner can delete
        return workItem.createdBy === userId ||
            workItem.project.projectCreatorId === userId;
    }

    async changeWorkItemsAssignedTo(oldUserId, newUserId) {
        if (!oldUserId || !newUserId) return;
        return await WorkItem.updateMany({ assignedTo: oldUserId }, { $set: { assignedTo: newUserId } });
    }
}

export default new WorkItemService();
