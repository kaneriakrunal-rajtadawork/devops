import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxLength: [100, 'Title cannot be more than 100 characters'],
    index: true
  },
  description: {
    type: String,
    trim: true,
    maxLength: [2000, 'Description cannot exceed 2000 characters']
  },
  projectCreatorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Project creator ID is required'],
    index: true
  },
  favourite: {
    type: Boolean,
    default: false,
    index: true
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'completed', 'on-hold'],
      message: 'Status must be active, completed, or on-hold'
    },
    default: 'active',
    index: true
  },
  startDate: {
    type: Date,
    validate: {
      validator: function(value) {
        return !this.endDate || !value || value <= this.endDate;
      },
      message: 'Start date must be before end date'
    }
  },
  endDate: {
    type: Date,
    validate: {
      validator: function(value) {
        return !this.startDate || !value || value >= this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  assignedRepos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Repo',
    default: []
  }],
  about: {
    type: String,
    enum: {
      values: ['readme', 'wiki'],
      message: 'About must be either readme or wiki'
    },
    default: 'readme'
  },
  tags: {
    type: [String],
    default: [],
    validate: {
      validator: function(tags) {
        return tags.length <= 10;
      },
      message: 'Maximum 10 tags allowed'
    },
    index: true
  },
  liveUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(url) {
        if (!url) return true;
        const urlPattern = /^https?:\/\/.+/;
        return urlPattern.test(url);
      },
      message: 'Live URL must be a valid HTTP/HTTPS URL'
    }
  },
  images: [{
    type: String,
    trim: true,
    validate: {
      validator: function(url) {
        const urlPattern = /^https?:\/\/.+/;
        return urlPattern.test(url);
      },
      message: 'Image URL must be a valid HTTP/HTTPS URL'
    }
  }],
  featured: {
    type: Boolean,
    default: false,
    index: true
  },
  technologies: [{
    type: String,
    trim: true,
    maxLength: [50, 'Technology name cannot exceed 50 characters']
  }],
  members: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: [],
    index: true
  }],
  likes: [{ 
    type: String, 
    ref: 'User', 
    default: [],
    index: true
  }],
  createdFromEMS: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // Additional metadata
  visibility: {
    type: String,
    enum: ['public', 'private', 'team'],
    default: 'private',
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  },
  progress: {
    type: Number,
    min: [0, 'Progress cannot be negative'],
    max: [100, 'Progress cannot exceed 100%'],
    default: 0
  },
  lastActivityAt: {
    type: Date,
    default: Date.now
  },
  
  // Archived projects
  isArchived: {
    type: Boolean,
    default: false,
    index: true
  },
  archivedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Compound indexes for performance
projectSchema.index({ projectCreatorId: 1, status: 1 });
projectSchema.index({ createdFromEMS: 1, status: 1 });
projectSchema.index({ featured: 1, status: 1 });
projectSchema.index({ members: 1, status: 1 });
projectSchema.index({ technologies: 1, status: 1 });
projectSchema.index({ tags: 1, status: 1 });
projectSchema.index({ title: 'text', description: 'text' });
projectSchema.index({ createdAt: -1 });
projectSchema.index({ lastActivityAt: -1 });

// Virtual for member count
projectSchema.virtual('memberCount').get(function() {
  return this.members ? this.members.length : 0;
});

// Virtual for like count
projectSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Virtual for repo count
projectSchema.virtual('repoCount').get(function() {
  return this.assignedRepos ? this.assignedRepos.length : 0;
});

// Virtual for project duration
projectSchema.virtual('duration').get(function() {
  if (!this.startDate || !this.endDate) return null;
  const diff = this.endDate - this.startDate;
  return Math.ceil(diff / (1000 * 60 * 60 * 24)); // days
});

// Virtual for days remaining
projectSchema.virtual('daysRemaining').get(function() {
  if (!this.endDate) return null;
  const diff = this.endDate - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Virtual for project health status
projectSchema.virtual('healthStatus').get(function() {
  if (this.status === 'completed') return 'completed';
  if (this.status === 'on-hold') return 'on-hold';
  
  const daysRemaining = this.daysRemaining;
  if (daysRemaining === null) return 'no-deadline';
  if (daysRemaining < 0) return 'overdue';
  if (daysRemaining <= 7) return 'critical';
  if (daysRemaining <= 30) return 'warning';
  return 'healthy';
});

// Pre-save middleware
projectSchema.pre('save', function(next) {
  // Update last activity
  this.lastActivityAt = new Date();
  
  // Clean and validate arrays
  if (this.technologies) {
    this.technologies = this.technologies.filter(tech => tech && tech.trim());
  }
  if (this.tags) {
    this.tags = [...new Set(this.tags.filter(tag => tag && tag.trim()))]; // Remove duplicates
  }
  
  next();
});

// Instance methods
projectSchema.methods.addMember = function(userId) {
  const userIdString = userId?.toString();
  const memberIds = this.members?.map(id => id?.toString()) || [];
  if (!memberIds.includes(userIdString)) {
    this.members.push(userId);
    this.lastActivityAt = new Date();
  }
  return this.save();
};

//Update Project Member
projectSchema.methods.updateMember = function(oldUserId, newUserId) {
  const oldUserIdString = oldUserId?.toString();
  const memberIds = this.members?.map(id => id?.toString()) || [];
  const oldProjectCreatorIdString = this.projectCreatorId?.toString();
  
  // If the old user is the project creator, update the creator ID
  if (oldUserIdString === oldProjectCreatorIdString) {
    this.projectCreatorId = newUserId;
  } else {
    const memberIndex = memberIds.indexOf(oldUserIdString);
    if (memberIndex > -1) {
      this.members[memberIndex] = newUserId;
      this.lastActivityAt = new Date();
    }
  }

  return this.save();
};

projectSchema.methods.removeMember = function(userId) {
  const userIdString = userId?.toString();
  this.members = this.members.filter(id => id?.toString() !== userIdString);
  this.lastActivityAt = new Date();
  return this.save();
};

projectSchema.methods.hasMember = function(userId) {
  const userIdString = userId?.toString();
  const creatorIdString = this.projectCreatorId?.toString();
  const memberIds = this.members?.map(id => id?.toString()) || [];
  return userIdString === creatorIdString || memberIds.includes(userIdString);
}


projectSchema.methods.toggleLike = function(userId) {
  const userIdString = userId?.toString();
  const likeIds = this.likes?.map(id => id?.toString()) || [];
  const likeIndex = likeIds.indexOf(userIdString);
  
  if (likeIndex > -1) {
    this.likes.splice(likeIndex, 1);
  } else {
    this.likes.push(userId);
  }
  this.lastActivityAt = new Date();
  return this.save();
};

projectSchema.methods.updateProgress = function(progress) {
  this.progress = Math.max(0, Math.min(100, progress));
  this.lastActivityAt = new Date();
  
  // Auto-complete if 100%
  if (this.progress === 100 && this.status !== 'completed') {
    this.status = 'completed';
  }
  
  return this.save();
};

projectSchema.methods.archive = function() {
  this.isArchived = true;
  this.archivedAt = new Date();
  return this.save();
};

projectSchema.methods.unarchive = function() {
  this.isArchived = false;
  this.archivedAt = null;
  return this.save();
};

projectSchema.methods.addRepo = function(repoId) {
  if (!this.assignedRepos.includes(repoId)) {
    this.assignedRepos.push(repoId);
    this.lastActivityAt = new Date();
  }
  return this.save();
};

projectSchema.methods.removeRepo = function(repoId) {
  this.assignedRepos = this.assignedRepos.filter(id => id.toString() !== repoId.toString());
  this.lastActivityAt = new Date();
  return this.save();
};

projectSchema.methods.canUserEdit = function(userId) {
  const userIdString = userId?.toString();
  const creatorIdString = this.projectCreatorId?.toString();
  const memberIds = this.members?.map(id => id?.toString()) || [];
  
  return creatorIdString === userIdString || memberIds.includes(userIdString);
};

projectSchema.methods.canUserView = function(userId) {
  if (this.visibility === 'public') return true;
  
  const userIdString = userId?.toString();
  const creatorIdString = this.projectCreatorId?.toString();
  const memberIds = this.members?.map(id => id?.toString()) || [];
  
  if (this.visibility === 'private') {
    return creatorIdString === userIdString || memberIds.includes(userIdString);
  }
  // For team visibility, implement team logic as needed
  return creatorIdString === userIdString || memberIds.includes(userIdString);
};

// Static methods
projectSchema.statics.findByCreator = function(creatorId) {
  return this.find({ projectCreatorId: creatorId, isArchived: false });
};

projectSchema.statics.findByMember = function(userId) {
  return this.find({ 
    $or: [
      { projectCreatorId: userId },
      { members: { $in: [userId] }}
    ],
    isArchived: false
  });
};

projectSchema.statics.findByStatus = function(status) {
  return this.find({ status, isArchived: false });
};

projectSchema.statics.findFeatured = function() {
  return this.find({ featured: true, isArchived: false });
};

projectSchema.statics.findByTechnology = function(technology) {
  return this.find({ 
    technologies: { $in: [technology] },
    isArchived: false
  });
};

projectSchema.statics.findByTag = function(tag) {
  return this.find({ 
    tags: { $in: [tag] },
    isArchived: false
  });
};

projectSchema.statics.findEMSProjects = function() {
  return this.find({ createdFromEMS: true });
};

projectSchema.statics.searchProjects = function(searchTerm, filters = {}) {
  const query = {
    $and: [
      {
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { technologies: { $in: [new RegExp(searchTerm, 'i')] } },
          { tags: { $in: [new RegExp(searchTerm, 'i')] } }
        ]
      },
      { isArchived: false },
      ...Object.entries(filters).map(([key, value]) => ({ [key]: value }))
    ]
  };
  
  return this.find(query);
};

projectSchema.statics.getProjectStats = function(projectId) {
  return this.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(projectId) } },
    {
      $lookup: {
        from: 'workitems',
        localField: '_id',
        foreignField: 'project',
        as: 'workItems'
      }
    },
    {
      $addFields: {
        totalWorkItems: { $size: '$workItems' },
        completedWorkItems: {
          $size: {
            $filter: {
              input: '$workItems',
              cond: { $eq: ['$$this.status', 'completed'] }
            }
          }
        }
      }
    }
  ]);
};

export default mongoose.models.Project || mongoose.model('Project', projectSchema); 