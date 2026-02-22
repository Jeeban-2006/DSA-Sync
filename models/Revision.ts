import mongoose, { Document, Schema, Types } from 'mongoose';

export type RevisionCycleType = '3-day' | '7-day' | '30-day';
export type RevisionStatusType = 'Pending' | 'Completed' | 'Skipped';

export interface IRevision extends Document {
  _id: Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  problemId: mongoose.Types.ObjectId;
  scheduledDate: Date;
  completedDate?: Date;
  cycle: RevisionCycleType;
  status: RevisionStatusType;
  performanceNotes?: string;
  timeTaken?: number;
  createdAt: Date;
  updatedAt: Date;
}

const RevisionSchema = new Schema<IRevision>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    problemId: { type: Schema.Types.ObjectId, ref: 'Problem', required: true },
    scheduledDate: { type: Date, required: true },
    completedDate: { type: Date },
    cycle: { 
      type: String, 
      enum: ['3-day', '7-day', '30-day'], 
      required: true 
    },
    status: { 
      type: String, 
      enum: ['Pending', 'Completed', 'Skipped'], 
      default: 'Pending' 
    },
    performanceNotes: { type: String, default: '' },
    timeTaken: { type: Number },
  },
  { timestamps: true }
);

RevisionSchema.index({ userId: 1, scheduledDate: 1 });
RevisionSchema.index({ userId: 1, status: 1 });

export default mongoose.models.Revision || mongoose.model<IRevision>('Revision', RevisionSchema);
