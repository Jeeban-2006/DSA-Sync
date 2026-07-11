import mongoose, { Document, Schema } from 'mongoose';
import { DifficultyType } from './Problem';

export interface IMasterSheetProblem extends Document {
  stepId: mongoose.Types.ObjectId;
  topic: string;
  difficulty: DifficultyType;
  tags: string[];
  links: {
    blog?: string;
    yt?: string;
    lc?: string;
    gfg?: string;
    cn?: string;
    tuf?: string;
  };
  order: number;
}

const MasterSheetProblemSchema = new Schema<IMasterSheetProblem>(
  {
    stepId: { type: Schema.Types.ObjectId, ref: 'MasterSheetStep', required: true },
    topic: { type: String, required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true, default: 'Medium' },
    tags: [{ type: String }],
    links: {
      blog: { type: String },
      yt: { type: String },
      lc: { type: String },
      gfg: { type: String },
      cn: { type: String },
      tuf: { type: String },
    },
    order: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

MasterSheetProblemSchema.index({ stepId: 1, order: 1 });

export default mongoose.models.MasterSheetProblem || mongoose.model<IMasterSheetProblem>('MasterSheetProblem', MasterSheetProblemSchema);
