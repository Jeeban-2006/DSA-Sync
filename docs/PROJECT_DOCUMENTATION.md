# DSA Sync — Project Documentation

## Overview

DSA Sync (a.k.a. DSA Tracker) is a mobile-first Progressive Web App (PWA) designed to help learners track, analyze, and improve their Data Structures & Algorithms (DSA) problem-solving skills. It combines manual logging, bulk import tools, collaborative social features, and AI-powered insights to support long-term, measurable growth.

This document summarizes the project's features, architecture, data models, API surface, setup/deployment steps, and developer guidance.

---

## Key Features (User-facing)

- Bulk import system
  - CSV import with template and validation
  - Codeforces API import for accepted submissions
  - Duplicate detection and incremental sync
  - Import history with statistics and rate-limiting
- Problem logging system
  - Store problem metadata (platform, difficulty, tags, time taken)
  - Approach summaries, mistakes, and code snippets
  - Manual revision marking and scheduled revisions
- Personal analytics dashboard
  - Difficulty and topic distribution, streaks, heatmaps, trends
- Smart revision system
  - Auto-scheduled revision intervals (3, 7, 30 days)
  - Revision completion tracking and daily revision lists
- Collaboration & social features
  - Friend system with requests and mutual comparisons
  - Activity feed, comments, reactions, and friend dashboards
- Push notifications & PWA support
  - Daily reminders, revision alerts, friend activity notifications
  - Browser push (VAPID keys) and service worker integration
- AI integrations (Groq AI)
  - Problem recommendations based on weakness detection
  - Solution analyzer for optimization suggestions
  - Comparison insights and pattern detection
  - Weekly growth reports and confidence estimator

---

## Tech Stack

- Frontend: Next.js 14 (App Router), React 18, TypeScript
- Styling: Tailwind CSS
- State: Zustand (auth state with localStorage persistence)
- Charts: Recharts
- Backend / API: Next.js API routes (App Router) + Node runtime
- Database: MongoDB with Mongoose models
- Auth: JWT (30-day expiration), bcryptjs for password hashing, per-route authentication validation
- AI: Groq AI (Llama models) for structured responses
- PWA & Push: next-pwa (service worker), `web-push` VAPID keys

---

## High-Level Architecture

- Client (Next.js App)
  - Pages and components live under `app/` and `components/`.
  - Authentication: JWT tokens are stored in Zustand (persisted to localStorage). The API client (`lib/api-client.ts`) automatically includes tokens in the `Authorization: Bearer <token>` header for authenticated requests.
  - PWA behavior via `public/` service workers and `next-pwa` config.
  - **Note:** Service worker caching can interfere with auth requests. Auth endpoints use `cache: 'no-store'` to prevent caching issues.

- Server (Next.js API routes)
  - API routes live under `app/api/` and are responsible for CRUD operations, AI endpoints, imports, push notification handling, and analytics.
  - **Authentication Pattern:** Each protected route manually calls `authenticateRequest()` from `lib/auth.ts` to validate JWT tokens from the Authorization header. There is no centralized Next.js middleware - validation is per-route.
  - Unauthenticated requests to protected routes return `401 Unauthorized`.

- Database
  - MongoDB collections (models in `models/`) store Users, Problems, Revisions, FriendConnections, Comments, Challenges, AIReports, UserStats, ActivityLog, PushSubscriptions, and Notifications.

- AI Service
  - `lib/ai-service.ts` contains prompt templates and client logic for calling Groq AI endpoints in JSON mode.

- Notifications
  - Push subscription and sending logic in `lib/push-service.ts` and `lib/notification-service.ts`.

---

## Important Files & Locations

- App root and routes: `app/`
- Components: `components/`
- Server helpers: `lib/` (e.g., `ai-service.ts`, `mongodb.ts`, `jwt.ts`)
- Mongoose models: `models/` (e.g., `Problem.ts`, `User.ts`, `Revision.ts`)
- State store: `store/authStore.ts`
- Public assets and service worker: `public/`

See the code for details and implementation specifics.

---

## Authentication System

### How Authentication Works

1. **Registration/Login Flow**
   - User submits credentials to `POST /api/auth/register` or `POST /api/auth/login`
   - Server validates credentials, then generates a JWT token (30-day expiration) using `lib/jwt.ts`
   - Server responds with: `{ token: string, user: UserObject, message: string }`
   - Client stores both token and user data in Zustand store (`store/authStore.ts`)
   - Zustand persists state to `localStorage` under key `dsa-sync-auth`

2. **Authenticated API Requests**
   - Client API wrapper (`lib/api-client.ts`) reads token from localStorage
   - Automatically adds `Authorization: Bearer <token>` header to all requests (except login/register)
   - Server-side: Each protected route calls `authenticateRequest()` from `lib/auth.ts`
   - `authenticateRequest()` extracts token, verifies signature, and returns user payload
   - Invalid/expired tokens → `401 Unauthorized` response

3. **Per-Route Authentication Pattern**
   ```typescript
   const auth = await authenticateRequest();
   if (!auth.authenticated || !auth.user) {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
   }
   // Use auth.user.userId, auth.user.email, etc.
   ```

### Important Details

- **No centralized middleware:** Unlike some Next.js apps, this project does NOT use a `middleware.ts` file. Each protected API route manually validates the JWT.
- **Token storage:** JWT is stored client-side in localStorage (via Zustand persistence). This is standard for JWT-based auth but means tokens are accessible to client-side JavaScript.
- **Token expiration:** Tokens expire after 30 days. Expired tokens trigger logout and redirect to login page.
- **Service worker caching:** PWA service workers initially caused issues by caching auth responses. Fixed by:
  - Excluding `/api/auth/*` from service worker cache (see `next.config.js`)
  - Using `cache: 'no-store'` in fetch options for auth endpoints

### Security Considerations

- JWT secret must be strong and kept secure (`JWT_SECRET` env variable)
- Tokens are not revocable without server-side token blacklist (not currently implemented)
- Client-side storage means XSS attacks could steal tokens - ensure all user input is sanitized
- HTTPS required in production to prevent token interception

### Related Files

- `lib/jwt.ts` - Token generation and verification
- `lib/auth.ts` - Authentication helper for API routes
- `store/authStore.ts` - Client-side auth state management
- `lib/api-client.ts` - API wrapper that attaches auth headers
- `AUTH_DEBUG_GUIDE.md` - Troubleshooting guide for auth issues

---

## Data Model Summary

This project uses expressive Mongoose models. Key collections and their purpose:

- Users (`User`): identity, email, passwordHash, profile details, preferences
- Problems (`Problem`): problem id/name, platform, difficulty, tags, approach, code snippet, timeSpent, solvedAt
- Revisions (`Revision`): links to `Problem`, scheduledAt, completedAt, notes
- FriendConnection (`FriendConnection`): requester/responder, status
- AIReport (`AIReport`): structured LLM responses, analysis metadata
- Notification / PushSubscription: VAPID endpoints and subscription objects

For exact schema fields, review files in `models/`.

---

## API Endpoints (Quick Summary)

Authentication
- `POST /api/auth/register` — register new user
- `POST /api/auth/login` — login & receive JWT
- `GET /api/auth/me` — current user

Problems
- `GET /api/problems` — get problems for user
- `POST /api/problems` — add problem
- `GET /api/problems/[id]` — single problem
- `PUT /api/problems/[id]` — update
- `DELETE /api/problems/[id]` — delete

Revisions
- `GET /api/revisions` — list revisions
- `POST /api/revisions/[id]/complete` — mark complete

Friends
- `GET /api/friends` — list friends
- `POST /api/friends` — send request
- `POST /api/friends/[id]/respond` — accept/reject
- `GET /api/friends/compare` — compare solutions

AI
- `GET /api/ai/recommendations` — recommendations
- `POST /api/ai/analyze-solution` — analyze a solution
- `POST /api/ai/compare` — compare solutions
- `GET /api/ai/pattern-detection` — pattern analysis
- `POST /api/ai/weekly-report` — generate report

Imports
- CSV & Codeforces import routes with rate limits and validation under `app/api/import/`

Notifications
- Push subscription endpoints and send endpoints under `app/api/notifications` and `app/api/push/`

---

## Setup & Local Development

Prerequisites

- Node.js 18+
- MongoDB instance (local/Atlas)
- Groq AI API key for AI features
- VAPID keys for push notifications

Environment variables (create `.env.local` in repository root):

MONGODB_URI, JWT_SECRET, GROQ_API_KEY, NEXT_PUBLIC_APP_URL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, NEXT_PUBLIC_VAPID_PUBLIC_KEY, ADMIN_EMAIL, CRON_SECRET, ADMIN_SECRET, AI_PROVIDER

Install and run:

```bash
npm install
npm run dev
```

Generate VAPID keys:

```bash
npx web-push generate-vapid-keys
```

---

## Deployment Notes

- This project is designed for deployment on Vercel (see `vercel.json`), but any Node-compatible host is fine.
- Ensure environment variables are set in the hosting provider.
- For production, enable proper rate-limiting, CORS config, and secure JWT secrets.
- Use MongoDB Atlas for production reliability and set appropriate indexes for queries on `Problems` and `UserStats`.

---

## AI Integration Details

- `lib/ai-service.ts` centralizes prompt templates and interactions with Groq AI. Responses use JSON mode for robust parsing.
- Models: Llama 3.3 70B for heavy analysis and Llama 3.1 8B for quick responses.
- Design patterns:
  - Keep prompts deterministic and return strict JSON to simplify parsing/storing in `AIReport`.
  - Cache or persist expensive analyses where appropriate.

---

## Testing & Quality

- Unit & integration tests: add test harnesses around `lib/` utilities and API routes as needed.
- Linting/formatting: ensure `eslint` / `prettier` rules consistent with repo (not included by default in this doc).

---

## Security Considerations

- Store `JWT_SECRET` and VAPID keys securely; do not commit secrets.
- Enforce rate limiting on import and AI endpoints to prevent abuse.
- Validate and sanitize user-provided content server-side to prevent XSS and injection.

---

## Extensibility & Next Steps

- Add OAuth providers (GitHub/Google) for easier onboarding.
- Expand import options (LeetCode, AtCoder) and add background sync.
- Add server-side scheduled jobs for periodic AI reports (cron + `app/cron/`).
- Improve test coverage and add CI pipeline.

---

## Where to Look in the Repo

- App routes: `app/api/`
- Core libs: `lib/` (auth, db, ai, push)
- Schema/models: `models/`
- UI components: `components/` and `app/`
- Docs & guides: top-level `README.md` and `docs/`

For implementation examples, inspect the files under `app/api/ai/`, `lib/ai-service.ts`, and `models/`.

---

If you'd like, I can:
- expand this into separate per-feature docs, or
- generate an API reference with example requests and responses, or
- create developer checklists for onboarding contributors.

---

Generated: February 25, 2026
