import mongoose from 'mongoose';

export interface INotification extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  type: 'streak' | 'revision' | 'achievement' | 'friend' | 'challenge' | 'ai_report';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  metadata?: any;
  createdAt: Date;
}

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['streak', 'revision', 'achievement', 'friend', 'challenge', 'ai_report'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  actionUrl: {
    type: String,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 2592000, // Auto-delete after 30 days
  },
});

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
