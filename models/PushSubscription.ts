import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPushSubscription extends Document {
  _id: Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
  isActive: boolean;
  lastUsed?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PushSubscriptionSchema = new Schema<IPushSubscription>(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true 
    },
    endpoint: { 
      type: String, 
      required: true,
      unique: true 
    },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true }
    },
    userAgent: { 
      type: String 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    lastUsed: { 
      type: Date 
    },
  },
  { timestamps: true }
);

// Compound index for user queries
PushSubscriptionSchema.index({ userId: 1, isActive: 1 });

export default mongoose.models.PushSubscription || 
  mongoose.model<IPushSubscription>('PushSubscription', PushSubscriptionSchema);
