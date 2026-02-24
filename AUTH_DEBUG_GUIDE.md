# 🔧 Authentication 401 Error - Debug Guide

## 🎯 Root Cause (95% Confidence)

**Service Worker Interference** - Your PWA service worker was caching/intercepting API requests incorrectly, causing:
- Empty 401 responses
- Aborted requests
- Inconsistent behavior

## ✅ Fixes Applied

### 1. **Service Worker Configuration** (`next.config.js`)
- ✅ Excluded `/api/auth/*` routes from caching
- ✅ Added separate caching strategies for API, static assets, and pages
- ✅ Added network timeout (10s) to prevent hanging requests

### 2. **API Client** (`lib/api-client.ts`)
- ✅ Added `cache: 'no-store'` for auth endpoints
- ✅ Added response content-type validation
- ✅ Added comprehensive console logging
- ✅ Better error handling for non-JSON responses

### 3. **Login Route** (`app/api/auth/login/route.ts`)
- ✅ Added detailed console logging at each step
- ✅ Better error tracking

---

## 🚨 CRITICAL STEPS TO FIX

### Step 1: Unregister Existing Service Worker

**In your browser:**

1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **Service Workers** (left sidebar)
4. Click **Unregister** next to all service workers
5. Click **Clear storage** → Clear site data

**OR use this in browser console:**

```javascript
navigator.serviceWorker.getRegistrations().then(function(registrations) {
  for(let registration of registrations) {
    registration.unregister();
    console.log('✅ Service Worker unregistered');
  }
});
```

### Step 2: Clear All Caches

**In browser console:**

```javascript
caches.keys().then(function(names) {
  for (let name of names) {
    caches.delete(name);
    console.log('🗑️ Cache deleted:', name);
  }
});
```

### Step 3: Clear localStorage & Restart

```javascript
localStorage.clear();
console.log('✅ localStorage cleared');
```

Then:
- Close ALL browser tabs with your app
- Restart browser completely
- Clear browser cache (Ctrl+Shift+Delete)

### Step 4: Rebuild Your App

```powershell
# Stop the dev server (Ctrl+C)

# Delete build artifacts
Remove-Item -Recurse -Force .next, node_modules/.cache

# Reinstall dependencies (if needed)
npm install

# Restart dev server
npm run dev
```

---

## 🧪 Testing & Verification

### Test 1: Check Service Worker Status

**Open DevTools → Application → Service Workers**

You should see:
- ✅ "No service workers registered" (in development)
- ✅ Or service worker with status "activated"

### Test 2: Test Login with Network Tab Open

1. Open DevTools → **Network** tab
2. Enable "Disable cache" checkbox
3. Try logging in
4. Check the `/api/auth/login` request:

**Expected Success:**
```
Status: 200 OK
Response Body:
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

**Expected Error (invalid credentials):**
```
Status: 401 Unauthorized
Response Body:
{
  "error": "Invalid credentials"
}
```

### Test 3: Check Console Logs

**Backend (Terminal):**
```
🔐 Login attempt started
✅ Database connected
📥 Request body received: { email: 'user@example.com', hasPassword: true }
👤 User found: Yes
🔑 Comparing password...
🔑 Password valid: true
🎫 Generating JWT token...
✅ Token generated: Yes (length: 178)
✅ Login successful - sending response
```

**Frontend (Browser Console):**
```
🌐 API Request: POST /api/auth/login
📡 Response: 200 OK
✅ Request successful
```

---

## 🔍 Additional Debugging Steps

### If Still Getting 401 with Empty Body:

#### Check 1: JWT Secret
```powershell
# Check if JWT_SECRET is loaded
$env:JWT_SECRET
```

Should output your secret. If empty:
```powershell
# Load .env.local manually
Get-Content .env.local | ForEach-Object {
  if ($_ -match '^([^=]+)=(.+)$') {
    [Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process')
  }
}
```

#### Check 2: MongoDB Connection

Look for this in terminal when you try to login:
```
✅ MongoDB Connected Successfully
```

If not appearing, check:
- MongoDB URI in `.env.local`
- Network connection
- MongoDB Atlas whitelist (allow your IP)

#### Check 3: User Exists in Database

Create a test account first:
```javascript
// In browser console after going to /auth/register
// Register a test account, then try logging in with those credentials
```

#### Check 4: Password Hash Format

If you have users created before, verify password is hashed:
- Should look like: `$2a$10$...` (bcrypt format)
- If it's plain text, user creation failed

---

## 🎯 Expected Final Result

After applying all fixes:

✅ Login returns **200 OK**  
✅ Response includes **JWT token**  
✅ localStorage stores **`dsa-sync-auth`** with token  
✅ User redirected to **/dashboard**  
✅ No 401 error  
✅ Proper error message on invalid credentials  
✅ Console logs show each step  

---

## 🚨 Emergency Fallback

If still not working, force disable service worker completely:

**In `next.config.js`:**

```javascript
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  }
};

// Temporarily comment out PWA
// module.exports = withPWA(nextConfig);
module.exports = nextConfig;
```

Then rebuild and test.

---

## 📊 Network Tab Checklist

When testing login, verify:

| Item | Expected |
|------|----------|
| Request URL | `http://localhost:3000/api/auth/login` |
| Request Method | `POST` |
| Status Code | `200` or `401` (with message) |
| Request Headers | `Content-Type: application/json` |
| Request Payload | `{"email":"...","password":"..."}` |
| Response Headers | `Content-Type: application/json` |
| Response Size | > 0 bytes (not empty) |
| Time | < 2 seconds |

---

## 🐛 Common Pitfalls

1. **Service worker still active** - Clear it multiple times
2. **Cached response** - Always test with "Disable cache" enabled
3. **Wrong credentials** - Ensure user exists in DB
4. **MongoDB not connected** - Check connection logs
5. **JWT_SECRET not loaded** - Restart dev server after changing .env
6. **Browser cache** - Use Incognito/Private mode for testing
7. **Multiple tabs** - Close all tabs, test in single tab

---

## 📞 Still Not Working?

Run this diagnostic script in browser console:

```javascript
// Diagnostic Check
(async function() {
  console.log('🔍 Running diagnostics...');
  
  // 1. Check service workers
  const sws = await navigator.serviceWorker.getRegistrations();
  console.log('Service Workers:', sws.length === 0 ? '✅ None' : '⚠️ ' + sws.length);
  
  // 2. Check caches
  const cacheNames = await caches.keys();
  console.log('Caches:', cacheNames.length === 0 ? '✅ None' : '⚠️ ' + cacheNames.join(', '));
  
  // 3. Check localStorage
  const auth = localStorage.getItem('dsa-sync-auth');
  console.log('Auth in localStorage:', auth ? '✅ Found' : '❌ None');
  
  // 4. Test API endpoint directly
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@test.com', password: 'test' }),
      cache: 'no-store'
    });
    console.log('API Status:', res.status);
    const data = await res.json();
    console.log('API Response:', data);
  } catch (e) {
    console.error('API Error:', e);
  }
  
  console.log('🏁 Diagnostics complete');
})();
```

Send me the output if issues persist.
