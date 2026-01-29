import mongoose from 'mongoose';
import { LexoRank } from 'lexorank';

const workItemSchema = new mongoose.Schema({
    // --- CORE IDENTITY ---
    number: {
        type: Number,
        required: true,
    },
    title: {
        type: String,
        required: [true, 'Work item title is required'],
        trim: true,
        maxLength: [200, 'Title cannot be more than 200 characters'],
        index: true
    },
    type: {
        type: String,
        enum: {
            values: ['Task', 'Epic', 'Issue'],
            message: 'Invalid work item type'
        },
        required: [true, 'Work item type is required'],
        index: true
    },
    description: {
        type: String,
        trim: true,
        maxLength: [50000, 'Description cannot exceed 50000 characters']
    },

    // --- WORKFLOW & STATE ---

    state: {
        type: String,
        enum: {
            values: ['To Do', 'Doing', 'Done'],
            message: 'Invalid state'
        },
        default: 'To Do',
        index: true
    },

    reason: {
        type: String,
        enum: {
            values: ['Added To Backlog', 'Started', 'Completed', 'Cut', 'Deferred', 'Obsolete'],
            message: 'Invalid reason'
        },
        default: 'Added To Backlog'
    },

    // --- PEOPLE ---
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Creator ID is required'],
        index: true,
        ref: 'User'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Updated By ID is required'],
        index: true,
        ref: 'User'
    },
    followedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    // --- LOCATION & HIERARCHY ---

    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: [true, 'Project is required'],
    },
    repo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Repo",
        required: [true, "Repo is required"],
        index: true
    },
    area: {
        type: String,
        trim: true,
        maxLength: [100, 'Area cannot exceed 100 characters'],
        index: true
    },
    iteration: {
        type: String,
        trim: true,
        maxLength: [100, 'Iteration cannot exceed 100 characters'],
        index: true
    },

    // CRITICAL FOR ADO HIERARCHY (Epic -> Feature -> Story -> Task)
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WorkItem',
        default: null,
        index: true
    },




    // PLANNING
    startDate: {
        type: Date,
        validate: {
            validator: function (value) {
                return !this.targetDate || !value || value <= this.targetDate;
            },
            message: 'Start date must be before target date'
        }
    },
    targetDate: {
        type: Date,
        validate: {
            validator: function (value) {
                return !this.startDate || !value || value >= this.startDate;
            },
            message: 'Target date must be after start date'
        }
    },
    priority: {
        type: Number,
        enum: {
            values: [1, 2, 3, 4],
            message: 'Priority must be 1 (urgent), 2 (high), 3 (medium), or 4 (low)'
        },
        default: 2,
        index: true
    },

    activity: {
        type: String,
        trim: true,
        maxLength: [1000, 'Activity cannot exceed 1000 characters']
    },
    remainingWork: {
        type: Number,
    },
    effort: {
        type: Number,
    },




    dueDate: {
        type: Date,
    },
    tags: [{
        type: String,
        trim: true,
        maxLength: [50, 'Tag cannot exceed 50 characters']
    }],


    labels: [{
        type: String,
        trim: true,
        maxLength: [50, 'Label cannot exceed 50 characters']
    }],


    stackRank: {
        type: String,
        required: true,
        index: true
    },

    severity: {
        type: Number,
        enum: {
            values: [1, 2, 3],
            message: 'Invalid severity level'
        },
        default: 2,
        index: true
    },

    isDeleted: {
        type: Boolean,
        default: false,
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    },
    toObject: { virtuals: true }
});


// Additional Code Commented Out.
/*
    // originalEstimate: {
    //     type: Number,
    //     min: [0, 'Original estimate cannot be negative']
    // },
    // completed: {
    //     type: Number,
    //     min: [0, 'Completed time cannot be negative']
    // },

    // Additional metadata
    // isBlocked: {
    //     type: Boolean,
    //     default: false,
    //     index: true
    // },
    // blockedReason: {
    //     type: String,
    //     trim: true,
    //     maxLength: [500, 'Blocked reason cannot exceed 500 characters']
    // },
    // lastActivityAt: {
    //     type: Date,
    //     default: Date.now,
    //     index: true
    // },
        // IntegrityBuild: {
    //     type: String,
    //     trim: true,
    //     maxLength: [200, 'Integrity build cannot exceed 200 characters']
    // },
    // storyPoints: {
    //     type: Number,
    //     min: [0, 'Story points cannot be negative'],
    //     max: [100, 'Story points cannot exceed 100']
    // },
    // pullRequest: {
    //     url: {
    //         type: String,
    //         trim: true,
    //         validate: {
    //             validator: function (url) {
    //                 if (!url) return true;
    //                 const urlPattern = /^https?:\/\/.+/;
    //                 return urlPattern.test(url);
    //             },
    //             message: 'Pull request URL must be a valid HTTP/HTTPS URL'
    //         }
    //     },
    //     status: {
    //         type: String,
    //         enum: {
    //             values: ['open', 'merged', 'closed'],
    //             message: 'Invalid pull request status'
    //         }
    //     },
    //     number: {
    //         type: Number,
    //         min: [1, 'Pull request number must be positive']
    //     }
    // },
        // businessValue: {
    //     type: Number,
    //     min: [0, 'Business value cannot be negative'],
    //     max: [1000, 'Business value cannot exceed 1000']
    // },
    //   timeCriticality: {
    //     type: Number,
    //     min: [0, 'Time criticality cannot be negative'],
    //     max: [1000, 'Time criticality cannot exceed 1000']
    //   },
        //   status: {
    //     type: String,
    //     enum: {
    //       values: ['todo', 'in-progress', 'review', 'doing', 'completed', 'active', 'new', 'resolved'],
    //       message: 'Invalid status'
    //     },
    //     default: 'todo',
    //     index: true
    //   },


    // risk: {
    //     type: Number,
    //     enum: {
    //         values: [1, 2, 3],
    //         message: 'Risk must be 1 (High), 2 (Medium), or 3 (Low)'
    //     },
    //     default: 2,
    //     index: true
    // },






*/
// Compound indexes for performance
// workItemSchema.index({ project: 1, status: 1 });
// workItemSchema.index({ createdBy: 1, status: 1 });
// workItemSchema.index({ type: 1, status: 1 });
// workItemSchema.index({ priority: 1, status: 1 });
// workItemSchema.index({ area: 1, iteration: 1 });
// workItemSchema.index({ tags: 1, status: 1 });
// workItemSchema.index({ labels: 1, status: 1 });
// workItemSchema.index({ dueDate: 1, status: 1 });
// workItemSchema.index({ title: 'text', description: 'text' });
// workItemSchema.index({ createdAt: -1 });

// Virtual for progress percentage
// workItemSchema.virtual('progressPercentage').get(function () {
//     if (!this.originalEstimate) return null;
//     if (this.originalEstimate === 0) return 100;
//     const progress = ((this.originalEstimate - (this.remaining || 0)) / this.originalEstimate) * 100;
//     return Math.max(0, Math.min(100, Math.round(progress)));
// });

// Virtual for time tracking
// workItemSchema.virtual('timeSpent').get(function () {
//     return this.completed || 0;
// });

// Virtual for overdue status
// workItemSchema.virtual('isOverdue').get(function () {
//     if (!this.dueDate || this.status === 'completed' || this.status === 'resolved') return false;
//     return new Date() > this.dueDate;
// });

// // Virtual for days until due
// workItemSchema.virtual('daysUntilDue').get(function () {
//     if (!this.dueDate) return null;
//     const diff = this.dueDate - new Date();
//     return Math.ceil(diff / (1000 * 60 * 60 * 24));
// });

// Virtual for health status
// workItemSchema.virtual('healthStatus').get(function () {
//     if (this.status === 'completed' || this.status === 'resolved') return 'completed';
//     if (this.isBlocked) return 'blocked';
//     if (this.isOverdue) return 'overdue';

//     const daysUntilDue = this.daysUntilDue;
//     if (daysUntilDue === null) return 'no-deadline';
//     if (daysUntilDue < 0) return 'overdue';
//     if (daysUntilDue <= 1) return 'critical';
//     if (daysUntilDue <= 7) return 'warning';
//     return 'healthy';
// });

workItemSchema.virtual('comments', {
    ref: 'WorkItemComment',
    localField: '_id',
    foreignField: 'workItemId',
    justOne: false
});

workItemSchema.virtual('commentsCount', {
    ref: 'WorkItemComment',
    localField: '_id',
    foreignField: 'workItemId',
    count: true
});

workItemSchema.virtual('assignedUser', {
    ref: "User",
    localField: 'assignedTo',
    foreignField: 'userId',
    justOne: true
})

// Pre-VALIDATE middleware (runs BEFORE validation)
workItemSchema.pre('validate', async function (next) {

    // Auto-generate work item number if not provided
    if (!this.number && this.isNew) {
        const lastWorkItem = await this.constructor.findOne({ repo: this.repo })
            .sort({ number: -1 });
        this.number = lastWorkItem ? lastWorkItem.number + 1 : 1;
    }

    if (this.isNew && !this.stackRank) {
        try {
            // Retrieve the position preference (default to bottom)
            const position = this._position || 'bottom';

            // Find the item currently at the BOTTOM of the backlog for this repo
            // We only compare against items of the SAME TYPE (e.g., Epic vs Epic)
            if (position === 'top') {
                const firstItem = await this.constructor.findOne({
                    repo: this.repo,
                    project: this.project,
                    type: this.type,
                    parentId: this.parentId
                }).sort({ stackRank: 1 });

                this.stackRank = firstItem
                    ? LexoRank.parse(firstItem.stackRank).genPrev().toString()
                    : LexoRank.middle().toString()
            } else {
                // Find the current LAST item (maximum rank)
                const lastItem = await this.constructor.findOne({
                    repo: this.repo,
                    project: this.project,
                    type: this.type,
                    parentId: this.parentId
                }).sort({ stackRank: -1 });

                this.stackRank = lastItem
                    ? LexoRank.parse(lastItem.stackRank).genNext().toString()
                    : LexoRank.middle().toString()
            }

        } catch (error) {
            return next(error)
        }
    }

    next();
});

// Pre-save middleware
workItemSchema.pre('save', async function (next) {
    // Update last activity
    this.lastActivityAt = new Date();

    // Clean and validate arrays
    if (this.tags) {
        this.tags = [...new Set(this.tags.filter(tag => tag && tag.trim()))];
    }
    if (this.labels) {
        this.labels = [...new Set(this.labels.filter(label => label && label.trim()))];
    }

    // Ensure assignee and assignedTo are consistent
    // if (this.assignedTo && !this.assignee) {
    //     this.assignee = this.assignedTo;
    // }

    next();
});

// Instance methods
workItemSchema.methods.assign = function (userId) {
    this.assignedTo = userId;
    this.assignee = userId;
    this.lastActivityAt = new Date();
    return this.save();
};

workItemSchema.methods.unassign = function () {
    this.assignedTo = null;
    this.assignee = null;
    this.lastActivityAt = new Date();
    return this.save();
};

workItemSchema.methods.changeWorkItemsAssignedTo = async function (oldUserId, newUserId) {
    this.updateMany({ assignedTo: oldUserId }, { assignedTo: newUserId });
    return this;
}

workItemSchema.methods.updateStatus = function (status, state = null) {
    this.status = status;
    if (state) this.state = state;
    this.lastActivityAt = new Date();

    // Auto-update reason based on status
    if (status === 'completed' || status === 'resolved') {
        this.reason = 'Completed';
    }

    return this.save();
};

workItemSchema.methods.block = function (reason) {
    this.isBlocked = true;
    this.blockedReason = reason;
    this.lastActivityAt = new Date();
    return this.save();
};

workItemSchema.methods.unblock = function () {
    this.isBlocked = false;
    this.blockedReason = null;
    this.lastActivityAt = new Date();
    return this.save();
};

workItemSchema.methods.updateTimeTracking = function (timeData) {
    if (timeData.originalEstimate !== undefined) this.originalEstimate = timeData.originalEstimate;
    if (timeData.remaining !== undefined) this.remaining = timeData.remaining;
    if (timeData.completed !== undefined) this.completed = timeData.completed;
    this.lastActivityAt = new Date();
    return this.save();
};

workItemSchema.methods.archive = function () {
    this.isArchived = true;
    this.archivedAt = new Date();
    return this.save();
};

workItemSchema.methods.unarchive = function () {
    this.isArchived = false;
    this.archivedAt = null;
    return this.save();
};

workItemSchema.methods.addPullRequest = function (prData) {
    this.pullRequest = {
        url: prData.url,
        status: prData.status,
        number: prData.number
    };
    this.lastActivityAt = new Date();
    return this.save();
};

workItemSchema.methods.canUserEdit = function (userId) {
    return this.createdBy === userId || this.assignedTo === userId;
};

// Static methods
workItemSchema.statics.findByProject = function (projectId) {
    return this.find({ project: projectId, isArchived: false });
};

workItemSchema.statics.findByAssignee = function (userId) {
    return this.find({
        $or: [{ assignedTo: userId }, { assignee: userId }],
        isArchived: false
    });
};

workItemSchema.statics.findByCreator = function (userId) {
    return this.find({ createdBy: userId, isArchived: false });
};

workItemSchema.statics.findByStatus = function (status) {
    return this.find({ status, isArchived: false });
};

workItemSchema.statics.findByType = function (type) {
    return this.find({ type, isArchived: false });
};

workItemSchema.statics.findOverdue = function () {
    return this.find({
        dueDate: { $lt: new Date() },
        status: { $nin: ['completed', 'resolved'] },
        isArchived: false
    });
};

workItemSchema.statics.findBlocked = function () {
    return this.find({ isBlocked: true, isArchived: false });
};

workItemSchema.statics.searchWorkItems = function (searchTerm, filters = {}) {
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
            { isArchived: false },
            ...Object.entries(filters).map(([key, value]) => ({ [key]: value }))
        ]
    };

    return this.find(query);
};

workItemSchema.statics.getWorkItemStats = function (projectId = null) {
    const matchStage = projectId ? { project: mongoose.Types.ObjectId(projectId) } : {};

    return this.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                byStatus: {
                    $push: {
                        status: '$status',
                        count: { $sum: 1 }
                    }
                },
                byType: {
                    $push: {
                        type: '$type',
                        count: { $sum: 1 }
                    }
                },
                byPriority: {
                    $push: {
                        priority: '$priority',
                        count: { $sum: 1 }
                    }
                },
                overdue: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $lt: ['$dueDate', new Date()] },
                                    { $not: { $in: ['$status', ['completed', 'resolved']] } }
                                ]
                            },
                            1,
                            0
                        ]
                    }
                },
                blocked: {
                    $sum: { $cond: ['$isBlocked', 1, 0] }
                }
            }
        }
    ]);
};

/**
 * Helper function to add $or conditions to a query.
 * If an $or already exists, it wraps both in an $and.
 * This prevents overwrites when multiple filters use $or.
 */
const addOrCondition = (query, orCondition) => {
    if (query.$or) {
        // Already have an $or, need to combine them with $and
        const existingOr = query.$or;
        delete query.$or;

        if (!query.$and) {
            query.$and = [];
        }
        query.$and.push({ $or: existingOr });
        query.$and.push({ $or: orCondition });
    } else {
        query.$or = orCondition;
    }
};

export const workItemFilterConfig = {
    project: (v, q) => q.project = v,
    repo: (v, q) => q.repo = v,
    type: (v, q) => {
        if (Array.isArray(v) && v.length > 0) {
            q.type = { $in: v };
        }
    },
    priority: (v, q) => q.priority = v,
    assignedTo: (v, q) => q.assignedTo = v,
    isBlocked: (v, q) => q.isBlocked = v,
    isDeleted: (v, q) => q.isDeleted = v,
    state: (v, q) => {
        if (Array.isArray(v) && v.length > 0) {
            q.state = { $in: v };
        }
    },

    tags: (v, q) => {
        // v is now an object: { tags: string[], operator: 'and' | 'or' }
        const { tags, operator = 'or' } = v || {};
        if (Array.isArray(tags) && tags.length > 0) {
            if (operator === 'and') {
                // $all - work item must have ALL selected tags
                q.tags = { $all: tags };
            } else {
                // $in - work item must have ANY of the selected tags
                q.tags = { $in: tags };
            }
        }
    },
    area: (v, q) => {
        if (Array.isArray(v) && v.length > 0) {
            q.area = { $in: v };
        }
    },
    labels: (v, q) => {
        if (Array.isArray(v) && v.length > 0) {
            q.labels = { $in: v };
        }
    },

    // Special status filter - this is a query TYPE, not a direct field match
    // These require userId context to be set in the filter before calling findWithFilters
    status: (v, q, context = {}) => {
        const { userId } = context;
        switch (v) {
            case 'assignedToMe':
                if (userId) q.assignedTo = userId;
                break;
            case 'following':
                if (userId) q.followedBy = userId;
                break;
            case 'myActivity':
                if (userId) {
                    addOrCondition(q, [
                        { createdBy: userId },
                        { assignedTo: userId },
                        { updatedBy: userId }
                    ]);
                }
                break;
            case 'recentlyUpdated':
                q.updatedAt = { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }; // Last 7 days
                break;
            case 'recentlyCompleted':
                q.state = 'Done';
                q.updatedAt = { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
                break;
            case 'recentlyCreated':
                q.createdAt = { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
                break;
            // 'mentioned' would require additional implementation with a mentions field
            default:
                // Unknown status type - ignore
                break;
        }
    },

    dateRange: (range, q) => {
        const { startDate, endDate } = range;
        q.createdAt = {};
        if (startDate) q.createdAt.$gte = new Date(startDate);
        if (endDate) q.createdAt.$lte = new Date(endDate);
    },

    search: (value, q) => {
        const regex = new RegExp(value, "i");
        addOrCondition(q, [
            { title: { $regex: regex } },
            { tags: { $in: [regex] } },
            { labels: { $in: [regex] } },
            { state: { $regex: regex } },
            { area: { $regex: regex } },
        ]);
    },

    assignedUsers: (v, q, context = {}) => {
        const { userId } = context;
        if (Array.isArray(v) && v.length > 0) {
            // Filter for work items assigned to any of the selected users
            // assignedTo field stores the userId
            const resolvedUsers = v.map(u => u === "@me" ? userId : u);
            q.assignedTo = { $in: resolvedUsers };
        }
    }
};


export default mongoose.models.WorkItem || mongoose.model('WorkItem', workItemSchema); 