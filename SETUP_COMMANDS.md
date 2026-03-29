# 🚀 DSA Sync - Setup & Production Commands

## 📋 **Quick Setup Guide**

Follow these commands in order to set up and prepare your project for production.

---

## 1️⃣ **Initial Setup** (First Time Only)

### Install Dependencies
```bash
npm install
```

### Set Up Environment Variables
1. Copy the example environment file:
```bash
copy .env.local.example .env.local
```

2. Edit `.env.local` and add your credentials:
   - MongoDB URI (from MongoDB Atlas)
   - JWT Secret (generate using command below)
   - Groq API Key (from https://console.groq.com)
   - VAPID Keys (generate using command below)

### Generate Secrets
```bash
# Generate JWT Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate CRON Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate Admin Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate VAPID Keys for Push Notifications
npx web-push generate-vapid-keys
```

---

## 2️⃣ **Production Preparation** (Required Before Deployment)

### Install Sharp (Image Processing)
```bash
npm install --save-dev sharp
```

### Generate PWA Icons
```bash
npm run generate-icons
```

### Clean Up Documentation Files
```bash
npm run cleanup-docs
```

---

## 3️⃣ **Development Commands**

### Start Development Server
```bash
npm run dev
```
Access at: http://localhost:3000

### Run Linter
```bash
npm run lint
```

---

## 4️⃣ **Production Build & Test**

### Build for Production
```bash
npm run build
```

### Test Production Build Locally
```bash
npm start
```

### Run All Production Checks
```bash
npm install --save-dev sharp
npm run generate-icons
npm run cleanup-docs
npm run build
npm start
```

---

## 5️⃣ **Deployment to Vercel**

### Option A: Via Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Deploy to Production:
```bash
vercel --prod
```

### Option B: Via GitHub Integration

1. Push your code to GitHub:
```bash
git add .
git commit -m "Production ready"
git push origin main
```

2. Go to https://vercel.com/dashboard
3. Click "Import Project"
4. Select your GitHub repository
5. Add environment variables in Vercel dashboard
6. Deploy!

---

## 6️⃣ **Environment Variables for Vercel**

Add these in Vercel Dashboard → Settings → Environment Variables:

### Required (Critical)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dsa-sync?retryWrites=true&w=majority
JWT_SECRET=your-generated-jwt-secret
GROQ_API_KEY=your-groq-api-key
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### Optional (For Full Features)
```
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
ADMIN_EMAIL=admin@yourdomain.com
CRON_SECRET=your-generated-cron-secret
ADMIN_SECRET=your-generated-admin-secret
AI_PROVIDER=groq
```

---

## 7️⃣ **MongoDB Atlas Setup**

1. Go to https://cloud.mongodb.com
2. Create a free account
3. Create a new cluster (free tier)
4. Go to "Database Access" → Add Database User
5. Go to "Network Access" → Add IP Address
   - For development: Add your current IP
   - For production: Add `0.0.0.0/0` (allow all)
6. Go to "Database" → Connect → Get connection string
7. Replace `<username>`, `<password>`, and `<dbname>` in the connection string
8. Add to `.env.local` as `MONGODB_URI`

---

## 8️⃣ **Useful Commands Reference**

### Package Management
```bash
npm install              # Install dependencies
npm update              # Update packages
npm audit fix           # Fix security vulnerabilities
```

### Development
```bash
npm run dev             # Start dev server
npm run lint            # Run ESLint
npm run build           # Build for production
npm start               # Start production server
```

### Custom Scripts
```bash
npm run generate-icons  # Generate PWA icons from SVG
npm run cleanup-docs    # Remove unnecessary documentation
```

### Git Commands
```bash
git status              # Check changes
git add .               # Stage all changes
git commit -m "message" # Commit changes
git push origin main    # Push to GitHub
```

---

## 9️⃣ **Troubleshooting**

### Issue: "Module not found" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Build fails
```bash
npm run lint            # Check for code errors
npm run build           # See detailed error
```

### Issue: MongoDB connection fails
- Check MONGODB_URI in `.env.local`
- Verify IP whitelist in MongoDB Atlas
- Check username/password in connection string

### Issue: PWA icons still 404
```bash
npm install --save-dev sharp
npm run generate-icons
```

### Issue: Notifications not working
- Check if user is logged in
- Verify JWT_SECRET is set
- Enable notifications in user settings
- Check browser console for errors

---

## 🎯 **Complete Production Checklist**

Before deploying to production, verify:

- [ ] `npm install --save-dev sharp` completed
- [ ] `npm run generate-icons` completed (check public/icons folder)
- [ ] `npm run cleanup-docs` completed (only README.md remains)
- [ ] `npm run build` succeeds without errors
- [ ] MongoDB Atlas cluster created and IP whitelisted
- [ ] All environment variables added to Vercel
- [ ] VAPID keys generated for push notifications
- [ ] Test the production build locally with `npm start`
- [ ] Code pushed to GitHub repository
- [ ] Vercel project created and deployed
- [ ] Custom domain configured (optional)

---

## 📞 **Need Help?**

If you encounter any issues:
1. Check the error message carefully
2. Verify all environment variables are set correctly
3. Ensure MongoDB Atlas IP whitelist includes your server
4. Check Vercel deployment logs for errors
5. Review the README.md for detailed documentation

---

## ✅ **You're Ready to Deploy!**

Once all commands run successfully and the build completes, your app is production-ready! 🎉

**Happy Coding!** 🚀
