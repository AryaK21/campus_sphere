import mongoose, { Document, Schema } from 'mongoose';

export type NoticeCategoryEnum = 'Department' | 'Clubs' | 'Placements' | 'Exams' | 'Workshops' | 'Holidays';

export interface INotice extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  content: string;
  category: NoticeCategoryEnum;
  postedBy: mongoose.Types.ObjectId;
  targetAudience: string[];
  pinned: boolean;
  attachmentUrl?: string;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NoticeSchema = new Schema<INotice>(
  {
    title: {
      type: String,
      required: [true, 'Notice title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Notice content is required'],
    },
    category: {
      type: String,
      enum: ['Department', 'Clubs', 'Placements', 'Exams', 'Workshops', 'Holidays'],
      required: true,
      index: true,
    },
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    targetAudience: {
      type: [String],
      default: ['All'],
    },
    pinned: {
      type: Boolean,
      default: false,
      index: true,
    },
    attachmentUrl: {
      type: String,
      default: '',
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

NoticeSchema.index({ pinned: -1, createdAt: -1 });

export const Notice = mongoose.model<INotice>('Notice', NoticeSchema);
