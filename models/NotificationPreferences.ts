import mongoose from 'mongoose';

export interface INotificationPreferences extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  
  // Browser Push Notifications
  pushEnabled: boolean;
  pushSubscription?: any;
  
  // Email Notifications
  emailEnabled: boolean;
  email: string;
  
  // Notification Types
  streakReminders: boolean;
  revisionReminders: boolean;
  achievementAlerts: boolean;
  friendActivity: boolean;
  challengeUpdates: boolean;
  weeklyReport: boolean;
  
  // Timing Preferences
  streakReminderTime: string; // Format: "HH:MM" (24-hour)
  revisionReminderTime: string;
  weeklyReportDay: number; // 0-6 (Sunday-Saturday)
  
  // Quiet Hours
  quietHoursEnabled: boolean;
  quietHoursStart: string; // Format: "HH:MM"
  quietHoursEnd: string;
  
  updatedAt: Date;
}

const NotificationPreferencesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  
  // Browser Push
  pushEnabled: {
    type: Boolean,
    default: false,
  },
  pushSubscription: {
    type: mongoose.Schema.Types.Mixed,
  },
  
  // Email
  emailEnabled: {
    type: Boolean,
    default: true,
  },
  email: {
    type: String,
    required: true,
  },
  
  // Notification Types
  streakReminders: {
    type: Boolean,
    default: true,
  },
  revisionReminders: {
    type: Boolean,
    default: true,
  },
  achievementAlerts: {
    type: Boolean,
    default: true,
  },
  friendActivity: {
    type: Boolean,
    default: true,
  },
  challengeUpdates: {
    type: Boolean,
    default: true,
  },
  weeklyReport: {
    type: Boolean,
    default: true,
  },
  
  // Timing
  streakReminderTime: {
    type: String,
    default: '20:00', // 8 PM
  },
  revisionReminderTime: {
    type: String,
    default: '09:00', // 9 AM
  },
  weeklyReportDay: {
    type: Number,
    default: 0, // Sunday
  },
  
  // Quiet Hours
  quietHoursEnabled: {
    type: Boolean,
    default: false,
  },
  quietHoursStart: {
    type: String,
    default: '22:00', // 10 PM
  },
  quietHoursEnd: {
    type: String,
    default: '08:00', // 8 AM
  },
  
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.NotificationPreferences || 
  mongoose.model<INotificationPreferences>('NotificationPreferences', NotificationPreferencesSchema);
