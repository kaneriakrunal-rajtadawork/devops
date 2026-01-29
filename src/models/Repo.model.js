import { ROLE_MEMBERS } from '@/constants/common.constants';
import mongoose, { mongo } from 'mongoose';

const repoSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Repository name is required'],
        trim: true,
        maxLength: [255, 'Repository name cannot exceed 255 characters'],
        index: true
    },
    description: {
        type: String,
        trim: true,
        maxLength: [500, 'Description cannot exceed 500 characters']
    },
    githubRepoId: {
        type: Number,
        required: [true, 'GitHub Repository ID is required'],
        unique: true,
        index: true
    },
    githubTeamId: {
        type: Number
    },
    githubTeamSlug: {
        type: String
    },
    defaultBranch: {
        type: String,
        default: 'main',
        trim: true
    },
    isPrivate: {
        type: Boolean,
        default: true,
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Project ID is required'],
        index: true,
        ref: "Project"
    },
    createdFromEMS: {
        type: Boolean,
        default: false,
        index: true
    },
    repoCreatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    // GitHub repository details
    url: {
        type: String,
        trim: true
    },
    clone_url: {
        type: String,
        trim: true
    },
    ssh_url: {
        type: String,
        trim: true
    },
    html_url: {
        type: String,
        trim: true
    },

    // Additional metadata
    lastSyncAt: {
        type: Date,
        default: null
    },
    syncStatus: {
        type: String,
        enum: ['pending', 'synced', 'error'],
        default: 'pending'
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    roles: {
        scrumMaster: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        departmentLead: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for performance
repoSchema.index({ projectId: 1, createdFromEMS: 1 });
repoSchema.index({ githubRepoId: 1, projectId: 1 });
repoSchema.index({ name: 1, projectId: 1 });

// Virtual for project relationship
repoSchema.virtual('project', {
    ref: 'Project',
    localField: 'projectId',
    foreignField: '_id',
    justOne: true
});

// Pre-save middleware
repoSchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.name = this.name.trim();
    }
    if (this.isModified('description') && this.description) {
        this.description = this.description.trim();
    }
    next();
});

// Instance methods
repoSchema.methods.updateSyncStatus = function (status) {
    this.syncStatus = status;
    this.lastSyncAt = new Date();
    return this.save();
};

repoSchema.methods.isStale = function (hours = 24) {
    if (!this.lastSyncAt) return true;
    const staleTime = new Date(Date.now() - (hours * 60 * 60 * 1000));
    return this.lastSyncAt < staleTime;
};

repoSchema.methods.hasMember = function (userId) {
    const userIdString = userId?.toString();
    const repoCreatorString = this.repoCreatorId?.toString();
    const memberIds = this.members?.map(id => id?.toString()) || [];
    return userIdString === repoCreatorString || memberIds.includes(userIdString);
}

//Update Repository Member
repoSchema.methods.updateMember = function (oldUserId, newUserId) {
    const oldUserIdString = oldUserId?.toString();
    const memberIds = this.members?.map(id => id?.toString()) || [];
    const oldRepoCreatorIdString = this.repoCreatorId?.toString();

    // If the old user is the repo creator, update the creator ID
    if (oldUserIdString === oldRepoCreatorIdString) {
        this.repoCreatorId = newUserId;
    } else {
        const memberIndex = memberIds.indexOf(oldUserIdString);
        if (memberIndex > -1) {
            this.members[memberIndex] = newUserId;
            this.lastActivityAt = new Date();
        }
    }

    return this.save();
};

//Update Repository role member (Scrum Master or lead)
repoSchema.methods.updateRoleMember = function (newUserId, role) {
    const userIdString = newUserId?.toString();
    if (role === ROLE_MEMBERS.SCRUM_MASTER) {
        this.roles.scrumMaster = userIdString;
    } else if (role === ROLE_MEMBERS.DEPARTMENT_LEAD) {
        this.roles.departmentLead = userIdString;
    }

    return this.save();
}

repoSchema.methods.canUserEdit = function (userId) {
    return this.hasMember(userId);
}

repoSchema.methods.addMember = function (userId) {
    const userIdString = userId?.toString();
    const memberIds = this.members?.map(id => id?.toString()) || [];
    if (!memberIds.includes(userIdString)) {
        this.members.push(userId);
    }
    return this.save();
};


repoSchema.methods.removeMember = function (userId) {
    const userIdString = userId?.toString();
    this.members = this.members.filter(id => id?.toString() !== userIdString);
    return this.save();
};

// Static methods
repoSchema.statics.findByProject = function (projectId) {
    return this.find({ projectId });
};

repoSchema.statics.findByGithubId = function (githubRepoId) {
    return this.findOne({ githubRepoId: githubRepoId });
};

repoSchema.statics.findEMSRepos = function () {
    return this.find({ createdFromEMS: true });
};

const Repo = mongoose.models.Repo || mongoose.model('Repo', repoSchema);
export default Repo;
