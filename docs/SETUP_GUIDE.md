# 🚀 Quick Setup Guide - DSA Sync

Get the DSA Sync platform running locally in 5 minutes.

## Prerequisites Checklist

Before starting, make sure you have:

- [ ] **Node.js 18+** installed ([Download](https://nodejs.org/))
- [ ] **MongoDB** running locally OR **MongoDB Atlas** account ([Sign up](https://www.mongodb.com/cloud/atlas))
- [ ] **Groq API Key** ([Get one](https://console.groq.com))
- [ ] **Git** installed
- [ ] **Code Editor** (VS Code recommended)

---

## 🎯 Step-by-Step Setup

### Step 1: Install Dependencies

Open terminal in project directory:

```bash
npm install
```

**Expected output**: All packages installed successfully (should take 1-2 minutes)

---

### Step 2: Set Up MongoDB

#### Option A: Local MongoDB

If you have MongoDB installed locally:

```bash
# Start MongoDB service
# On macOS/Linux:
sudo systemctl start mongodb
# or
brew services start mongodb-community

# On Windows:
net start MongoDB
```

Your connection string: `mongodb://localhost:27017/dsa-sync`

#### Option B: MongoDB Atlas (Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free (M0 Sandbox - 512MB)
3. Create a new cluster (takes 3-5 minutes)
4. Go to "Database Access" → Add Database User
   - Username: `dsauser`
   - Password: Generate a secure password
   - Access: "Read and write to any database"
5. Go to "Network Access" → Add IP Address
   - For development: `0.0.0.0/0` (allow all)
   - For production: Add specific IPs
6. Get connection string:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password

Your connection string looks like:
```
mongodb+srv://dsauser:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/dsa-sync?retryWrites=true&w=majority
```

---

### Step 3: Get Groq API Key

1. Go to [Groq Console](https://console.groq.com)
2. Sign in or create account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)
5. Keep it safe (you won't see it again!)

**Note**: Groq offers free tier with fast Llama models.

---

### Step 4: Configure Environment Variables

Create `.env.local` file in project root:

**macOS/Linux**:
```bash
cat > .env.local << 'EOF'
MONGODB_URI=mongodb://localhost:27017/dsa-sync
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
GROQ_API_KEY=gsk-your-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
AI_PROVIDER=groq
EOF
```

**Windows PowerShell**:
```powershell
@"
MONGODB_URI=mongodb://localhost:27017/dsa-sync
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
GROQ_API_KEY=gsk-your-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
AI_PROVIDER=groq
"@ | Out-File -FilePath .env.local -Encoding utf8
```

**Or manually create** `.env.local`:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/dsa-sync

# JWT Secret (use the command below to generate)
JWT_SECRET=your-generated-secret-here

# Groq AI API Key
GROQ_API_KEY=gsk-your-groq-key-here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# AI Provider
AI_PROVIDER=groq
```

**Generate JWT Secret**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste it as `JWT_SECRET` value.

**Important**: Replace these values:
- `MONGODB_URI`: Your actual MongoDB connection string
- `JWT_SECRET`: Generated secret (32+ characters)
- `GROQ_API_KEY`: Your actual Groq API key

---

### Step 5: Verify Configuration

Check if everything is set up correctly:

```bash
# Verify Node.js version
node --version
# Should show v18.x.x or higher

# Verify environment variables
cat .env.local
# or on Windows:
type .env.local
```

---

### Step 6: Start Development Server

```bash
npm run dev
```

**Expected output**:
```
   ▲ Next.js 14.1.0
   - Local:        http://localhost:3000
   - Network:      http://192.168.x.x:3000

 ✓ Ready in 2.5s
```

---

### Step 7: Open Application

Open your browser and navigate to:

**http://localhost:3000**

You should see the DSA Sync landing page!

---

## 🎉 First Time Setup Walkthrough

### 1. Register an Account

1. Click "Register" or navigate to `/auth/register`
2. Fill in:
   - **Name**: Your full name
   - **Email**: Your email address
   - **Username**: Choose a unique username (alphanumeric only)
   - **Password**: Minimum 6 characters
3. Click "Create Account"
4. You'll be automatically logged in

### 2. Add Your First Problem

1. Navigate to "Add Problem" (+ icon in bottom navigation)
2. Fill in the details:
   - **Problem Name**: e.g., "Two Sum"
   - **Platform**: Select from dropdown (LeetCode, Codeforces, etc.)
   - **Difficulty**: Easy, Medium, or Hard
   - **Topic**: Select topic (Array, Tree, DP, etc.)
   - **Time Taken**: Minutes spent solving
   - **Date Solved**: When you solved it
   - **Your Approach**: Describe your solution
   - **Mistakes**: What went wrong initially
   - **Key Learning**: Main takeaway
   - **Code** (optional): Paste your solution
   - **Mark for Revision**: Check to enable smart revisions
3. Submit

**You'll earn XP!** 🎉

### 3. View Your Dashboard

Click "Dashboard" to see:
- Total problems solved
- Current streak
- Difficulty distribution (pie chart)
- Topic breakdown (bar chart)
- Recent activity

### 4. Try AI Features

Navigate to "AI Insights" (brain icon):

**Note**: AI features require minimum problems:
- **Recommendations**: 5+ problems
- **Weekly Report**: 10+ problems
- **Confidence Score**: 20+ problems
- **Pattern Detection**: 50+ problems

### 5. Add a Friend

1. Go to "Friends" tab
2. Search by username
3. Click "Send Request"
4. Wait for them to accept
5. View their dashboard or compare solutions

---

## 📱 Test PWA Installation

### On Mobile (Android)

1. Open http://YOUR_IP:3000 on mobile browser
   - Find your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
   - Example: http://192.168.1.100:3000
2. Tap browser menu (⋮)
3. Select "Add to Home Screen"
4. App installs and appears on home screen

### On Desktop (Chrome/Edge)

1. Look for install icon (⊕) in address bar
2. Click "Install"
3. App opens in standalone window

---

## ⚙️ Development Tips

### Hot Reload

Any changes you make to files will automatically refresh the browser (Fast Refresh).

### View Console Logs

- **Server logs**: Check your terminal where `npm run dev` is running
- **Client logs**: Open browser DevTools (F12) → Console tab

### Database Access

**Using MongoDB Compass** (GUI):

1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect using your connection string
3. Browse collections: `users`, `problems`, `revisions`, etc.

**Using MongoDB Shell**:

```bash
# Connect to local MongoDB
mongosh

# Use database
use dsa-sync

# View collections
show collections

# Query users
db.users.find().pretty()

# Query problems
db.problems.find({ userId: ObjectId("...") }).pretty()
```

---

## 🐛 Troubleshooting

### Issue: Port 3000 already in use

**Solution**:
```bash
# Find process using port 3000
# On macOS/Linux:
lsof -ti:3000 | xargs kill -9

# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Or use different port:
npm run dev -- -p 3001
```

---

### Issue: MongoDB connection failed

**Error**: `MongooseServerSelectionError: connect ECONNREFUSED`

**Solutions**:

1. **Local MongoDB not running**:
   ```bash
   # Start MongoDB
   sudo systemctl start mongodb
   # or
   brew services start mongodb-community
   ```

2. **Wrong connection string**:
   - Check `.env.local` for correct `MONGODB_URI`
   - For Atlas: Ensure password doesn't contain special characters (URL encode if it does)

3. **IP not whitelisted** (Atlas):
   - Go to Atlas → Network Access
   - Add your IP or use `0.0.0.0/0` for development

---

### Issue: Groq AI API errors

**Error**: `401 Unauthorized` or `429 Rate Limit`

**Solutions**:

1. **Invalid API key**:
   - Check `.env.local` has correct `GROQ_API_KEY`
   - Verify key is active on Groq console

2. **No credits**:
   - Check your Groq account limits
   - Groq offers generous free tier

3. **Rate limit**:
   - Wait a few seconds and try again
   - Reduce AI feature usage frequency

---

### Issue: Environment variables not loading

**Error**: `JWT_SECRET is not defined`

**Solutions**:

1. **File name wrong**:
   - Must be `.env.local` (not `.env` or `env.local`)
   - Check for typos

2. **Restart dev server**:
   ```bash
   # Stop server (Ctrl+C)
   # Start again:
   npm run dev
   ```

3. **Check file location**:
   - `.env.local` must be in project root (same level as `package.json`)

---

### Issue: Can't create account (email exists)

**Error**: `User already exists`

**Solution**:

Delete the user from MongoDB:

```bash
mongosh
use dsa-sync
db.users.deleteOne({ email: "your-email@example.com" })
```

---

### Issue: UI not updating

**Solutions**:

1. **Hard refresh**: Ctrl+Shift+R (Cmd+Shift+R on Mac)
2. **Clear cache**: DevTools → Application → Clear storage
3. **Delete `.next` folder**:
   ```bash
   rm -rf .next
   npm run dev
   ```

---

## 📊 Seed Sample Data (Optional)

Want some initial data to test with?

Create `scripts/seed.js`:

```javascript
// Run: node scripts/seed.js
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// Add seed script here (omitted for brevity)
```

---

## 🔨 Build for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm start
```

Production build is optimized and ready for deployment.

---

## 📚 Next Steps

Now that your app is running:

1. ✅ **Explore Features**: Try all features (problems, revisions, friends, AI)
2. ✅ **Customize**: Modify colors in [tailwind.config.ts](../tailwind.config.ts)
3. ✅ **Deploy**: Follow [DEPLOYMENT.md](./DEPLOYMENT.md)
4. ✅ **API Testing**: Use [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

## 🆘 Getting Help

### Resources

- **README**: [README.md](../README.md) - Full documentation
- **API Docs**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Database**: [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
- **Deployment**: [DEPLOYMENT.md](./DEPLOYMENT.md)

### Common Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Clean build cache
rm -rf .next

# Check for errors
npm run build

# Update dependencies
npm update
```

---

## ✅ Setup Verification Checklist

Before proceeding, verify:

- [ ] Node.js 18+ installed (`node --version`)
- [ ] Dependencies installed (`node_modules` folder exists)
- [ ] MongoDB connected (check terminal logs for "MongoDB Connected")
- [ ] `.env.local` file created with all variables
- [ ] Groq API key valid
- [ ] Dev server running on http://localhost:3000
- [ ] Can register and login
- [ ] Can add a problem
- [ ] Can view dashboard

**All checked?** You're ready to code! 🎉

---

## 🎨 Customization Ideas

Want to make it your own?

1. **Change Theme Colors**: Edit [tailwind.config.ts](../tailwind.config.ts)
2. **Add New Topics**: Modify `TOPICS` array in [app/problems/add/page.tsx](../app/problems/add/page.tsx)
3. **Custom XP Rules**: Edit `calculateXP()` in [lib/utils.ts](../lib/utils.ts)
4. **New AI Features**: Add prompts in [lib/ai-service.ts](../lib/ai-service.ts)

---

**Setup Complete! Happy Coding! 🚀**
