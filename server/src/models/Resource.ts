import mongoose, { Document, Schema } from 'mongoose';

export type ResourceTypeEnum = 'Notes' | 'PPT' | 'LabManual' | 'PYQ' | 'Syllabus' | 'ReferenceBook' | 'VideoLink' | 'Assignment';

export interface IRating {
  userId: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
}

export interface IResource extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  subjectId: mongoose.Types.ObjectId;
  semester: number;
  department: string;
  uploadedBy: mongoose.Types.ObjectId;
  resourceType: ResourceTypeEnum;
  fileUrl: string;
  fileType: string;
  downloadCount: number;
  ratings: IRating[];
  averageRating: number;
  createdAt: Date;
  updatedAt: Date;
}

const RatingSchema = new Schema<IRating>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: '',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const ResourceSchema = new Schema<IResource>(
  {
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject is required'],
      index: true,
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: 1,
      max: 8,
      index: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      index: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'UploadedBy is required'],
      index: true,
    },
    resourceType: {
      type: String,
      enum: ['Notes', 'PPT', 'LabManual', 'PYQ', 'Syllabus', 'ReferenceBook', 'VideoLink', 'Assignment'],
      required: [true, 'Resource type is required'],
      index: true,
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    fileType: {
      type: String,
      default: 'pdf',
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    ratings: [RatingSchema],
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

// Search and filter indexes
ResourceSchema.index({ title: 'text', description: 'text' });
ResourceSchema.index({ department: 1, semester: 1, resourceType: 1 });
ResourceSchema.index({ subjectId: 1, resourceType: 1 });

export const Resource = mongoose.model<IResource>('Resource', ResourceSchema);
