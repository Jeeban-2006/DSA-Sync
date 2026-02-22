import mongoose, { Document, Schema, Types } from 'mongoose';

export type FriendshipStatusType = 'Pending' | 'Accepted' | 'Rejected';

export interface IFriendConnection extends Document {
  _id: Types.ObjectId;
  requesterId: mongoose.Types.ObjectId;
  recipientId: mongoose.Types.ObjectId;
  status: FriendshipStatusType;
  createdAt: Date;
  updatedAt: Date;
}

const FriendConnectionSchema = new Schema<IFriendConnection>(
  {
    requesterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { 
      type: String, 
      enum: ['Pending', 'Accepted', 'Rejected'], 
      default: 'Pending' 
    },
  },
  { timestamps: true }
);

FriendConnectionSchema.index({ requesterId: 1, recipientId: 1 }, { unique: true });
FriendConnectionSchema.index({ requesterId: 1, status: 1 });
FriendConnectionSchema.index({ recipientId: 1, status: 1 });

export default mongoose.models.FriendConnection || 
  mongoose.model<IFriendConnection>('FriendConnection', FriendConnectionSchema);
