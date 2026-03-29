# 🚀 DSA Sync - AI Powered Collaborative DSA Growth Platform

A modern, mobile-first Progressive Web App (PWA) for tracking, comparing, and improving DSA (Data Structures & Algorithms) solving journey with AI-powered insights and collaborative features.

![DSA Sync Banner](https://img.shields.io/badge/DSA-Sync-0ea5e9?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=flat-square&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green?style=flat-square&logo=mongodb)
![PWA](https://img.shields.io/badge/PWA-Enabled-purple?style=flat-square)

## ✨ Features

### 🎯 Core Features

- **� Bulk Import System** (NEW!)
  - **CSV Import** - Upload CSV files with your problem-solving history
  - **Codeforces API Import** - Automatically fetch all accepted submissions
  - Downloadable CSV template with examples
  - Smart duplicate detection (by problem name + platform)
  - Data validation and error reporting
  - Sync feature for incremental updates
  - Import history tracking with statistics
  - Rate limiting for security (5 CSV/hour, 10 Codeforces/hour)
  - Seamless onboarding for existing competitive programmers

- **�📝 Problem Logging System**
  - Track problems with detailed metadata (platform, difficulty, topic, time taken)
  - Store approach summaries, mistakes, and key learnings
  - Optional code snippets
  - Manual revision marking

- **📊 Personal Analytics Dashboard**
  - Total problems solved with difficulty distribution
  - Topic-wise breakdown with interactive charts
  - Heatmap calendar showing consistency
  - Current & longest streak tracking
  - Time improvement trends
  - Weakest topic detection

- **🔁 Smart Revision System**
  - Auto-schedule revisions (3, 7, 30 days)
  - Today's revision list
  - Revision completion rate tracking
  - Performance notes for reattempts

- **🤝 Collaboration Features**
  - Friend system (send/accept requests)
  - **👤 Detailed Friend Profiles** - View comprehensive friend stats and activity
  - **📊 Mutual Comparison System** - Compare your progress with friends
  - **🎯 Common Problem Detection** - Find and compare shared problems
  - View friend's dashboard and progress
  - Recent activity feed
  - Comment on solutions
  - React to friend's entries
  - Same problem comparison mode
  - **Activity Feed** - See what your friends are solving in real-time

- **🔔 Smart Push Notification System**
  - **Daily Streak Reminders** - Auto-notification at 8 PM if no problem solved
  - **Revision Reminders** - Alerts for pending revisions
  - **Friend Activity Alerts** - Get notified when friends solve problems
  - Browser push notifications (works even when app is closed)
  - Test notification feature
  - Easy enable/disable in settings
  - PWA-powered offline-ready notifications

- **🏆 Challenge Mode**
  - Create custom challenges (e.g., "5 DP in 3 days")
  - Track progress
  - Leaderboard view
  - Challenge completion tracking

- **🤖 AI Integration** (LLM-Powered)
  - **Smart Problem Recommendations**: Based on weak topics and accuracy
  - **Solution Analyzer**: Detect brute force, suggest optimizations
  - **Mutual Comparison**: AI compares two users' solutions
  - **Pattern Detection**: Analyze solving personality (50+ problems)
  - **Confidence Estimator**: Topic readiness & interview preparation score
  - **Weekly Growth Report**: Auto-generated performance analysis

### 🎨 UI/UX Features

- Mobile-first responsive design
- Dark theme with modern card-based layout
- Smooth animations and transitions
- Bottom navigation for mobile
- Swipe-friendly interface
- Installable PWA (Add to Home Screen)
- Push notification ready
- XP and level progression system
- Achievement badges

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **State Management**: Zustand
- **Charts**: Recharts
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **AI Integration**: Groq AI (Llama 3.3 70B & Llama 3.1 8B)
- **PWA**: next-pwa
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 📁 Project Structure

```
dsa-tracker/
├── app/
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── problems/             # Problem CRUD operations
│   │   ├── revisions/            # Revision management
│   │   ├── friends/              # Friend system
│   │   ├── challenges/           # Challenge features
│   │   ├── comments/             # Comment system
│   │   ├── analytics/            # Analytics data
│   │   └── ai/                   # AI-powered endpoints
│   ├── auth/                     # Auth pages (login/register)
│   ├── dashboard/                # Main dashboard
│   ├── problems/                 # Problem pages
│   ├── revision/                 # Revision page
│   ├── friends/                  # Friends page
│   ├── ai/                       # AI insights page
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # React components
│   ├── AuthenticatedLayout.tsx   # Auth wrapper
│   ├── BottomNav.tsx             # Mobile navigation
│   ├── NotificationBell.tsx      # Notification icon
│   ├── NotificationSettings.tsx  # Notification preferences
│   └── PushNotificationManager.tsx # Push notification setup
├── lib/                          # Utility libraries
│   ├── mongodb.ts                # Database connection
│   ├── jwt.ts                    # JWT utilities
│   ├── bcrypt.ts                 # Password hashing
│   ├── auth.ts                   # Auth helper (per-route validation)
│   ├── utils.ts                  # Helper functions
│   ├── ai-service.ts             # AI integration
│   ├── api-client.ts             # API client
│   ├── push-service.ts           # Push notification service
│   └── notification-service.ts   # Notification helpers
├── models/                       # MongoDB models
│   ├── User.ts
│   ├── Problem.ts
│   ├── Revision.ts
│   ├── FriendConnection.ts
│   ├── Comment.ts
│   ├── Challenge.ts
│   ├── Achievement.ts
│   ├── AIReport.ts
│   ├── UserStats.ts
│   ├── ActivityLog.ts           # Activity tracking
│   ├── PushSubscription.ts      # Push notification subscriptions
│   └── Notification.ts
├── store/                        # State management
│   └── authStore.ts              # Auth state (Zustand)
├── public/                       # Static assets
│   ├── manifest.json             # PWA manifest
│   └── icons/                    # App icons
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB instance (local or Atlas)
- Groq API key (for AI features - free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dsa-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   
   ```env
   # MongoDB Connection
   MONGODB_URI=mongodb://localhost:27017/dsa-sync
   # or use MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dsa-sync

   # JWT Secret (generate a strong random key)
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

   # Groq AI API Key
   GROQ_API_KEY=your-groq-api-key-here

   # App URL
   NEXT_PUBLIC_APP_URL=http://localhost:3000

   # VAPID Keys for Push Notifications (Generate using: npx web-push generate-vapid-keys)
   VAPID_PUBLIC_KEY=your-vapid-public-key
   VAPID_PRIVATE_KEY=your-vapid-private-key
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key

   # Admin & Security
   ADMIN_EMAIL=admin@yourdomain.com
   CRON_SECRET=your-secure-cron-secret
   ADMIN_SECRET=your-admin-secret

   # AI Provider
   AI_PROVIDER=groq
   ```

   **Generate VAPID Keys for Push Notifications:**
   ```bash
   npx web-push generate-vapid-keys
   ```
   Copy the public and private keys to your `.env.local` file.

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Building for Production

1. **Generate PWA Icons** (required for PWA installation)
   ```bash
   npm install --save-dev sharp
   npm run generate-icons
   ```

2. **Build and start**
   ```bash
   npm run build
   npm start
   ```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run generate-icons` - Generate PWA icons from SVG
- `npm run cleanup-docs` - Remove unnecessary documentation files

## 📱 PWA Installation

### On Mobile (Android/iOS)

1. Open the app in your mobile browser
2. Tap the "Share" or "Menu" button
3. Select "Add to Home Screen"
4. The app will install and appear on your home screen

### On Desktop

1. Open the app in Chrome/Edge
2. Look for the install icon in the address bar
3. Click "Install"

## 🤖 AI Features Configuration

The AI features use Groq AI with Llama 3.3 70B (for complex analysis) and Llama 3.1 8B (for quick responses) models with JSON mode for structured responses. Each AI feature has a specific prompt template in `lib/ai-service.ts`.

### AI Features:

1. **Problem Recommendations**: Analyzes weak topics and suggests practice strategy
2. **Solution Analyzer**: Reviews approach and suggests optimizations
3. **Comparison Insight**: Compares two users' solutions intelligently
4. **Pattern Detection**: Identifies solving patterns after 50+ problems
5. **Weekly Growth Report**: Auto-generates weekly performance summary
6. **Confidence Estimator**: Calculates interview readiness score

### Getting Groq API Key

1. Visit [Groq Console](https://console.groq.com)
2. Sign up for a free account
3. Generate an API key
4. Add to your `.env.local` file as `GROQ_API_KEY`

## 📊 Database Schema

**Collections:**
- **Users** - User accounts with authentication
- **Problems** - Tracked problems with solutions
- **Revisions** - Spaced repetition schedule
- **FriendConnections** - Social connections
- **Comments** - Solution discussions
- **Challenges** - Custom challenges
- **Achievements** - User achievements
- **AIReports** - Generated AI insights
- **UserStats** - Analytics and statistics
- **ActivityLog** - User activity tracking
- **Notification** - System notifications
- **PushSubscription** - Push notification subscriptions
- **NotificationPreferences** - User notification settings
- **ImportHistory** - Import tracking

## 🔐 Authentication Flow

1. User registers with email/password at `/api/auth/register` or logs in at `/api/auth/login`
2. Password is hashed using bcryptjs (on server)
3. JWT token is generated (30-day expiration) and returned with user object
4. Client stores token + user in Zustand state (persisted to localStorage)
5. API client (`lib/api-client.ts`) automatically includes `Authorization: Bearer <token>` header
6. Protected API routes call `authenticateRequest()` helper to validate JWT
7. Invalid/expired tokens return `401 Unauthorized`

**Note:** This app uses per-route authentication (each protected route manually validates), not centralized Next.js middleware.

## 🎯 API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Problems
- `GET /api/problems` - Get user's problems
- `POST /api/problems` - Add new problem
- `GET /api/problems/[id]` - Get single problem
- `PUT /api/problems/[id]` - Update problem
- `DELETE /api/problems/[id]` - Delete problem

### Revisions
- `GET /api/revisions` - Get revisions
- `POST /api/revisions/[id]/complete` - Complete revision

### Friends
- `GET /api/friends` - Get friends list
- `POST /api/friends` - Send friend request
- `POST /api/friends/[id]/respond` - Accept/reject request
- `GET /api/friends/[friendId]/dashboard` - View friend's dashboard
- `GET /api/friends/compare` - Compare solutions

### Analytics
- `GET /api/analytics` - Get user analytics

### AI
- `GET /api/ai/recommendations` - Get problem recommendations
- `POST /api/ai/analyze-solution` - Analyze solution
- `POST /api/ai/compare` - Compare solutions
- `GET /api/ai/pattern-detection` - Get pattern analysis
- `POST /api/ai/weekly-report` - Generate weekly report
- `GET /api/ai/weekly-report` - Get past reports
- `GET /api/ai/confidence` - Get confidence score

### Challenges
- `GET /api/challenges` - Get challenges
- `POST /api/challenges` - Create challenge

### Comments
- `GET /api/comments` - Get comments for problem
- `POST /api/comments` - Add comment

## 🎨 Theming

The app uses a dark theme with customizable colors in `tailwind.config.ts`. Color palette:

- **Primary**: Blue (Sky) - `#0ea5e9`
- **Dark Background**: `#0a0f1a` to `#1e293b`
- **Accent**: Purple, Green, Orange for different sections

## 📈 Performance Optimizations

- Server-side rendering with Next.js App Router
- Static generation where possible
- Image optimization
- Code splitting
- PWA caching strategies
- MongoDB indexing for fast queries
- Zustand for lightweight state management

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Environment variable protection
- Input validation
- XSS protection
- CORS configuration
- Rate limiting (recommended for production)

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel dashboard
3. Add environment variables in project settings
4. Deploy

### Environment Variables for Production

Required variables:
- `MONGODB_URI` - MongoDB Atlas connection string
- `JWT_SECRET` - Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `GROQ_API_KEY` - From Groq Console
- `NEXT_PUBLIC_APP_URL` - Your production URL
- `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` - Generate with: `npx web-push generate-vapid-keys`
- `ADMIN_EMAIL` - Admin email for notifications
- `CRON_SECRET` - Protect cron endpoints
- `ADMIN_SECRET` - Protect admin endpoints

### MongoDB Atlas Setup

1. Create free MongoDB Atlas account
2. Create a cluster
3. Whitelist Vercel IPs or use 0.0.0.0/0
4. Get connection string and add to environment variables

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Built with ❤️ for DSA learners worldwide

## 🙏 Acknowledgments

- Groq AI for Llama models
- Next.js team for the amazing framework
- MongoDB for the database
- All open-source contributors

## 📞 Support

For support, email support@dsasync.com or open an issue on GitHub.

---

**Happy Coding! 🚀**
