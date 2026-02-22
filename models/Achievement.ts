import mongoose, { Document, Schema, Types } from 'mongoose';

export type AchievementType = 
  | 'First Problem'
  | 'Week Streak'
  | 'Month Streak'
  | '100 Problems'
  | '500 Problems'
  | 'Topic Master'
  | 'Speed Demon'
  | 'Night Owl'
  | 'Early Bird';

export interface IAchievement extends Document {
  _id: Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: AchievementType;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AchievementSchema = new Schema<IAchievement>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, default: '🏆' },
    unlockedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

AchievementSchema.index({ userId: 1, unlockedAt: -1 });

export default mongoose.models.Achievement || 
  mongoose.model<IAchievement>('Achievement', AchievementSchema);
