import mongoose, { Document, Schema } from 'mongoose';

export interface IMasterSheet extends Document {
  slug: string;
  name: string;
  order: number;
}

const MasterSheetSchema = new Schema<IMasterSheet>(
  {
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    order: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

MasterSheetSchema.index({ order: 1 });

export default mongoose.models.MasterSheet || mongoose.model<IMasterSheet>('MasterSheet', MasterSheetSchema);
