import mongoose from 'mongoose';

export const WorkItemCommentSchema = new mongoose.Schema({
    workItemId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true,
        ref: 'WorkItem'
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        maxLength: [50000, 'Comment cannot exceed 50000 characters']
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    reactions:[{
        reaction:{
            type:String,
        },
        reactedUsers:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
        }]
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

// * Virtual populate for createdBy -> User.userId
WorkItemCommentSchema.virtual('createdByUser', {
    ref: 'User',
    localField: 'createdBy',
    foreignField: 'userId',
    justOne: true
});

//  * Virtual populate for reactions[].reactedUsers[] -> User.userId
WorkItemCommentSchema.virtual('reactionUsers', {
    ref: 'User',
    localField: 'reactions.reactedUsers',
    foreignField: 'userId',
});

export default mongoose.models.WorkItemComment || mongoose.model('WorkItemComment', WorkItemCommentSchema); 