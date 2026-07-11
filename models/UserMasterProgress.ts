import mongoose, { Document, Schema } from 'mongoose';

export interface IUserMasterProgress extends Document {
  userId: mongoose.Types.ObjectId;
  masterProblemId: mongoose.Types.ObjectId;
  done: boolean;
  completedAt?: Date;
  note?: string;
  flaggedForRevision?: boolean;
  linkedProblemId?: mongoose.Types.ObjectId;
}

const UserMasterProgressSchema = new Schema<IUserMasterProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    masterProblemId: { type: Schema.Types.ObjectId, ref: 'MasterSheetProblem', required: true },
    done: { type: Boolean, default: false },
    completedAt: { type: Date },
    note: { type: String, default: '' },
    flaggedForRevision: { type: Boolean, default: false },
    linkedProblemId: { type: Schema.Types.ObjectId, ref: 'Problem' },
  },
  { timestamps: true }
);

UserMasterProgressSchema.index({ userId: 1, masterProblemId: 1 }, { unique: true });
UserMasterProgressSchema.index({ linkedProblemId: 1 });

export default mongoose.models.UserMasterProgress || mongoose.model<IUserMasterProgress>('UserMasterProgress', UserMasterProgressSchema);
