import mongoose, { Document, Schema } from 'mongoose';

export interface IMasterSheetStep extends Document {
  sheetId: mongoose.Types.ObjectId;
  title: string;
  order: number;
}

const MasterSheetStepSchema = new Schema<IMasterSheetStep>(
  {
    sheetId: { type: Schema.Types.ObjectId, ref: 'MasterSheet', required: true },
    title: { type: String, required: true },
    order: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

MasterSheetStepSchema.index({ sheetId: 1, order: 1 });

export default mongoose.models.MasterSheetStep || mongoose.model<IMasterSheetStep>('MasterSheetStep', MasterSheetStepSchema);
