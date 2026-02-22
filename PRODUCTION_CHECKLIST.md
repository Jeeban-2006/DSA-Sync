# 🚀 Production Deployment Checklist

## Pre-Deployment

### 1. Environment Variables
- [ ] Copy `.env.local.example` to `.env.local` (or `.env.production`)
- [ ] Set `MONGODB_URI` to your production MongoDB Atlas connection string
- [ ] Generate secure `JWT_SECRET` (use: `node scripts/generate-secrets.js`)
- [ ] Set `GROQ_API_KEY` from https://console.groq.com
- [ ] Update `NEXT_PUBLIC_APP_URL` to your production URL
- [ ] Ensure `AI_PROVIDER=groq`

### 2. Database Setup
- [ ] MongoDB Atlas cluster created
- [ ] Database user created with appropriate permissions
- [ ] Network access configured (allow connections from deployment platform)
- [ ] Connection string tested locally

### 3. Security
- [ ] `.env.local` is in `.gitignore` (✅ Already done)
- [ ] All API keys are in environment variables (not hardcoded)
- [ ] JWT_SECRET is strong and unique
- [ ] CORS settings reviewed (if needed)

### 4. Code Quality
- [ ] Run `npm run lint` - no errors
- [ ] Run `npm run build` - successful build
- [ ] Test all critical routes locally
- [ ] Remove all console.log statements (optional)

### 5. Dependencies
- [ ] Run `npm audit` and review vulnerabilities
- [ ] Unused dependencies removed (✅ OpenAI removed)
- [ ] All dependencies up to date (`npm outdated`)

---

## Deployment Platforms

### Vercel (Recommended for Next.js)

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Deploy via GitHub**:
   - Push code to GitHub
   - Go to https://vercel.com
   - Import your GitHub repository
   - Configure environment variables in Vercel dashboard
   - Deploy!

3. **Environment Variables in Vercel**:
   - Add all variables from `.env.local.example`
   - Use Vercel dashboard: Settings → Environment Variables

4. **Custom Domain** (optional):
   - Go to Settings → Domains
   - Add your custom domain
   - Configure DNS records

### Railway

1. **Deploy**:
   - Go to https://railway.app
   - Create new project from GitHub
   - Add environment variables
   - Deploy

### Render

1. **Deploy**:
   - Go to https://render.com
   - Create new Web Service
   - Connect GitHub repository
   - Set build command: `npm run build`
   - Set start command: `npm start`
   - Add environment variables

---

## Post-Deployment

### 1. Test Critical Paths
- [ ] User registration works
- [ ] User login works
- [ ] Landing page loads correctly
- [ ] Dashboard loads with authentication
- [ ] Problem tracking works
- [ ] AI features work (test at least one)
- [ ] Friend system works
- [ ] Analytics display correctly

### 2. Monitor
- [ ] Check Vercel/platform logs for errors
- [ ] Monitor MongoDB Atlas metrics
- [ ] Check Groq API usage dashboard
- [ ] Set up error tracking (optional: Sentry)

### 3. Performance
- [ ] Lighthouse score check
- [ ] Page load times acceptable
- [ ] API response times acceptable
- [ ] Images optimized

---

## Environment Variables Reference

```env
# Production .env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dsa-sync?retryWrites=true&w=majority
JWT_SECRET=<generate-secure-random-string>
GROQ_API_KEY=<your-groq-api-key>
NEXT_PUBLIC_APP_URL=https://your-domain.com
AI_PROVIDER=groq
```

---

## Troubleshooting

### Build fails
- Check all imports are correct
- Ensure all environment variables are set
- Check logs for specific error

### AI features not working
- Verify GROQ_API_KEY is set correctly
- Check Groq API dashboard for errors
- Ensure AI_PROVIDER=groq

### Database connection fails
- Check MongoDB Atlas network access
- Verify connection string format
- Ensure database user has correct permissions

### Authentication issues
- Verify JWT_SECRET is set
- Check if cookies are being sent (HTTPS required in production)
- Ensure NEXT_PUBLIC_APP_URL matches your domain

---

## Quick Commands

```bash
# Test build locally
npm run build

# Run production build locally
npm start

# Lint code
npm run lint

# Generate secure secrets
node scripts/generate-secrets.js

# Check for security vulnerabilities
npm audit

# Update dependencies
npm outdated
npm update
```

---

## Vercel Deployment (Step-by-Step)

### Option 1: Via Vercel Dashboard

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for production"
   git push origin main
   ```

2. **Import on Vercel**:
   - Go to https://vercel.com/new
   - Select your repository
   - Click "Import"

3. **Configure Project**:
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: ./
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

4. **Add Environment Variables**:
   ```
   MONGODB_URI = <your-value>
   JWT_SECRET = <your-value>
   GROQ_API_KEY = <your-value>
   NEXT_PUBLIC_APP_URL = <will-be-your-vercel-url>
   AI_PROVIDER = groq
   ```

5. **Deploy**: Click "Deploy"

6. **Update NEXT_PUBLIC_APP_URL**:
   - After first deployment, copy your Vercel URL
   - Update `NEXT_PUBLIC_APP_URL` in environment variables
   - Redeploy

### Option 2: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

---

## Security Checklist

- [x] `.env.local` is gitignored
- [x] No hardcoded secrets in code
- [x] JWT_SECRET is secure (32+ characters)
- [x] MongoDB has authentication enabled
- [x] API keys are environment variables only
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Rate limiting configured (optional)
- [ ] Input validation on all forms
- [ ] SQL injection prevention (using Mongoose)
- [ ] XSS prevention (using React)

---

## Performance Optimization

### Already Optimized
- ✅ Next.js Image optimization
- ✅ Dynamic imports for Three.js
- ✅ PWA configuration
- ✅ Server-side rendering
- ✅ API route caching headers

### Additional Optimizations (Optional)
- [ ] Add CDN for assets
- [ ] Enable Next.js ISR for static pages
- [ ] Add Redis for caching (if needed)
- [ ] Optimize images further
- [ ] Add service worker caching

---

## Monitoring & Analytics

### Recommended Tools (Free Tiers Available)
- **Error Tracking**: Sentry
- **Analytics**: Vercel Analytics (built-in)
- **Uptime Monitoring**: UptimeRobot
- **Performance**: Lighthouse CI

---

## Success Criteria

Your deployment is successful when:
- ✅ Site loads at production URL
- ✅ Users can register and login
- ✅ Dashboard displays correctly
- ✅ Problems can be tracked
- ✅ AI features generate responses
- ✅ No console errors in browser
- ✅ Lighthouse score > 90

---

## Support

If you encounter issues:
1. Check deployment logs
2. Review environment variables
3. Test MongoDB connection
4. Verify Groq API key
5. Check browser console for errors

---

**Your DSA Sync app is ready for production! 🎉**
