import mongoose, { Document, Schema, Types } from 'mongoose';

export type ReportType = 
  | 'Weekly Growth' 
  | 'Problem Recommendation' 
  | 'Solution Analysis' 
  | 'Comparison Insight' 
  | 'Pattern Detection' 
  | 'Confidence Score';

export interface IAIReport extends Document {
  _id: Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: ReportType;
  title: string;
  content: any; // Structured JSON from AI
  metadata?: any;
  generatedAt: Date;
  weekNumber?: number;
  year?: number;
  createdAt: Date;
  updatedAt: Date;
}

const AIReportSchema = new Schema<IAIReport>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: Schema.Types.Mixed, required: true },
    metadata: { type: Schema.Types.Mixed },
    generatedAt: { type: Date, default: Date.now },
    weekNumber: { type: Number },
    year: { type: Number },
  },
  { timestamps: true }
);

AIReportSchema.index({ userId: 1, type: 1, generatedAt: -1 });
AIReportSchema.index({ userId: 1, weekNumber: 1, year: 1 });

export default mongoose.models.AIReport || mongoose.model<IAIReport>('AIReport', AIReportSchema);
