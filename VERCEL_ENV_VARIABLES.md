# Vercel Environment Variables Setup

> ⚠️ **IMPORTANT:** The values shown below are placeholders. Use your actual values from `.env.local` file when setting up Vercel.

## 🔑 Complete List of Environment Variables for Vercel

Copy and paste these environment variables into your Vercel project settings.

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

---

## ✅ REQUIRED (Core Functionality)

These are mandatory for the app to work:

```env
MONGODB_URI=your-mongodb-connection-string-here

JWT_SECRET=your-jwt-secret-here

GROQ_API_KEY=your-groq-api-key-here

AI_PROVIDER=groq

NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
```

> ⚠️ **Important:** After first deployment, update `NEXT_PUBLIC_APP_URL` with your actual Vercel URL and redeploy!

---

## ✅ REQUIRED (Push Notifications)

For browser push notifications to work:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key-here

VAPID_PRIVATE_KEY=your-vapid-private-key-here

ADMIN_EMAIL=admin@dsasync.com
```

---

## ✅ REQUIRED (Cron Jobs & Daily Notifications)

For automated daily notifications and scheduled tasks:

```env
CRON_SECRET=your-cron-secret-here

ADMIN_SECRET=your-admin-secret-here
```

> 📌 **Note:** These secrets authenticate your Vercel Cron jobs defined in `vercel.json`. Without them, daily notifications won't work.

---

## 📧 OPTIONAL (Email Notifications)

Only add these if you want email notifications (in addition to push notifications):

```env
EMAIL_HOST=smtp.gmail.com

EMAIL_PORT=587

EMAIL_USER=your-email@gmail.com

EMAIL_PASSWORD=your-gmail-app-password

EMAIL_FROM=DSA Sync <noreply@dsasync.com>
```

### How to Get Gmail App Password:

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification**
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Select app: **Mail**
5. Select device: **Other (Custom name)** → Enter "DSA Sync"
6. Click **Generate**
7. Copy the 16-character password (remove spaces when pasting)

---

## 📋 Complete Quick Copy (All Variables)

Copy this entire block and add to Vercel one by one:

```env
# === CORE (REQUIRED) ===
MONGODB_URI=your-mongodb-connection-string-here
JWT_SECRET=your-jwt-secret-here
GROQ_API_KEY=your-groq-api-key-here
AI_PROVIDER=groq
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app

# === PUSH NOTIFICATIONS (REQUIRED) ===
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key-here
VAPID_PRIVATE_KEY=your-vapid-private-key-here
ADMIN_EMAIL=admin@dsasync.com

# === CRON JOBS (REQUIRED) ===
CRON_SECRET=your-cron-secret-here
ADMIN_SECRET=your-admin-secret-here

# === EMAIL (OPTIONAL) ===
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
EMAIL_FROM=DSA Sync <noreply@dsasync.com>
```

---

## 🎯 Step-by-Step Vercel Setup

### 1. Add Environment Variables

For each variable:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Click **"Add New"**
3. Enter **Name** (e.g., `MONGODB_URI`)
4. Enter **Value** (e.g., your MongoDB connection string)
5. Select Environment: **Production, Preview, Development** (select all 3)
6. Click **"Save"**

### 2. Important: Update After First Deployment

After your first deployment, you'll get a URL like: `https://dsa-sync-xyz123.vercel.app`

**You MUST update:**
1. Go back to Environment Variables
2. Find `NEXT_PUBLIC_APP_URL`
3. Click "Edit"
4. Change to your actual Vercel URL: `https://dsa-sync-xyz123.vercel.app`
5. Save
6. Click **"Redeploy"** button in Deployments tab

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] App loads at your Vercel URL
- [ ] Login works (test with registration)
- [ ] Can add problems manually
- [ ] AI features work (analyze solution, recommendations)
- [ ] Push notifications permission prompt appears
- [ ] Test notification button works in Profile
- [ ] Import features work (CSV, Codeforces, etc.)
- [ ] Revision marking and scheduling works
- [ ] Check Vercel logs for any errors

---

## 🔧 Troubleshooting

### App URL Issues
If styles are broken or API calls fail:
- Verify `NEXT_PUBLIC_APP_URL` matches your Vercel URL exactly
- Redeploy after changing

### Push Notifications Not Working
- Ensure `NEXT_PUBLIC_VAPID_PUBLIC_KEY` is exactly correct
- Check browser console for errors
- Try in incognito/private mode

### Cron Jobs Not Running
- Verify `CRON_SECRET` is set in Vercel
- Check that `vercel.json` has cron configuration
- Check Vercel Function Logs

### MongoDB Connection Errors
- Verify connection string is URL-encoded (special characters)
- Check MongoDB Atlas → Network Access → Allow 0.0.0.0/0
- Verify database user permissions

---

## 🚀 All Set!

Once all environment variables are added and the app is deployed, you're ready to go! 🎉

**Next Steps:**
1. Share your app URL with friends
2. Test all features
3. Monitor Vercel logs for any issues
4. Enjoy tracking your DSA progress!
