import mongoose, { Document, Schema } from 'mongoose';

export interface ISubject extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  code: string;
  department: string;
  semester: number;
  syllabus?: string;
  facultyAssigned: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema = new Schema<ISubject>(
  {
    title: {
      type: String,
      required: [true, 'Subject title is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Subject code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      index: true,
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: 1,
      max: 8,
      index: true,
    },
    syllabus: {
      type: String,
      default: '',
    },
    facultyAssigned: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

SubjectSchema.index({ department: 1, semester: 1 });

export const Subject = mongoose.model<ISubject>('Subject', SubjectSchema);
