import Notification from '@/models/Notification';
import NotificationPreferences from '@/models/NotificationPreferences';
import connectDB from './mongodb';

export interface NotificationPayload {
  userId: string;
  type: 'streak' | 'revision' | 'achievement' | 'friend' | 'challenge' | 'ai_report';
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: any;
}

/**
 * Create an in-app notification
 */
export async function createNotification(payload: NotificationPayload) {
  try {
    await connectDB();
    
    const notification = await Notification.create(payload);
    
    // Get user preferences
    const prefs = await NotificationPreferences.findOne({ userId: payload.userId });
    
    if (prefs) {
      // Send push notification if enabled
      if (prefs.pushEnabled && prefs.pushSubscription) {
        await sendPushNotification(prefs.pushSubscription, {
          title: payload.title,
          body: payload.message,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          data: {
            url: payload.actionUrl || '/dashboard',
          },
        });
      }
      
      // Send email notification if enabled
      if (prefs.emailEnabled && shouldSendNotificationType(prefs, payload.type)) {
        await sendEmailNotification(prefs.email, {
          subject: payload.title,
          body: payload.message,
          actionUrl: payload.actionUrl,
        });
      }
    }
    
    return { success: true, notification };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, error };
  }
}

/**
 * Send push notification via service worker
 */
async function sendPushNotification(subscription: any, payload: any) {
  try {
    // This requires web-push package
    // For now, we'll use the browser's Push API
    // In production, use a service like Firebase Cloud Messaging or web-push
    
    const webpush = require('web-push');
    
    // VAPID keys should be in environment variables
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
    
    if (!vapidPublicKey || !vapidPrivateKey) {
      console.warn('VAPID keys not configured, skipping push notification');
      return;
    }
    
    webpush.setVapidDetails(
      'mailto:jeebankrushnasahu1@gmail.com',
      vapidPublicKey,
      vapidPrivateKey
    );
    
    await webpush.sendNotification(subscription, JSON.stringify(payload));
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
}

/**
 * Send email notification
 */
async function sendEmailNotification(
  email: string,
  payload: { subject: string; body: string; actionUrl?: string }
) {
  try {
    const nodemailer = require('nodemailer');
    
    // Create transporter (using Gmail as example)
    // In production, use proper email service like SendGrid, Resend, or AWS SES
    const transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    
    // Email template
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0ea5e9, #8b5cf6); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white; margin: 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .message { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 24px; background: #0ea5e9; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✨ DSA Sync</h1>
            </div>
            <div class="content">
              <h2>${payload.subject}</h2>
              <div class="message">
                <p>${payload.body}</p>
              </div>
              ${payload.actionUrl ? `<a href="${payload.actionUrl}" class="button">View Details</a>` : ''}
              <div class="footer">
                <p>You're receiving this because you enabled notifications in DSA Sync.</p>
                <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/profile?tab=notifications">Manage notification preferences</a></p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
    
    // Send email
    await transporter.sendMail({
      from: `DSA Sync <${process.env.EMAIL_USER || 'noreply@dsasync.com'}>`,
      to: email,
      subject: `🔔 ${payload.subject}`,
      html,
    });
  } catch (error) {
    console.error('Error sending email notification:', error);
  }
}

/**
 * Check if notification type should be sent based on preferences
 */
function shouldSendNotificationType(
  prefs: any,
  type: NotificationPayload['type']
): boolean {
  const typeMap = {
    streak: prefs.streakReminders,
    revision: prefs.revisionReminders,
    achievement: prefs.achievementAlerts,
    friend: prefs.friendActivity,
    challenge: prefs.challengeUpdates,
    ai_report: prefs.weeklyReport,
  };
  
  return typeMap[type] !== false;
}

/**
 * Check if user has solved a problem today
 */
export async function checkStreakToday(userId: string): Promise<boolean> {
  try {
    await connectDB();
    const Problem = require('@/models/Problem').default;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const count = await Problem.countDocuments({
      userId,
      solvedAt: { $gte: today },
    });
    
    return count > 0;
  } catch (error) {
    console.error('Error checking streak:', error);
    return false;
  }
}

/**
 * Send streak reminder if user hasn't solved today
 */
export async function sendStreakReminder(userId: string, currentStreak: number) {
  const solvedToday = await checkStreakToday(userId);
  
  if (!solvedToday && currentStreak > 0) {
    await createNotification({
      userId,
      type: 'streak',
      title: `🔥 Don't Break Your ${currentStreak}-Day Streak!`,
      message: `You're doing great! Solve one problem today to keep your ${currentStreak}-day streak alive.`,
      actionUrl: '/problems/add',
    });
  }
}

/**
 * Send revision reminders
 */
export async function sendRevisionReminders(userId: string) {
  try {
    await connectDB();
    const Revision = require('@/models/Revision').default;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dueRevisions = await Revision.countDocuments({
      userId,
      nextReviewDate: { $lte: today },
      completed: false,
    });
    
    if (dueRevisions > 0) {
      await createNotification({
        userId,
        type: 'revision',
        title: `📚 ${dueRevisions} Problem${dueRevisions > 1 ? 's' : ''} Need Revision`,
        message: `You have ${dueRevisions} problem${dueRevisions > 1 ? 's' : ''} scheduled for revision today. Keep your concepts fresh!`,
        actionUrl: '/revision',
      });
    }
  } catch (error) {
    console.error('Error sending revision reminders:', error);
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId: string): Promise<number> {
  try {
    await connectDB();
    const count = await Notification.countDocuments({
      userId,
      read: false,
    });
    return count;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
}
