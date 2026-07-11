# DSA Sync - Server Start Steps (Windows)

## 1) Open terminal in project folder

```powershell
cd "C:\Users\ASUS\OneDrive\Desktop\DSA TRACKER"
```

## 2) Check Node.js (must be v18+)

```powershell
node -v
npm -v
```

If Node is below 18, install/update Node.js first.

## 3) Install dependencies

```powershell
npm install
```

## 4) Create environment file

```powershell
Copy-Item .env.local.example .env.local
```

## 5) Generate required secrets

### JWT secret
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### VAPID keys
```powershell
npx web-push generate-vapid-keys
```

## 6) Fill `.env.local`

Open `.env.local` and set all required values:

- `MONGODB_URI` (MongoDB Atlas/local connection string)
- `JWT_SECRET` (from step 5)
- `GROQ_API_KEY` (from Groq console)
- `NEXT_PUBLIC_APP_URL=http://localhost:3000`
- `AI_PROVIDER=groq`
- `VAPID_PUBLIC_KEY` (from step 5)
- `VAPID_PRIVATE_KEY` (from step 5)
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (same as `VAPID_PUBLIC_KEY`)
- `ADMIN_EMAIL`
- `CRON_SECRET` (generate with node randomBytes command)
- `ADMIN_SECRET` (generate with node randomBytes command)

## 7) Start development server

```powershell
npm run dev
```

Open: `http://localhost:3000`

## 8) Start production server (optional)

Build first:

```powershell
npm run build
```

Then start:

```powershell
npm start
```

## 9) Common troubleshooting

- **Port already in use**: stop old process or change port.
- **MongoDB connection error**: re-check `MONGODB_URI` and Atlas IP allow list.
- **Auth errors**: ensure `JWT_SECRET` is set.
- **Push notifications not working**: verify all 3 VAPID variables are correct.