import mongoose, { Document, Schema } from 'mongoose';

export type SimulationModuleEnum = 'DSA' | 'OS' | 'Networks' | 'DBMS' | 'DigitalElectronics';

export interface ISimulation extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  module: SimulationModuleEnum;
  slug: string;
  description: string;
  metadata: Record<string, any>;
  usageStats: {
    views: number;
    runs: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SimulationSchema = new Schema<ISimulation>(
  {
    title: {
      type: String,
      required: [true, 'Simulation title is required'],
      trim: true,
    },
    module: {
      type: String,
      enum: ['DSA', 'OS', 'Networks', 'DBMS', 'DigitalElectronics'],
      required: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    usageStats: {
      views: { type: Number, default: 0 },
      runs: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

export const Simulation = mongoose.model<ISimulation>('Simulation', SimulationSchema);
