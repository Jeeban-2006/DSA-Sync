# Quick Deployment Guide - Vercel

## 🚀 Deploy DSA Sync to Vercel

### Step 1: Push to GitHub ✅
Already done! Your code is at: https://github.com/Jeeban-2006/DSA-Sync

### Step 2: Import Project to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Click **"Import"** next to your GitHub repository: `Jeeban-2006/DSA-Sync`
4. Click **"Import"**

### Step 3: Configure Environment Variables

In the "Configure Project" page, add these environment variables:

#### Required (Core Functionality)

```bash
# Database
MONGODB_URI=your-mongodb-connection-string

# Authentication
JWT_SECRET=your-jwt-secret-key

# AI Features
GROQ_API_KEY=your-groq-api-key
AI_PROVIDER=groq

# App URL (will be updated after deployment)
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
```

#### Required (Notifications - Browser Push)

```bash
# Push Notifications (VAPID Keys)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BE2M3nQaLbzhPLfm2AOoxwbxBCTgINpMBBOxr4S02rs5eK4CB--qDnb-2FoOeWFXsuhk02sYujW6fA4b14TnEiw
VAPID_PRIVATE_KEY=AxEnA7HWoTz2cpizjvbGf_5gEcZFbIb6r2xA-DrOvXg
```

#### Optional (Email Notifications)

```bash
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
EMAIL_FROM=DSA Sync <noreply@dsasync.com>
```

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for deployment to complete (~2-3 minutes)
3. You'll get a URL like: `https://dsa-sync.vercel.app`

### Step 5: Update App URL

1. Go back to Vercel Dashboard
2. Click on your project
3. Go to **Settings** → **Environment Variables**
4. Update `NEXT_PUBLIC_APP_URL` with your actual Vercel URL
5. Click **"Redeploy"** to apply changes

---

## 📧 Email Setup (Optional but Recommended)

### For Gmail:

1. **Enable 2-Factor Authentication:**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Step Verification

2. **Generate App Password:**
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select app: **Mail**
   - Select device: **Other (Custom name)** → Enter "DSA Sync"
   - Click **Generate**
   - Copy the 16-character password

3. **Add to Vercel:**
   ```bash
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # The app password (remove spaces)
   ```

### For Other Email Providers:

**SendGrid (Recommended for production):**
```bash
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
```

**Mailgun:**
```bash
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=postmaster@your-domain.mailgun.org
EMAIL_PASSWORD=your-mailgun-smtp-password
```

**AWS SES:**
```bash
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=your-smtp-username
EMAIL_PASSWORD=your-smtp-password
```

---

## 🔔 Testing Notifications

After deployment:

1. **Login to your app**
2. **Go to Profile → Notifications tab**
3. **Enable push notifications** (browser will ask for permission)
4. **Click test buttons** (Streak, Revision, Achievement)
5. **Check:**
   - Browser notification appears ✅
   - In-app notification shows in bell ✅
   - Email arrives in inbox ✅ (if configured)

---

## ⚠️ Common Issues & Solutions

### Issue 1: Push Notifications Not Working

**Symptom:** No browser notifications appear

**Solutions:**
- Verify `NEXT_PUBLIC_VAPID_PUBLIC_KEY` is correct (must start with "BE2M...")
- Check browser console for errors
- Ensure HTTPS (Vercel provides this automatically)
- Try in Chrome/Edge/Firefox (Safari iOS 16.4+ only)
- Clear site data and try again

**Test in Console:**
```javascript
Notification.requestPermission()
navigator.serviceWorker.getRegistration()
```

### Issue 2: Email Not Sending

**Symptom:** Test notification succeeds but no email

**Solutions:**
- Check spam folder
- Verify Gmail app password (not regular password)
- Ensure `EMAIL_PORT=587` (not 465 or 25)
- Check Vercel logs for SMTP errors
- Try SendGrid for production (more reliable)

### Issue 3: MongoDB Connection Error

**Symptom:** 500 errors, can't login/save data

**Solutions:**
- Verify `MONGODB_URI` is correctly formatted
- Check MongoDB Atlas IP whitelist (allow all: `0.0.0.0/0`)
- Ensure database user has read/write permissions
- Check Vercel logs for specific error

### Issue 4: AI Features Not Working

**Symptom:** AI analysis/insights unavailable

**Solutions:**
- Verify `GROQ_API_KEY` is correct
- Check Groq API quota/limits
- Ensure `AI_PROVIDER=groq` is set
- Check Vercel logs for API errors

---

## 🔒 Security Checklist

- ✅ All secrets in environment variables (never in code)
- ✅ `.env.local` gitignored
- ✅ Clean git history (no exposed keys)
- ✅ VAPID keys unique to your app
- ✅ JWT secret is strong random string
- ✅ MongoDB connection uses SSL
- ✅ Email uses TLS encryption

---

## 📊 Post-Deployment Monitoring

### Vercel Dashboard

1. **Deployment Logs:**
   - Check for build errors
   - Verify all environment variables loaded

2. **Function Logs:**
   - Monitor API route performance
   - Check for runtime errors

3. **Analytics:**
   - Track page views
   - Monitor load times

### MongoDB Atlas

1. **Connection Monitoring:**
   - Active connections
   - Peak usage times

2. **Performance:**
   - Slow queries
   - Index usage

### Notification Metrics

Track in your app:
- Notification send rate
- Open rate (click-through)
- User preferences (opt-out rate)
- Email bounce rate

---

## 🚀 Performance Tips

1. **Enable Vercel Edge Network** (automatic)
2. **Use Incremental Static Regeneration** for public pages
3. **Add Redis caching** for frequent queries (optional)
4. **Monitor function execution time** (keep under 10s)
5. **Optimize images** with Next.js Image component

---

## 🔄 Updating Your App

### Method 1: Git Push (Automatic)

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Vercel automatically redeploys on push to `main` branch.

### Method 2: Manual Redeploy

1. Go to Vercel Dashboard
2. Click on your project
3. Click **"Redeploy"** button

---

## 🌐 Custom Domain (Optional)

1. **Buy domain** (Namecheap, GoDaddy, Cloudflare, etc.)
2. **Add to Vercel:**
   - Project Settings → Domains
   - Enter your domain: `dsasync.com`
   - Follow DNS instructions
3. **Update `NEXT_PUBLIC_APP_URL`:**
   ```bash
   NEXT_PUBLIC_APP_URL=https://dsasync.com
   ```
4. **Redeploy**

---

## 📱 PWA Installation

Your app is a Progressive Web App! Users can install it:

**Desktop:**
- Chrome: Click install icon in address bar
- Edge: Settings → Apps → Install DSA Sync

**Mobile:**
- Chrome Android: Add to Home Screen
- Safari iOS: Share → Add to Home Screen

**Features:**
- Works offline (cached content)
- Push notifications
- Native app feel
- Faster load times

---

## 📞 Support & Resources

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **MongoDB Atlas:** https://www.mongodb.com/docs/atlas
- **Web Push:** https://web.dev/push-notifications-overview/
- **Nodemailer:** https://nodemailer.com/about/

---

## ✅ Deployment Complete!

Your DSA Sync app is now live with:
- 🌐 Global CDN (Vercel Edge)
- 🔐 HTTPS encryption
- 🔔 Push notifications
- 📧 Email notifications
- 🤖 AI-powered insights
- 📊 Real-time analytics
- 👥 Social features
- 🔥 Streak tracking
- 📚 Spaced repetition

**Share your app URL and start tracking DSA problems!** 🎉

---

## 🎯 Next Steps

1. **Share with friends** - Get feedback
2. **Monitor usage** - Check Vercel analytics
3. **Set up cron jobs** - Automate daily notifications
4. **Custom domain** - Professional branding
5. **SEO optimization** - Add to search engines
6. **Social media** - Share on Twitter/LinkedIn

**Good luck with your DSA journey!** 💪
