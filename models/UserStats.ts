import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IUserStats extends Document {
  _id: Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  totalProblems: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  topicStats: Map<string, {
    total: number;
    easy: number;
    medium: number;
    hard: number;
    avgTime: number;
    accuracy: number;
  }>;
  weeklyProgress: {
    weekNumber: number;
    year: number;
    problemsSolved: number;
  }[];
  lastCalculated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserStatsSchema = new Schema<IUserStats>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    totalProblems: { type: Number, default: 0 },
    easyCount: { type: Number, default: 0 },
    mediumCount: { type: Number, default: 0 },
    hardCount: { type: Number, default: 0 },
    topicStats: { 
      type: Map, 
      of: {
        total: Number,
        easy: Number,
        medium: Number,
        hard: Number,
        avgTime: Number,
        accuracy: Number,
      },
      default: {} 
    },
    weeklyProgress: [{
      weekNumber: Number,
      year: Number,
      problemsSolved: Number,
    }],
    lastCalculated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

UserStatsSchema.index({ userId: 1 });

export default mongoose.models.UserStats || mongoose.model<IUserStats>('UserStats', UserStatsSchema);
