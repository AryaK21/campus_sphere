import mongoose, { Document, Schema } from 'mongoose';

export type ForumCategoryEnum = 'Placements' | 'Internships' | 'Coding' | 'Projects' | 'Exams' | 'General';

export interface IForumPost extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  body: string;
  author: mongoose.Types.ObjectId;
  category: ForumCategoryEnum;
  tags: string[];
  upvotes: mongoose.Types.ObjectId[];
  bestAnswerId?: mongoose.Types.ObjectId;
  status: 'Open' | 'Resolved';
  commentsCount: number;
  viewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ForumPostSchema = new Schema<IForumPost>(
  {
    title: {
      type: String,
      required: [true, 'Post title is required'],
      trim: true,
    },
    body: {
      type: String,
      required: [true, 'Post body is required'],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['Placements', 'Internships', 'Coding', 'Projects', 'Exams', 'General'],
      required: true,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    upvotes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    bestAnswerId: {
      type: Schema.Types.ObjectId,
      ref: 'ForumComment',
    },
    status: {
      type: String,
      enum: ['Open', 'Resolved'],
      default: 'Open',
      index: true,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

ForumPostSchema.index({ title: 'text', body: 'text', tags: 'text' });
ForumPostSchema.index({ createdAt: -1 });

export const ForumPost = mongoose.model<IForumPost>('ForumPost', ForumPostSchema);
