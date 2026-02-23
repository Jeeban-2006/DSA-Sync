# 🚀 Final Deployment & Testing Guide

## ✅ Pre-Deployment Checklist

### 1. Environment Setup
```bash
# Install dependencies (if not already done)
npm install

# Generate VAPID keys
npx web-push generate-vapid-keys
```

**Copy the output and save it!**
```
=======================================
Public Key:
BPx... (copy this)

Private Key:
abc... (copy this)
=======================================
```

### 2. Local Environment Variables

Copy the example file and update with your values:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local`:

```env
# Database
MONGODB_URI=your_mongodb_uri

# Authentication
JWT_SECRET=your_jwt_secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Push Notifications (from npx web-push generate-vapid-keys)
VAPID_PUBLIC_KEY=BPx...
VAPID_PRIVATE_KEY=abc...
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BPx...

# Security
ADMIN_EMAIL=your@email.com
CRON_SECRET=random_secure_string_for_cron
ADMIN_SECRET=random_secure_string_for_admin

# AI (Optional)
GROQ_API_KEY=your_groq_key
```

### 3. Local Testing

```bash
# Start development server
npm run dev

# Open browser
http://localhost:3000
```

---

## 🧪 Testing Steps (Local)

### Test 1: Friend Profile System
1. ✅ Register two users (User A and User B)
2. ✅ Log in as User A
3. ✅ Go to Friends page
4. ✅ Send friend request to User B (search by username)
5. ✅ Log in as User B
6. ✅ Accept friend request from User A
7. ✅ Log in as User A
8. ✅ Click on User B's friend card
9. ✅ Verify profile page loads with:
   - Summary stats
   - Recent activity
   - Comparison table
   - Common problems (if any)

**Expected:** Friend profile page displays correctly with all sections.

### Test 2: Activity Logging
1. ✅ Add a new problem
2. ✅ Check database: `activityLogs` collection should have a new entry
3. ✅ Complete a revision
4. ✅ Check database: Another activity log should be created

**Expected:** Activities are automatically logged.

### Test 3: Push Notifications

#### 3A. Enable Notifications
1. ✅ Go to Profile page
2. ✅ Find "Push Notifications" section
3. ✅ Click "Enable Notifications"
4. ✅ Browser asks for permission → Click "Allow"
5. ✅ Status changes to "Notifications Enabled"

**Expected:** Subscription saved in `pushSubscriptions` collection.

#### 3B. Test Notification
1. ✅ Click "Send Test Notification"
2. ✅ Wait 2-3 seconds
3. ✅ Browser notification appears: "✅ Test Notification"
4. ✅ Click the notification
5. ✅ App opens to dashboard

**Expected:** Notification received and clickable.

#### 3C. Manual Cron Test (Admin Only)
```bash
# In terminal (requires ADMIN_SECRET from .env.local)
curl -X GET http://localhost:3000/api/cron/daily-notifications \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET"
```

**Expected:** Response shows:
```json
{
  "message": "Cron job triggered manually",
  "result": {
    "success": true,
    "results": {
      "streakReminders": 0,
      "revisionReminders": 0,
      "errors": 0
    }
  }
}
```

### Test 4: Activity Feed on Friend Profile
1. ✅ Log in as User A
2. ✅ Add a problem
3. ✅ Log in as User B (friend)
4. ✅ Go to User A's profile
5. ✅ Check "Recent Activity" section

**Expected:** Activity should show "Problem solved: [problem name]"

---

## 🌐 Production Deployment (Vercel)

### Step 1: Push Code to GitHub
```bash
git add .
git commit -m "Add collaborative features and push notifications"
git push origin main
```

### Step 2: Vercel Setup

1. **Go to [Vercel](https://vercel.com)**
2. **Import Your Project**
3. **Configure Project**
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

### Step 3: Add Environment Variables

Go to: **Settings → Environment Variables**

Add each variable below:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `MONGODB_URI` | Your MongoDB connection string | All |
| `JWT_SECRET` | Your JWT secret key | All |
| `NEXT_PUBLIC_APP_URL` | `https://yourapp.vercel.app` | Production |
| `VAPID_PUBLIC_KEY` | Your VAPID public key | All |
| `VAPID_PRIVATE_KEY` | Your VAPID private key | All |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Same as VAPID_PUBLIC_KEY | All |
| `ADMIN_EMAIL` | Your admin email | All |
| `CRON_SECRET` | Random secure string | All |
| `ADMIN_SECRET` | Random secure string | All |
| `GROQ_API_KEY` | Your Groq API key | All |

**⚠️ Important:** Make sure `NEXT_PUBLIC_VAPID_PUBLIC_KEY` is set! It's required for client-side push subscription.

### Step 4: Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Note your deployment URL: `https://yourapp.vercel.app`

### Step 5: Verify Deployment
1. Visit your app URL
2. Register a test user
3. Enable push notifications
4. Send test notification

---

## 🔔 Production Testing

### Test 1: Push Notifications on Production

1. ✅ Visit your app (must be HTTPS)
2. ✅ Register/Login
3. ✅ Go to Profile
4. ✅ Enable notifications
5. ✅ Grant browser permission
6. ✅ Click "Send Test Notification"
7. ✅ Verify notification arrives

**Troubleshooting:**
- If no notification: Check browser console for errors
- If permission denied: Clear site data and try again
- If subscription fails: Verify VAPID keys are correct

### Test 2: Verify Cron Job

1. **Go to Vercel Dashboard**
2. **Navigate to:** Your Project → Settings → Cron Jobs
3. **Verify:** `/api/cron/daily-notifications` is listed
4. **Schedule:** `0 20 * * *` (8 PM UTC daily)

**To test manually:**
```bash
# Replace with your production URL and ADMIN_SECRET
curl -X GET https://yourapp.vercel.app/api/cron/daily-notifications \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET"
```

### Test 3: Monitor Cron Execution

**Next day after deployment:**
1. Go to Vercel Dashboard
2. Click on your project
3. Go to "Functions"
4. Find `/api/cron/daily-notifications`
5. View execution logs

**Expected:** Should see execution at 8 PM UTC with results.

### Test 4: Friend Profiles
1. ✅ Add friends in production
2. ✅ Solve some problems
3. ✅ Click friend card
4. ✅ Verify profile loads correctly
5. ✅ Check comparison data

---

## 📊 Monitoring & Maintenance

### Daily Checks (First Week)
- [ ] Check Vercel cron logs
- [ ] Verify notifications are being sent
- [ ] Monitor error logs
- [ ] Check push subscription count

### Weekly Checks
- [ ] Review activity log growth
- [ ] Check invalid subscription cleanup
- [ ] Monitor database size
- [ ] Review user feedback

### Monthly Checks
- [ ] Analyze notification delivery rates
- [ ] Review friend engagement metrics
- [ ] Check for API errors
- [ ] Update dependencies if needed

---

## 🐛 Common Issues & Solutions

### Issue 1: Push Notifications Not Working

**Symptoms:**
- Enable button doesn't work
- No test notification received
- Permission always denied

**Solutions:**
1. **Check HTTPS:** Push only works on HTTPS (localhost is exception)
   ```
   Production must use https://
   ```

2. **Verify VAPID Keys:**
   ```bash
   # Re-generate if needed
   npx web-push generate-vapid-keys
   ```

3. **Check Browser Support:**
   - Chrome: ✅ Full support
   - Firefox: ✅ Full support
   - Safari: ⚠️ Limited (iOS 16.4+)
   - Edge: ✅ Full support

4. **Clear Browser Data:**
   - Settings → Privacy → Clear browsing data
   - Specifically: Site settings and permissions

5. **Check Console Errors:**
   - Open DevTools (F12)
   - Look for errors in Console tab
   - Check Application → Service Workers

### Issue 2: Cron Job Not Running

**Symptoms:**
- No notifications sent at scheduled time
- No logs in Vercel Functions

**Solutions:**
1. **Verify vercel.json exists in root:**
   ```json
   {
     "crons": [{
       "path": "/api/cron/daily-notifications",
       "schedule": "0 20 * * *"
     }]
   }
   ```

2. **Check CRON_SECRET:**
   - Must be set in Vercel environment variables
   - Same in all environments

3. **Verify API Route:**
   ```bash
   curl -X POST https://yourapp.vercel.app/api/cron/daily-notifications \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

4. **Check Vercel Plan:**
   - Cron jobs require Vercel Pro plan for custom schedules
   - Hobby plan: Limited cron functionality

### Issue 3: Friend Profile 404

**Symptoms:**
- Clicking friend shows "Not Found"
- Error in console

**Solutions:**
1. **Check Username:**
   - Usernames are lowercase
   - URL should be: `/friends/username` (not `/friends/UsErNaMe`)

2. **Verify Friendship:**
   - Check `friendConnections` collection
   - Status must be "Accepted"

3. **Check API Route:**
   ```bash
   curl https://yourapp.vercel.app/api/friends/dashboard/username \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

### Issue 4: Activity Logs Not Creating

**Symptoms:**
- Problems solved but no activity log
- Friend profile shows no recent activity

**Solutions:**
1. **Check Problem API:**
   - Verify ActivityLog import exists
   - Check for errors in API logs

2. **Database Connection:**
   - Verify MongoDB URI is correct
   - Check connection in Vercel logs

3. **Manual Test:**
   - Add a problem
   - Check MongoDB `activityLogs` collection
   - Should have new document

---

## 📈 Performance Optimization

### Recommended Settings

1. **Database Indexes** (Already created in models)
   ```javascript
   // ActivityLog
   - userId + createdAt (compound)
   - type + createdAt
   
   // PushSubscription
   - userId + isActive (compound)
   - endpoint (unique)
   ```

2. **Cache Strategy**
   - Service worker caches static assets
   - API responses: No cache (always fresh)
   - Images: Cached for 7 days

3. **API Rate Limiting** (Recommended)
   ```typescript
   // Add to API routes if needed
   // Limit push notifications to 10 per user per day
   ```

---

## 🎯 Success Metrics

After 1 week, you should see:
- ✅ Push subscriptions: 60-80% of active users
- ✅ Cron job: 100% success rate
- ✅ Friend profiles: Regular views
- ✅ Activity logs: Growing daily
- ✅ Notification delivery: 95%+ success

---

## 🔐 Security Checklist

- [ ] VAPID keys stored securely in environment variables
- [ ] CRON_SECRET is strong and random
- [ ] ADMIN_SECRET is strong and random
- [ ] JWT_SECRET is strong (32+ characters)
- [ ] MongoDB connection string uses authentication
- [ ] No sensitive data in client-side code
- [ ] HTTPS enforced in production
- [ ] Service worker only registers on HTTPS

---

## 🎉 You're Done!

Your DSA Tracker now has:
- ✅ Comprehensive friend profiles
- ✅ Activity tracking system
- ✅ Smart push notifications
- ✅ Automatic daily reminders
- ✅ Scalable architecture
- ✅ Production-ready deployment

### Next Steps:
1. Monitor usage for first week
2. Gather user feedback
3. Plan AI comparison feature
4. Add friend activity real-time feed
5. Implement notification preferences

---

## 📞 Get Help

If you encounter issues:
1. Check this guide first
2. Review `PUSH_NOTIFICATIONS_SETUP.md`
3. Check `QUICK_REFERENCE.md`
4. View browser console logs
5. Check Vercel function logs
6. Review MongoDB logs

---

**Congratulations! Your app is live! 🚀**

Share it with friends and start tracking DSA progress together!
