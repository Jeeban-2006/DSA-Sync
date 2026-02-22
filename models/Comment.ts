import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IComment extends Document {
  _id: Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  problemId: mongoose.Types.ObjectId;
  content: string;
  reactions: {
    userId: mongoose.Types.ObjectId;
    type: string; // 'like', 'love', 'fire', 'clap'
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    problemId: { type: Schema.Types.ObjectId, ref: 'Problem', required: true },
    content: { type: String, required: true },
    reactions: [{
      userId: { type: Schema.Types.ObjectId, ref: 'User' },
      type: { type: String, enum: ['like', 'love', 'fire', 'clap'] }
    }],
  },
  { timestamps: true }
);

CommentSchema.index({ problemId: 1, createdAt: -1 });
CommentSchema.index({ userId: 1 });

export default mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);
