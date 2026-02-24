import mongoose, { Document, Schema, Types } from 'mongoose';

export type ImportSourceType = 'CSV' | 'Codeforces' | 'LeetCode' | 'CodeChef';

export interface IImportHistory extends Document {
  _id: Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  batchId: string;
  source: ImportSourceType;
  totalRows: number;
  imported: number;
  duplicatesSkipped: number;
  invalidRows: number;
  errorList: Array<{
    row: number;
    reason: string;
  }>;
  metadata?: {
    codeforcesHandle?: string;
    leetcodeUsername?: string;
    codechefUsername?: string;
    fileName?: string;
    [key: string]: any;
  };
  createdAt: Date;
}

const ImportHistorySchema = new Schema<IImportHistory>(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true 
    },
    batchId: { type: String, required: true, unique: true },
    source: { 
      type: String, 
      enum: ['CSV', 'Codeforces', 'LeetCode', 'CodeChef'], 
      required: true 
    },
    totalRows: { type: Number, required: true },
    imported: { type: Number, required: true },
    duplicatesSkipped: { type: Number, default: 0 },
    invalidRows: { type: Number, default: 0 },
    errorList: [{
      row: { type: Number },
      reason: { type: String }
    }],
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

ImportHistorySchema.index({ userId: 1, createdAt: -1 });
ImportHistorySchema.index({ batchId: 1 });

export default mongoose.models.ImportHistory || mongoose.model<IImportHistory>('ImportHistory', ImportHistorySchema);
