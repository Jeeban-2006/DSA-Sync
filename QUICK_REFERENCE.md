# 🚀 DSA Tracker - Quick Reference Guide

## 🔑 Essential Commands

### Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Generate VAPID keys for push notifications
npx web-push generate-vapid-keys
```

### Testing
```bash
# Test cron job manually (requires ADMIN_SECRET)
curl -X GET http://localhost:3000/api/cron/daily-notifications \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET"

# Test push notification (requires authentication)
# Go to Profile page → Push Notifications → Send Test Notification
```

---

## 📍 Important Routes

### User-Facing Routes
```
/                              → Landing page
/auth/login                    → Login
/auth/register                 → Register
/dashboard                     → Main dashboard
/problems/add                  → Add problem
/revision                      → Revision list
/friends                       → Friends list
/friends/{username}            → Friend profile page (NEW!)
/friends/compare               → Solution comparison (NEW!)
/profile                       → User profile + Push notifications
/ai                           → AI insights
```

### API Endpoints

#### Authentication
```
POST   /api/auth/register      → Register user
POST   /api/auth/login         → Login
GET    /api/auth/me            → Get current user
```

#### Problems
```
GET    /api/problems           → List problems
POST   /api/problems           → Add problem
PUT    /api/problems/{id}      → Update problem
DELETE /api/problems/{id}      → Delete problem
```

#### Friends
```
GET    /api/friends            → List friends (status param)
POST   /api/friends            → Send friend request
POST   /api/friends/{id}/respond → Accept/reject request
GET    /api/friends/dashboard/{username} → Friend profile (NEW!)
```

#### Activity Logs (NEW!)
```
GET    /api/activity           → Get activity logs
POST   /api/activity           → Create activity log
```

#### Push Notifications (NEW!)
```
GET    /api/push/subscribe     → List subscriptions
POST   /api/push/subscribe     → Subscribe
DELETE /api/push/subscribe     → Unsubscribe
POST   /api/push/test          → Send test notification
```

#### Cron Jobs (NEW!)
```
POST   /api/cron/daily-notifications → Daily reminder cron (Protected)
```

#### Analytics
```
GET    /api/analytics          → User analytics
```

#### Revisions
```
GET    /api/revisions          → List revisions
POST   /api/revisions/{id}/complete → Complete revision
```

#### AI Features
```
GET    /api/ai/recommendations → Smart recommendations
POST   /api/ai/analyze-solution → Analyze solution
POST   /api/ai/compare         → Compare solutions
GET    /api/ai/pattern-detection → Detect patterns
POST   /api/ai/weekly-report   → Generate weekly report
GET    /api/ai/confidence      → Confidence score
```

---

## 🗄️ Database Models

### Collections
```
users                  → User accounts
problems               → Problem entries
revisions              → Revision schedules
friendConnections      → Friend relationships
comments               → Problem comments
challenges             → Challenge tracking
achievements           → User achievements
airReports            → AI-generated reports
userStats             → User statistics
notifications          → In-app notifications
activityLogs          → Activity tracking (NEW!)
pushSubscriptions     → Push notification subs (NEW!)
```

---

## 🔐 Environment Variables

### Required
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Push Notifications (NEW!)
```env
VAPID_PUBLIC_KEY=BPx...
VAPID_PRIVATE_KEY=abc...
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BPx...
```

### Security
```env
ADMIN_EMAIL=admin@yourdomain.com
CRON_SECRET=your-cron-secret
ADMIN_SECRET=your-admin-secret
```

### Optional
```env
GROQ_API_KEY=your-groq-key
```

---

## 🔔 Push Notification Flow

### Setup (One-time)
1. Generate VAPID keys: `npx web-push generate-vapid-keys`
2. Add keys to `.env.local`
3. Add NEXT_PUBLIC_VAPID_PUBLIC_KEY to environment

### User Flow
1. User goes to Profile page
2. Clicks "Enable Notifications"
3. Browser asks for permission
4. User grants permission
5. Service worker registers push subscription
6. Subscription saved to database
7. User starts receiving notifications

### Notification Types
- **Streak Reminder**: 8 PM daily (if no problem solved)
- **Revision Reminder**: 7 PM daily (if revisions pending)
- **Friend Activity**: When friend solves problem (coming soon)

---

## 🎯 Key Components

### Client Components
```typescript
// Push notification manager
<PushNotificationManager />

// Authenticated layout wrapper
<AuthenticatedLayout>

// Bottom navigation
<BottomNav />

// Notification bell
<NotificationBell />
```

### API Client Usage
```typescript
import { api } from '@/lib/api-client';

// Get friend profile
const { data, error } = await api.getFriendDashboard(username);

// Subscribe to push
const { data, error } = await api.subscribeToPush(subscription);

// Send test notification
const { data, error } = await api.sendTestNotification();

// Get activity logs
const { data, error } = await api.getActivityLogs({ limit: 10 });
```

---

## 🐛 Debugging

### Check Service Worker
```javascript
// In browser console
navigator.serviceWorker.getRegistrations().then(regs => console.log(regs));
```

### Check Push Subscription
```javascript
// In browser console
navigator.serviceWorker.ready.then(reg => {
  reg.pushManager.getSubscription().then(sub => console.log(sub));
});
```

### Check Notification Permission
```javascript
// In browser console
console.log(Notification.permission);
```

### View Cron Logs
1. Go to Vercel dashboard
2. Select your project
3. Go to "Functions"
4. Find "cron/daily-notifications"
5. View execution logs

---

## 📊 Activity Log Types

```typescript
type ActivityType = 
  | 'problem_solved'         // When user solves a problem
  | 'revision_done'          // When user completes revision
  | 'streak_updated'         // When streak changes
  | 'challenge_joined'       // When user joins challenge
  | 'challenge_completed'    // When user completes challenge
  | 'friend_added'           // When friendship accepted
  | 'achievement_unlocked';  // When achievement earned
```

---

## 🔒 Security Headers

### Cron Job Authentication
```typescript
headers: {
  'Authorization': `Bearer ${process.env.CRON_SECRET}`
}
```

### User Authentication
```typescript
headers: {
  'Authorization': `Bearer ${userToken}`
}
```

---

## 🚀 Deployment Steps

### Vercel
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy
5. Test push notifications
6. Verify cron job execution

### Environment Variables in Vercel
```
Settings → Environment Variables → Add each variable
```

Required variables:
- MONGODB_URI
- JWT_SECRET
- VAPID_PUBLIC_KEY
- VAPID_PRIVATE_KEY
- NEXT_PUBLIC_VAPID_PUBLIC_KEY
- NEXT_PUBLIC_APP_URL
- CRON_SECRET
- ADMIN_SECRET
- ADMIN_EMAIL
- GROQ_API_KEY (optional)

---

## 📱 PWA Features

### Install Prompt
- Appears automatically on mobile browsers
- Shows "Add to Home Screen" option
- Works offline with service worker

### Service Workers
- `/sw.js` - Main service worker (next-pwa)
- `/push-sw.js` - Push notification handler

---

## 🎨 Styling

### Tailwind Classes Used
```css
/* Cards */
.card → bg-dark-300 rounded-2xl p-4 shadow-lg

/* Buttons */
.btn-primary → bg-primary-600 text-white rounded-xl
.btn-secondary → bg-dark-300 text-white rounded-xl

/* Navigation */
.page-content → pb-24 (for bottom nav)
```

### Color Scheme
- Primary: Blue (`primary-600`)
- Success: Green (`green-600`)
- Warning: Amber (`amber-600`)
- Danger: Red (`red-600`)
- Dark: Gray shades (`dark-300`, `dark-400`)

---

## 🧪 Testing Checklist

### Local Testing
- [ ] Enable push notifications
- [ ] Send test notification
- [ ] Add a problem (check activity log)
- [ ] Complete revision (check activity log)
- [ ] View friend profile
- [ ] Check comparison data
- [ ] Test cron job manually

### Production Testing
- [ ] HTTPS enabled (required for push)
- [ ] Service worker registered
- [ ] Push notifications work
- [ ] Cron job executes daily
- [ ] Friend profiles load correctly
- [ ] Activity logs saved properly

---

## 📈 Monitoring

### Key Metrics
- Push subscription success rate
- Cron job execution status
- Activity log creation rate
- Friend profile page views
- Notification delivery rate

### Log Locations
- Vercel Function Logs
- MongoDB Atlas Logs
- Browser Console (client errors)

---

## 🆘 Common Issues

### Push Notifications Not Working
1. Check HTTPS is enabled (required)
2. Verify VAPID keys are correct
3. Check browser support (Chrome, Firefox, Edge)
4. Ensure permission is granted
5. Check service worker registration

### Cron Job Not Running
1. Verify `vercel.json` exists in root
2. Check CRON_SECRET is set
3. View execution logs in Vercel
4. Check API route is accessible

### Friend Profile 404
1. Verify username is correct (lowercase)
2. Check friendship exists in database
3. Verify API route authentication
4. Check database connection

---

## 📚 Documentation Files

- `README.md` - Main project documentation
- `PUSH_NOTIFICATIONS_SETUP.md` - Detailed push notification setup
- `IMPLEMENTATION_SUMMARY.md` - Complete feature summary
- `.env.local.example` - Environment variable template
- This file - Quick reference

---

## 💡 Pro Tips

1. **Test locally first** - Use test notification button
2. **Monitor cron jobs** - Check Vercel dashboard regularly
3. **Clean up data** - Activity logs auto-delete after 90 days
4. **Secure keys** - Never commit `.env.local` to git
5. **Use TypeScript** - All files are strongly typed
6. **Check mobile** - UI is mobile-first
7. **PWA install** - Test "Add to Home Screen"
8. **Cache strategy** - Service worker handles offline mode

---

## 🎯 Next Steps

After deployment:
1. Monitor push notification delivery rates
2. Check cron job logs daily
3. Gather user feedback on friend profiles
4. Plan AI comparison feature integration
5. Add friend activity real-time updates
6. Implement notification preferences

---

**Happy Coding! 🚀**

For detailed setup instructions, see `PUSH_NOTIFICATIONS_SETUP.md`
