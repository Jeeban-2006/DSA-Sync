import mongoose, { Document, Schema, Types } from 'mongoose';

export type ChallengeStatusType = 'Active' | 'Completed' | 'Failed' | 'Abandoned';

export interface IChallenge extends Document {
  _id: Types.ObjectId;
  creatorId: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  title: string;
  description: string;
  targetCount: number;
  topic?: string;
  difficulty?: string;
  startDate: Date;
  endDate: Date;
  status: ChallengeStatusType;
  progress: Map<string, number>; // userId -> count
  createdAt: Date;
  updatedAt: Date;
}

const ChallengeSchema = new Schema<IChallenge>(
  {
    creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    title: { type: String, required: true },
    description: { type: String, required: true },
    targetCount: { type: Number, required: true },
    topic: { type: String },
    difficulty: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { 
      type: String, 
      enum: ['Active', 'Completed', 'Failed', 'Abandoned'], 
      default: 'Active' 
    },
    progress: { type: Map, of: Number, default: {} },
  },
  { timestamps: true }
);

ChallengeSchema.index({ participants: 1, status: 1 });
ChallengeSchema.index({ creatorId: 1 });

export default mongoose.models.Challenge || mongoose.model<IChallenge>('Challenge', ChallengeSchema);
