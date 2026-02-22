# 🚢 DSA Sync - Deployment Guide

This guide covers deployment options for the DSA Sync platform across various hosting providers.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [MongoDB Setup](#mongodb-setup)
4. [Deployment Options](#deployment-options)
   - [Vercel (Recommended)](#vercel-recommended)
   - [Railway](#railway)
   - [DigitalOcean](#digitalocean)
   - [AWS](#aws)
5. [Post-Deployment](#post-deployment)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- ✅ Node.js 18+ installed locally
- ✅ Git repository set up
- ✅ MongoDB database (Atlas or self-hosted)
- ✅ Groq API key
- ✅ Domain name (optional)

---

## Environment Variables

Required environment variables for production:

```env
# MongoDB Connection (Required)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dsa-sync?retryWrites=true&w=majority

# JWT Secret (Required - Generate a strong random key)
JWT_SECRET=your-production-jwt-secret-min-32-characters-long

# Groq AI API Key (Required for AI features)
GROQ_API_KEY=gsk-your-groq-api-key

# App URL (Required)
NEXT_PUBLIC_APP_URL=https://your-domain.com

# AI Provider (Do not change)
AI_PROVIDER=groq
```

### Generating a Strong JWT Secret

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

---

## MongoDB Setup

### Option 1: MongoDB Atlas (Recommended)

1. **Create Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free tier (M0 Sandbox - 512MB)

2. **Create Cluster**
   - Choose cloud provider (AWS/GCP/Azure)
   - Select region closest to your users
   - Create cluster (takes 3-5 minutes)

3. **Database Access**
   - Click "Database Access" in sidebar
   - Add new database user
   - Choose username & password
   - Grant "Read and write to any database" permission

4. **Network Access**
   - Click "Network Access" in sidebar
   - Add IP Address
   - For development: Allow access from anywhere (0.0.0.0/0)
   - For production: Whitelist specific IPs

5. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database password
   - Add database name: `/dsa-sync?retryWrites=true&w=majority`

### Option 2: Self-Hosted MongoDB

If using your own MongoDB server:

```env
MONGODB_URI=mongodb://username:password@your-server:27017/dsa-sync
```

---

## Deployment Options

### Vercel (Recommended)

**Best for**: Serverless deployment, automatic HTTPS, global CDN

#### Steps:

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set Environment Variables**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add all required environment variables
   - Set for: Production, Preview, and Development

5. **Custom Domain (Optional)**
   - Go to Settings → Domains
   - Add your custom domain
   - Update DNS records as instructed

6. **Redeploy**
   ```bash
   vercel --prod
   ```

#### Vercel Configuration

The project already includes `next.config.js` optimized for Vercel.

**Regional Edge Functions**:
```javascript
// next.config.js already configured
export const config = {
  runtime: 'edge',
};
```

---

### Railway

**Best for**: Full-stack apps with long-running processes

#### Steps:

1. **Create Account**
   - Go to [Railway](https://railway.app)
   - Sign up with GitHub

2. **New Project**
   - Click "New Project"
   - Choose "Deploy from GitHub repo"
   - Select your repository

3. **Add MongoDB**
   - Click "New"
   - Select "Database" → "MongoDB"
   - Railway will create a MongoDB instance
   - Copy the connection string from variables

4. **Configure Environment Variables**
   - Go to your web service
   - Click "Variables" tab
   - Add all environment variables

5. **Deploy**
   - Railway auto-deploys on git push
   - View logs in dashboard

6. **Custom Domain**
   - Go to Settings → Domain
   - Add custom domain
   - Configure DNS

#### Railway Configuration

Create `railway.toml`:

```toml
[build]
builder = "NIXPACKS"

[deploy]
numReplicas = 1
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

---

### DigitalOcean

**Best for**: Full control, VPS deployment

#### Steps:

1. **Create Droplet**
   - Size: Basic ($6/month minimum)
   - Distribution: Ubuntu 22.04
   - Add SSH key

2. **SSH into Server**
   ```bash
   ssh root@your-droplet-ip
   ```

3. **Install Dependencies**
   ```bash
   # Update system
   apt update && apt upgrade -y

   # Install Node.js 18
   curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
   apt install -y nodejs

   # Install MongoDB (or use Atlas)
   apt install -y mongodb

   # Install PM2
   npm install -g pm2

   # Install Nginx
   apt install -y nginx
   ```

4. **Clone Repository**
   ```bash
   cd /var/www
   git clone your-repo-url dsa-sync
   cd dsa-sync
   ```

5. **Install & Build**
   ```bash
   npm install
   npm run build
   ```

6. **Configure Environment**
   ```bash
   nano .env.local
   # Add all environment variables
   ```

7. **Start with PM2**
   ```bash
   pm2 start npm --name "dsa-sync" -- start
   pm2 save
   pm2 startup
   ```

8. **Configure Nginx**
   ```bash
   nano /etc/nginx/sites-available/dsa-sync
   ```

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   ```bash
   ln -s /etc/nginx/sites-available/dsa-sync /etc/nginx/sites-enabled/
   nginx -t
   systemctl restart nginx
   ```

9. **SSL Certificate (Free)**
   ```bash
   apt install -y certbot python3-certbot-nginx
   certbot --nginx -d your-domain.com
   ```

---

### AWS

**Best for**: Enterprise deployment, scalability

#### Using AWS Amplify:

1. **AWS Console**
   - Go to AWS Amplify
   - Connect GitHub repository

2. **Build Settings**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

3. **Environment Variables**
   - Add in Amplify Console → Environment Variables

4. **Deploy**
   - Amplify auto-deploys on push

#### Using EC2 + Load Balancer:

Similar to DigitalOcean setup but with:
- EC2 instance instead of Droplet
- Application Load Balancer
- Auto Scaling Group
- RDS for MongoDB (or DocumentDB)
- CloudFront CDN

---

## Post-Deployment

### 1. Test All Features

```bash
# Test authentication
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Test protected route
curl https://your-domain.com/api/analytics \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Monitor Performance

- **Vercel**: Built-in analytics
- **Railway**: Metrics tab
- **Self-hosted**: Install monitoring tools

### 3. Set Up Backups

**MongoDB Atlas**:
- Enable continuous backup (Pro tier)
- Or use scheduled snapshots

**Self-hosted**:
```bash
# Create backup script
nano /usr/local/bin/backup-mongo.sh
```

```bash
#!/bin/bash
mongodump --uri="$MONGODB_URI" --out=/backups/$(date +%Y%m%d-%H%M%S)
```

```bash
chmod +x /usr/local/bin/backup-mongo.sh

# Add to crontab (daily at 2 AM)
crontab -e
0 2 * * * /usr/local/bin/backup-mongo.sh
```

### 4. Configure CDN (Optional)

For static assets, use Cloudflare:
1. Add your domain to Cloudflare
2. Update DNS to Cloudflare nameservers
3. Enable caching rules
4. Enable automatic HTTPS

---

## Troubleshooting

### Build Fails

**Issue**: Build fails with module errors

**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### MongoDB Connection Timeout

**Issue**: Cannot connect to MongoDB

**Solutions**:
1. Check connection string format
2. Verify network access (IP whitelist)
3. Ensure database user has correct permissions
4. Check if MongoDB server is running

### AI Features Not Working

**Issue**: AI endpoints return errors

**Solutions**:
1. Verify Groq API key is correct
2. Check API key is active at https://console.groq.com
3. Ensure `GROQ_API_KEY` is set in environment
4. Check Groq API status

### PWA Not Installing

**Issue**: App doesn't prompt for installation

**Solutions**:
1. Must be served over HTTPS (not localhost)
2. Check `manifest.json` is accessible
3. Verify service worker registration
4. Check browser console for errors

### Images Not Loading

**Issue**: Icons/images return 404

**Solutions**:
1. Ensure `public` folder is included in build
2. Check file paths (case-sensitive on Linux)
3. Verify Next.js image optimization settings

---

## Performance Optimization

### 1. Enable Compression

**Nginx**:
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

**Vercel**: Automatic

### 2. Cache Static Assets

```nginx
location /_next/static {
    alias /var/www/dsa-sync/.next/static;
    expires 365d;
    access_log off;
}
```

### 3. Database Indexing

Indexes are already defined in models, but verify:

```javascript
// In MongoDB shell
use dsa-sync
db.problems.getIndexes()
db.users.getIndexes()
```

### 4. Enable HTTP/2

**Nginx**:
```nginx
listen 443 ssl http2;
```

**Vercel**: Automatic

---

## Security Checklist

- ✅ Use HTTPS (SSL certificate)
- ✅ Set strong JWT secret (32+ characters)
- ✅ Use environment variables (never commit secrets)
- ✅ Enable MongoDB authentication
- ✅ Whitelist IP addresses for database
- ✅ Set up firewall rules (UFW on Ubuntu)
- ✅ Keep dependencies updated
- ✅ Enable rate limiting (optional)
- ✅ Use CSP headers (optional)

---

## Monitoring & Logging

### Recommended Tools:

1. **Error Tracking**: Sentry
2. **Analytics**: Vercel Analytics / Google Analytics
3. **Uptime Monitoring**: UptimeRobot (free)
4. **Logs**: Papertrail / Logtail

---

## Cost Estimates

| Provider | Monthly Cost | Features |
|----------|-------------|----------|
| Vercel (Hobby) | $0 | 100GB bandwidth, serverless |
| Railway (Starter) | $5 | 500 hours, $5 credit |
| DigitalOcean | $6 | 1GB RAM, 25GB SSD |
| AWS (t2.micro) | ~$10 | Pay as you go |
| MongoDB Atlas (M0) | $0 | 512MB storage |
| MongoDB Atlas (M10) | $57 | 10GB storage, backup |

---

## Support

For deployment issues:
- Check [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- Open GitHub issue
- Contact: support@dsasync.com

---

**Happy Deploying! 🚀**
