import mongoose, { Document, Schema } from 'mongoose';

export interface IForumComment extends Document {
  _id: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  content: string;
  parentCommentId?: mongoose.Types.ObjectId | null;
  upvotes: mongoose.Types.ObjectId[];
  isBestAnswer: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ForumCommentSchema = new Schema<IForumComment>(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'ForumPost',
      required: true,
      index: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
    },
    parentCommentId: {
      type: Schema.Types.ObjectId,
      ref: 'ForumComment',
      default: null,
      index: true,
    },
    upvotes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isBestAnswer: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

ForumCommentSchema.index({ postId: 1, createdAt: 1 });

export const ForumComment = mongoose.model<IForumComment>('ForumComment', ForumCommentSchema);
