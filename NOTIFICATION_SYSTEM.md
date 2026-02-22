# Notification System Documentation

## Overview
DSA Sync includes a comprehensive notification system with three delivery channels:
- **Browser Push Notifications** - Real-time notifications via web push API
- **In-App Notifications** - Persistent notifications stored in MongoDB
- **Email Notifications** - HTML emails sent via SMTP

## Features

### Notification Types
1. **Streak Reminders** 🔥 - Daily reminders to maintain your solving streak
2. **Revision Reminders** 📚 - Alerts when problems are due for revision
3. **Achievement** 🎉 - Celebrate milestones and unlocked achievements
4. **Friend Activity** 👥 - Updates about friend requests and activity
5. **Challenge Updates** ⚔️ - Notifications about challenges and competitions
6. **AI Reports** 🤖 - Weekly AI-generated progress reports

### User Control
- Enable/disable push notifications and email separately
- Toggle individual notification types
- Set custom reminder times (streak, revision)
- Configure quiet hours (no notifications during sleep)
- Choose weekly report day
- Unsubscribe from emails

## Setup Instructions

### 1. Environment Variables

Add the following to your `.env.local` file:

```bash
# Push Notifications (VAPID Keys)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-vapid-key
VAPID_PRIVATE_KEY=your-private-vapid-key

# Email Notifications (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=DSA Sync <noreply@dsasync.com>
```

### 2. Generate VAPID Keys

Run this command to generate new VAPID keys:

```bash
npx web-push generate-vapid-keys
```

Copy the output to your `.env.local` file.

### 3. Email Setup (Gmail Example)

1. Enable 2-factor authentication on your Gmail account
2. Go to Google Account > Security > 2-Step Verification > App Passwords
3. Generate app password for "Mail"
4. Use this password in `EMAIL_PASSWORD` (not your Gmail password)

### 4. Vercel Deployment

Add these environment variables in Vercel dashboard:

**Required:**
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` - Your public VAPID key (visible to browser)
- `VAPID_PRIVATE_KEY` - Your private VAPID key (server-only)

**Optional (for email notifications):**
- `EMAIL_HOST` - smtp.gmail.com
- `EMAIL_PORT` - 587
- `EMAIL_USER` - Your email address
- `EMAIL_PASSWORD` - App password
- `EMAIL_FROM` - "DSA Sync <noreply@dsasync.com>"

## API Reference

### Get Notifications
```typescript
GET /api/notifications?limit=20&unread=false

Response:
{
  notifications: Notification[],
  unreadCount: number
}
```

### Mark as Read
```typescript
POST /api/notifications/mark-read

Body:
{
  notificationIds?: string[],  // Specific IDs
  markAll?: boolean            // Mark all as read
}
```

### Delete Notification
```typescript
DELETE /api/notifications?id={notificationId}
```

### Get Preferences
```typescript
GET /api/notifications/preferences

Response: NotificationPreferences
```

### Update Preferences
```typescript
PUT /api/notifications/preferences

Body: Partial<NotificationPreferences>
```

### Subscribe to Push
```typescript
POST /api/notifications/preferences/subscribe

Body:
{
  subscription: PushSubscription
}
```

### Send Test Notification
```typescript
POST /api/notifications/test

Body:
{
  type: 'streak' | 'revision' | 'achievement'
}
```

## Usage in Components

### Display Notification Bell
```tsx
import NotificationBell from '@/components/NotificationBell';

<NotificationBell />
```

### Register Push Notifications
```tsx
import { usePushNotifications } from '@/lib/push-notifications';

function MyComponent() {
  usePushNotifications(); // Auto-registers when user is logged in
  // ...
}
```

### Send Notification Programmatically
```typescript
import { createNotification } from '@/lib/notification-service';

await createNotification({
  userId: user._id,
  type: 'achievement',
  title: '🎉 Level Up!',
  message: 'Congratulations! You reached level 5',
  actionUrl: '/profile',
  metadata: { level: 5 },
});
```

### Check and Send Streak Reminders
```typescript
import { sendStreakReminder } from '@/lib/notification-service';

await sendStreakReminder(userId, currentStreak);
```

### Send Revision Reminders
```typescript
import { sendRevisionReminders } from '@/lib/notification-service';

await sendRevisionReminders(userId);
```

## Notification Triggers

### Manual Triggers
You can trigger notifications manually from:
- Profile page > Notifications tab > "Send Test Notification"
- API route: `POST /api/notifications/test`

### Automated Triggers (Planned)
Set up cron jobs or serverless functions to run:

**Daily (User's configured time):**
```typescript
// Check all users, send if needed
for (const user of users) {
  const prefs = await NotificationPreferences.findOne({ userId: user._id });
  if (prefs.streakReminders) {
    await sendStreakReminder(user._id, user.currentStreak);
  }
  if (prefs.revisionReminders) {
    await sendRevisionReminders(user._id);
  }
}
```

**Weekly (User's chosen day):**
```typescript
// Send AI-generated weekly reports
await createNotification({
  userId: user._id,
  type: 'ai_report',
  title: '📊 Your Weekly Progress Report',
  message: 'Check out your achievements this week!',
  actionUrl: '/profile?tab=analytics',
});
```

### Using Vercel Cron Jobs
Create `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/send-notifications",
      "schedule": "0 8,20 * * *"
    }
  ]
}
```

Create `/api/cron/send-notifications/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { sendStreakReminder } from '@/lib/notification-service';

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Process all users
  // ... send notifications

  return NextResponse.json({ success: true });
}
```

## Database Models

### Notification
```typescript
interface INotification {
  userId: ObjectId;
  type: 'streak' | 'revision' | 'achievement' | 'friend' | 'challenge' | 'ai_report';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  metadata?: any;
  createdAt: Date;
}
```

### NotificationPreferences
```typescript
interface INotificationPreferences {
  userId: ObjectId;
  email: string;
  
  // Channels
  pushEnabled: boolean;
  emailEnabled: boolean;
  
  // Types
  streakReminders: boolean;
  revisionReminders: boolean;
  achievementAlerts: boolean;
  friendActivity: boolean;
  challengeUpdates: boolean;
  weeklyReport: boolean;
  
  // Timing
  streakReminderTime: string;    // '20:00'
  revisionReminderTime: string;  // '09:00'
  weeklyReportDay: number;       // 0-6 (Sunday-Saturday)
  quietHoursStart: string;       // '22:00'
  quietHoursEnd: string;         // '08:00'
  
  // Push subscription
  pushSubscription?: any;
}
```

## Troubleshooting

### Push Notifications Not Working

1. **Check browser support:**
   - Chrome, Edge, Firefox: Full support
   - Safari: iOS 16.4+ only
   
2. **Verify VAPID keys:**
   - Run `npx web-push generate-vapid-keys` again
   - Ensure keys match in `.env.local`
   
3. **Check permissions:**
   - Open browser DevTools > Application > Service Workers
   - Check if service worker is registered
   - Verify notification permission granted

4. **Test in browser console:**
   ```javascript
   Notification.requestPermission()
   navigator.serviceWorker.getRegistration()
   ```

### Email Not Sending

1. **Gmail specific:**
   - Must use app password (not regular password)
   - Enable "Less secure app access" if using older Google accounts
   
2. **Check SMTP settings:**
   - Port 587 for TLS (recommended)
   - Port 465 for SSL
   - Port 25 for non-encrypted (not recommended)

3. **Test email manually:**
   - Send test notification from profile page
   - Check spam folder
   - Verify `EMAIL_FROM` format

### Service Worker Issues

1. **Clear registration:**
   ```javascript
   navigator.serviceWorker.getRegistrations().then(registrations => {
     registrations.forEach(r => r.unregister())
   })
   ```

2. **Check console errors:**
   - Service worker must be on HTTPS (except localhost)
   - Check if `push-sw.js` is accessible

## Security Best Practices

1. **Never commit VAPID keys** - Use `.env.local` and `.gitignore`
2. **Validate user permissions** - Always verify auth token before sending
3. **Rate limit notifications** - Prevent spam
4. **Sanitize email content** - Prevent XSS in notification messages
5. **Use app passwords** - Never store real email passwords
6. **Verify push subscriptions** - Validate subscription belongs to user

## Performance Tips

1. **Batch notifications** - Send multiple notifications together
2. **Use indexing** - userId is indexed for fast queries
3. **Auto-expire old notifications** - TTL index removes after 30 days
4. **Limit fetch count** - Default 20 notifications per request
5. **Cache preferences** - Store user preferences in memory/Redis

## Future Enhancements

- [ ] SMS notifications via Twilio
- [ ] Slack/Discord webhooks
- [ ] Custom notification sounds
- [ ] Rich notification actions (mark as complete, snooze)
- [ ] Notification history export
- [ ] Analytics dashboard (notification engagement)
- [ ] A/B testing for notification copy
- [ ] Smart notification timing (ML-based)

## Support

For issues or questions:
- Check this documentation first
- Review error logs in browser console
- Test with `/api/notifications/test` endpoint
- Verify environment variables in Vercel dashboard

