import mongoose, { Document, Schema, Types } from 'mongoose';

export type DifficultyType = 'Easy' | 'Medium' | 'Hard';
export type StatusType = 'Solved' | 'Needs Revision' | 'Couldn\'t Solve';

export interface IProblem extends Document {
  _id: Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  problemName: string;
  platform: string;
  problemLink: string;
  difficulty: DifficultyType;
  topic: string;
  subtopic: string;
  timeTaken: number; // in minutes
  dateSolved: Date;
  status: StatusType;
  approachSummary: string;
  mistakesFaced: string;
  keyLearning: string;
  codeSnippet?: string;
  markedForRevision: boolean;
  revisionDates: Date[];
  lastRevised?: Date;
  revisionCount: number;
  timesAttempted: number;
  // Import-related fields
  imported: boolean;
  importSource?: 'CSV' | 'Codeforces' | 'LeetCode' | 'CodeChef';
  externalId?: string;
  importBatchId?: string;
  importedAt?: Date;
  originalSolvedDate?: Date;
  lastSyncedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProblemSchema = new Schema<IProblem>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    problemName: { type: String, required: true },
    platform: { type: String, required: true },
    problemLink: { type: String, required: true },
    difficulty: { 
      type: String, 
      enum: ['Easy', 'Medium', 'Hard'], 
      required: true 
    },
    topic: { type: String, required: true },
    subtopic: { type: String, required: true },
    timeTaken: { type: Number, required: true },
    dateSolved: { type: Date, required: true, default: Date.now },
    status: { 
      type: String, 
      enum: ['Solved', 'Needs Revision', 'Couldn\'t Solve'], 
      required: true 
    },
    approachSummary: { type: String, required: true },
    mistakesFaced: { type: String, default: '' },
    keyLearning: { type: String, default: '' },
    codeSnippet: { type: String, default: '' },
    markedForRevision: { type: Boolean, default: false },
    revisionDates: [{ type: Date }],
    lastRevised: { type: Date },
    revisionCount: { type: Number, default: 0 },
    timesAttempted: { type: Number, default: 1 },
    // Import fields
    imported: { type: Boolean, default: false },
    importSource: { type: String, enum: ['CSV', 'Codeforces', 'LeetCode', 'CodeChef'] },
    externalId: { type: String },
    importBatchId: { type: String },
    importedAt: { type: Date },
    originalSolvedDate: { type: Date },
    lastSyncedAt: { type: Date },
  },
  { timestamps: true }
);

ProblemSchema.index({ userId: 1, dateSolved: -1 });
ProblemSchema.index({ userId: 1, topic: 1 });
ProblemSchema.index({ userId: 1, markedForRevision: 1 });
ProblemSchema.index({ userId: 1, problemName: 1, platform: 1 });
ProblemSchema.index({ userId: 1, imported: 1 });
ProblemSchema.index({ importBatchId: 1 });

export default mongoose.models.Problem || mongoose.model<IProblem>('Problem', ProblemSchema);
