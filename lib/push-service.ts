import webpush from 'web-push';
import PushSubscription from '@/models/PushSubscription';

// Configure VAPID keys
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:' + (process.env.ADMIN_EMAIL || 'admin@dsasync.com'),
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
  data?: any;
}

/**
 * Send push notification to a specific user
 */
export async function sendPushToUser(
  userId: string,
  payload: PushNotificationPayload
): Promise<{ success: boolean; sentCount: number; errors: number }> {
  try {
    const subscriptions = await PushSubscription.find({
      userId,
      isActive: true,
    });

    if (subscriptions.length === 0) {
      return { success: false, sentCount: 0, errors: 0 };
    }

    let sentCount = 0;
    let errors = 0;

    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/icons/icon-512x512.svg',
      badge: payload.badge || '/icons/icon-512x512.svg',
      url: payload.url || '/',
      tag: payload.tag || 'dsa-sync-notification',
      data: payload.data || {},
      timestamp: Date.now(),
    });

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.keys.p256dh,
              auth: sub.keys.auth,
            },
          },
          notificationPayload
        );

        // Update last used
        await PushSubscription.updateOne(
          { _id: sub._id },
          { lastUsed: new Date() }
        );

        sentCount++;
      } catch (error: any) {
        console.error('Push notification error:', error);
        errors++;

        // Deactivate if subscription is invalid
        if (error.statusCode === 410 || error.statusCode === 404) {
          await PushSubscription.updateOne(
            { _id: sub._id },
            { isActive: false }
          );
        }
      }
    }

    return {
      success: sentCount > 0,
      sentCount,
      errors,
    };
  } catch (error) {
    console.error('Send push to user error:', error);
    return { success: false, sentCount: 0, errors: 1 };
  }
}

/**
 * Send push notification to multiple users
 */
export async function sendPushToUsers(
  userIds: string[],
  payload: PushNotificationPayload
): Promise<{ success: boolean; totalSent: number; totalErrors: number }> {
  let totalSent = 0;
  let totalErrors = 0;

  for (const userId of userIds) {
    const result = await sendPushToUser(userId, payload);
    totalSent += result.sentCount;
    totalErrors += result.errors;
  }

  return {
    success: totalSent > 0,
    totalSent,
    totalErrors,
  };
}

/**
 * Send streak reminder notification
 */
export async function sendStreakReminder(
  userId: string,
  currentStreak: number
): Promise<boolean> {
  const result = await sendPushToUser(userId, {
    title: '🔥 Keep Your Streak Alive!',
    body: `You haven't solved any problem today. Don't break your ${currentStreak} day streak!`,
    url: '/dashboard',
    tag: 'streak-reminder',
  });

  return result.success;
}

/**
 * Send revision reminder notification
 */
export async function sendRevisionReminder(
  userId: string,
  pendingCount: number,
  problemName?: string
): Promise<boolean> {
  const message =
    pendingCount === 1 && problemName
      ? `You have 1 pending revision: ${problemName}`
      : `You have ${pendingCount} pending revisions to complete.`;

  const result = await sendPushToUser(userId, {
    title: '📚 Revision Reminder',
    body: message + ' 5 mins now saves hours later!',
    url: '/revision',
    tag: 'revision-reminder',
  });

  return result.success;
}

/**
 * Send friend activity notification
 */
export async function sendFriendActivityNotification(
  userId: string,
  friendName: string,
  activity: string
): Promise<boolean> {
  const result = await sendPushToUser(userId, {
    title: '👥 Friend Activity',
    body: `${friendName} ${activity}`,
    url: '/friends',
    tag: 'friend-activity',
  });

  return result.success;
}

/**
 * Clean up invalid subscriptions
 */
export async function cleanupInvalidSubscriptions(): Promise<number> {
  try {
    const result = await PushSubscription.deleteMany({
      isActive: false,
      updatedAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // 7 days old
    });

    return result.deletedCount || 0;
  } catch (error) {
    console.error('Cleanup subscriptions error:', error);
    return 0;
  }
}
