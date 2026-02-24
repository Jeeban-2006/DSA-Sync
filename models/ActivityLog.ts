import mongoose, { Document, Schema, Types } from 'mongoose';

export type ActivityType = 
  | 'problem_solved' 
  | 'revision_done' 
  | 'streak_updated' 
  | 'challenge_joined'
  | 'challenge_completed'
  | 'friend_added'
  | 'achievement_unlocked'
  | 'import_completed'
  | 'import_synced';

export interface IActivityLog extends Document {
  _id: Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: ActivityType;
  metadata: {
    problemName?: string;
    difficulty?: string;
    topic?: string;
    timeTaken?: number;
    streak?: number;
    challengeId?: string;
    friendId?: string;
    achievementName?: string;
    count?: number;
    source?: string;
    importBatchId?: string;
    [key: string]: any;
  };
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true 
    },
    type: { 
      type: String, 
      enum: [
        'problem_solved',
        'revision_done',
        'streak_updated',
        'challenge_joined',
        'challenge_completed',
        'friend_added',
        'achievement_unlocked',
        'import_completed',
        'import_synced'
      ],
      required: true 
    },
    metadata: { 
      type: Schema.Types.Mixed, 
      default: {} 
    },
  },
  { timestamps: true }
);

// Indexes for efficient queries
ActivityLogSchema.index({ userId: 1, createdAt: -1 });
ActivityLogSchema.index({ type: 1, createdAt: -1 });

// TTL index to auto-delete old logs after 90 days
ActivityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

export default mongoose.models.ActivityLog || 
  mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
