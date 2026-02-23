# Push Notifications & Collaborative Features Setup Guide

This guide covers setting up push notifications, activity tracking, and friend profile features.

## 🔑 Required Environment Variables

Copy `.env.local.example` to `.env.local` and update with your values:

```bash
cp .env.local.example .env.local
```

Then add these values to your `.env.local` file:

```bash
# Existing Variables
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NEXT_PUBLIC_APP_URL=http://localhost:3000

# VAPID Keys for Push Notifications (Generate using the script below)
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key

# Admin & Security
ADMIN_EMAIL=admin@yourdomain.com
CRON_SECRET=your_secure_cron_secret_key
ADMIN_SECRET=your_admin_secret_key

# Optional: Groq AI (for existing AI features)
GROQ_API_KEY=your_groq_api_key
```

## 🔐 Generate VAPID Keys

VAPID keys are required for web push notifications. Generate them using this command:

```bash
npx web-push generate-vapid-keys
```

This will output:
```
Public Key: BPx...
Private Key: abc...
```

Add both keys to your `.env.local` file.

### For Production (Vercel):

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add each variable:
   - `VAPID_PUBLIC_KEY` (your public key)
   - `VAPID_PRIVATE_KEY` (your private key)
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (same as public key)
   - `CRON_SECRET` (generate a secure random string)
   - `ADMIN_SECRET` (generate a secure random string)
   - `ADMIN_EMAIL` (your admin email)

## 🎯 Feature Overview

### 1. Friend Profile Pages
- Navigate to `/friends/[username]` to view detailed friend profiles
- See comprehensive stats, recent activity, and mutual comparisons
- Compare common problems solved

### 2. Push Notifications
- **Daily Streak Reminder**: Sent at 8 PM if user hasn't solved any problem
- **Revision Reminder**: Sent at 7 PM if revisions are pending
- **Friend Activity**: Notifications when friends solve problems

### 3. Activity Tracking
- Automatic activity logging when problems are solved
- Revision completion tracking
- Friend activity feeds

## 🔧 Setup Steps

### 1. Install Dependencies
Already included in `package.json`:
- `web-push` - For push notifications
- Other dependencies are already installed

### 2. Configure Service Worker
The push notification service worker is located at `/public/push-sw.js` and is automatically registered when users enable notifications.

### 3. Enable Push Notifications (User Flow)
1. Go to Settings/Profile page
2. Use the `PushNotificationManager` component
3. Click "Enable Notifications"
4. Grant permission when prompted
5. Test with "Send Test Notification"

### 4. Set Up Vercel Cron Jobs
The cron job is configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-notifications",
      "schedule": "0 20 * * *"
    }
  ]
}
```

This runs daily at 8 PM UTC. Adjust the cron schedule if needed:
- `0 20 * * *` = 8:00 PM UTC daily
- `0 19 * * *` = 7:00 PM UTC daily
- Format: `minute hour day month dayOfWeek`

### 5. Secure the Cron Endpoint
The cron job requires authentication using `CRON_SECRET`. Vercel automatically adds the `Authorization` header when calling cron jobs.

**Manual Testing** (for development):
```bash
curl -X POST http://localhost:3000/api/cron/daily-notifications \
  -H "Authorization: Bearer your_cron_secret"
```

## 📱 Using the Push Notification Manager Component

Add to your settings or profile page:

```tsx
import PushNotificationManager from '@/components/PushNotificationManager';

export default function SettingsPage() {
  return (
    <div>
      <h2>Notification Settings</h2>
      <PushNotificationManager 
        onStatusChange={(enabled) => {
          console.log('Notifications:', enabled ? 'enabled' : 'disabled');
        }}
      />
    </div>
  );
}
```

## 🗄️ Database Models

### New Collections Added:

#### ActivityLog
Tracks user activities like problem solving, revisions, etc.
- Auto-deletes after 90 days
- Indexed for efficient querying

#### PushSubscription
Stores push notification subscriptions
- Tracks active/inactive subscriptions
- Auto-cleanup for invalid subscriptions

## 🔔 Notification Types

### 1. Streak Reminder
**Trigger**: User hasn't solved any problem today
**Time**: 8 PM daily
**Message**: "You haven't solved today. Keep your X day streak alive! 🔥"

### 2. Revision Reminder
**Trigger**: Pending revisions not completed
**Time**: 7 PM daily
**Message**: "You have N pending revisions. 5 mins now saves hours later! 📚"

### 3. Friend Activity (Future)
**Trigger**: Friend solves a problem
**Message**: "Your friend solved a Hard Graph problem today! 🚀"

## 🧪 Testing

### Test Push Notifications:
1. Enable notifications in your app
2. Click "Send Test Notification"
3. You should receive a test notification

### Test Cron Job Locally:
Use the admin endpoint:
```bash
curl -X GET http://localhost:3000/api/cron/daily-notifications \
  -H "Authorization: Bearer your_admin_secret"
```

### Monitor Cron Jobs on Vercel:
1. Go to your Vercel project
2. Navigate to **Deployments** → **Functions**
3. View cron job execution logs

## 🚀 Production Deployment Checklist

- [ ] Generate VAPID keys
- [ ] Add all environment variables to Vercel
- [ ] Deploy with `vercel.json` included
- [ ] Test push notifications in production
- [ ] Verify cron job runs correctly
- [ ] Monitor cron job logs
- [ ] Test friend profile pages
- [ ] Verify activity logging works

## 🐛 Troubleshooting

### Push Notifications Not Working:
1. Check browser support (Chrome, Firefox, Edge work best)
2. Verify VAPID keys are correctly set
3. Check browser console for errors
4. Ensure HTTPS is enabled (required for push)
5. Check if notification permission is granted

### Cron Job Not Running:
1. Verify `vercel.json` is in root directory
2. Check `CRON_SECRET` is set in Vercel
3. View cron logs in Vercel dashboard
4. Ensure API route is accessible

### Friend Profile Not Loading:
1. Check if friendship exists in database
2. Verify API route permissions
3. Check browser console for errors

## 📚 API Endpoints Reference

### Push Notifications:
- `POST /api/push/subscribe` - Subscribe to push notifications
- `DELETE /api/push/subscribe` - Unsubscribe
- `GET /api/push/subscribe` - Get user's subscriptions
- `POST /api/push/test` - Send test notification

### Activity Logs:
- `GET /api/activity` - Get user's activity logs
- `POST /api/activity` - Create activity log

### Friend Profiles:
- `GET /api/friends/dashboard/[username]` - Get friend profile data

### Cron Jobs:
- `POST /api/cron/daily-notifications` - Daily notification cron (protected)

## 🔐 Security Notes

- Always use HTTPS in production for push notifications
- Keep `VAPID_PRIVATE_KEY`, `CRON_SECRET`, and `ADMIN_SECRET` secure
- Never expose private keys in client-side code
- Validate cron requests with `CRON_SECRET`
- Implement rate limiting for notification endpoints

## 📈 Future Enhancements

- AI-generated notification messages
- Challenge reminders
- Contest alerts
- Weekly growth report notifications
- Friend activity real-time updates
- Notification preferences per category
- Quiet hours settings

## 💡 Tips

1. **Test locally first**: Use the test notification button before deploying
2. **Monitor usage**: Check Vercel logs for cron job execution
3. **User privacy**: Allow users to disable notifications easily
4. **Optimize notifications**: Don't spam users, send meaningful updates only
5. **Handle errors gracefully**: Invalid subscriptions should be auto-cleaned

## 📞 Support

For issues or questions:
1. Check browser console logs
2. Check Vercel deployment logs
3. Verify all environment variables are set
4. Review API endpoint responses

---

**Ready to deploy!** Follow the checklist above and your collaborative DSA tracker with push notifications will be live! 🚀
