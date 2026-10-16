import mongoose, { Document, Schema } from 'mongoose';

export interface IInterviewExperience {
  _id?: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  roundDetails: string;
  tips: string;
  outcome: 'Selected' | 'Rejected' | 'In-Progress';
  createdAt: Date;
}

export interface IPlacement extends Document {
  _id: mongoose.Types.ObjectId;
  companyName: string;
  role: string;
  package?: string;
  location?: string;
  eligibility: {
    minCgpa: number;
    allowedDepartments: string[];
    allowedBatches: string[];
    backlogsAllowed: boolean;
  };
  jobDescription: string;
  deadline: Date;
  applyUrl?: string;
  status: 'Active' | 'Closed' | 'Upcoming';
  interviewExperiences: IInterviewExperience[];
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
}

const InterviewExperienceSchema = new Schema<IInterviewExperience>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    roundDetails: {
      type: String,
      required: true,
    },
    tips: {
      type: String,
      default: '',
    },
    outcome: {
      type: String,
      enum: ['Selected', 'Rejected', 'In-Progress'],
      default: 'In-Progress',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const PlacementSchema = new Schema<IPlacement>(
  {
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Job role is required'],
      trim: true,
    },
    package: {
      type: String,
      default: 'Competitive',
    },
    location: {
      type: String,
      default: 'Pan-India / Remote',
    },
    eligibility: {
      minCgpa: {
        type: Number,
        default: 6.0,
      },
      allowedDepartments: {
        type: [String],
        default: ['Computer Science', 'Information Technology', 'Electronics'],
      },
      allowedBatches: {
        type: [String],
        default: ['2025', '2026'],
      },
      backlogsAllowed: {
        type: Boolean,
        default: false,
      },
    },
    jobDescription: {
      type: String,
      required: [true, 'Job description is required'],
    },
    deadline: {
      type: Date,
      required: [true, 'Application deadline is required'],
      index: true,
    },
    applyUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Active', 'Closed', 'Upcoming'],
      default: 'Active',
      index: true,
    },
    interviewExperiences: [InterviewExperienceSchema],
    attachments: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

PlacementSchema.index({ companyName: 'text', role: 'text' });

export const Placement = mongoose.model<IPlacement>('Placement', PlacementSchema);
