# 📊 Database Schema - DSA Sync

Complete MongoDB schema documentation with relationships and indexes.

## Collections Overview

1. **Users** - User accounts and profiles
2. **Problems** - DSA problems solved by users
3. **Revisions** - Scheduled revision cycles
4. **FriendConnections** - Friend relationships
5. **Comments** - Comments on problems
6. **Challenges** - User challenges
7. **Achievements** - Unlocked achievements
8. **AIReports** - AI-generated reports
9. **UserStats** - Aggregated user statistics

---

## 1. Users Collection

**Purpose**: Store user account information and profile data

### Schema

```typescript
{
  _id: ObjectId,
  name: String,                    // Full name
  email: String,                   // Unique, lowercase
  username: String,                // Unique, lowercase
  password: String,                // Hashed with bcryptjs
  avatar: String?,                 // Avatar URL (optional)
  joinDate: Date,                  // Registration date
  currentStreak: Number,           // Current solving streak (days)
  longestStreak: Number,           // Best streak ever
  totalProblemsSolved: Number,     // Total count
  level: Number,                   // User level (based on XP)
  xp: Number,                      // Experience points
  lastActiveDate: Date?,           // Last problem solved date
  achievements: [String],          // Array of achievement IDs
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes

```javascript
{ email: 1 }       // Unique index for login
{ username: 1 }    // Unique index for search
```

### Example Document

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "username": "johndoe",
  "password": "$2a$10$hash...",
  "avatar": "",
  "joinDate": "2024-01-15T00:00:00.000Z",
  "currentStreak": 7,
  "longestStreak": 14,
  "totalProblemsSolved": 42,
  "level": 5,
  "xp": 850,
  "lastActiveDate": "2024-02-22T10:30:00.000Z",
  "achievements": ["First Problem", "Week Streak"],
  "createdAt": "2024-01-15T00:00:00.000Z",
  "updatedAt": "2024-02-22T10:30:00.000Z"
}
```

---

## 2. Problems Collection

**Purpose**: Store all problems solved by users

### Schema

```typescript
{
  _id: ObjectId,
  userId: ObjectId,                     // References Users._id
  problemName: String,                  // Problem title
  platform: String,                     // LeetCode, Codeforces, etc.
  problemLink: String,                  // URL to problem
  difficulty: String,                   // "Easy", "Medium", "Hard"
  topic: String,                        // Array, Tree, DP, etc.
  subtopic: String,                     // Specific pattern
  timeTaken: Number,                    // Minutes
  dateSolved: Date,                     // When solved
  status: String,                       // "Solved", "Needs Revision", "Couldn't Solve"
  approachSummary: String,              // User's approach
  mistakesFaced: String,                // Common mistakes
  keyLearning: String,                  // Key takeaway
  codeSnippet: String?,                 // Optional code
  markedForRevision: Boolean,           // Revision flag
  revisionDates: [Date],                // Past revision dates
  lastRevised: Date?,                   // Last revision
  revisionCount: Number,                // Times revised
  timesAttempted: Number,               // Reattempt count
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes

```javascript
{ userId: 1, dateSolved: -1 }      // User's problems by date
{ userId: 1, topic: 1 }            // Filter by topic
{ userId: 1, markedForRevision: 1 } // Revision filter
```

### Example Document

```json
{
  "_id": "507f1f77bcf86cd799439012",
  "userId": "507f1f77bcf86cd799439011",
  "problemName": "Two Sum",
  "platform": "LeetCode",
  "problemLink": "https://leetcode.com/problems/two-sum/",
  "difficulty": "Easy",
  "topic": "Array",
  "subtopic": "Hash Table",
  "timeTaken": 15,
  "dateSolved": "2024-02-22T10:00:00.000Z",
  "status": "Solved",
  "approachSummary": "Used hash map to store complement values...",
  "mistakesFaced": "Initially tried O(n²) brute force",
  "keyLearning": "Hash table lookup is O(1)",
  "codeSnippet": "def twoSum(nums, target):\n    seen = {}\n    ...",
  "markedForRevision": true,
  "revisionDates": [],
  "lastRevised": null,
  "revisionCount": 0,
  "timesAttempted": 1,
  "createdAt": "2024-02-22T10:00:00.000Z",
  "updatedAt": "2024-02-22T10:00:00.000Z"
}
```

---

## 3. Revisions Collection

**Purpose**: Track scheduled revisions for problems

### Schema

```typescript
{
  _id: ObjectId,
  userId: ObjectId,                   // References Users._id
  problemId: ObjectId,                // References Problems._id
  scheduledDate: Date,                // When to revise
  completedDate: Date?,               // When completed
  cycle: String,                      // "3-day", "7-day", "30-day"
  status: String,                     // "Pending", "Completed", "Skipped"
  performanceNotes: String?,          // How it went
  timeTaken: Number?,                 // Time for revision
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes

```javascript
{ userId: 1, scheduledDate: 1 }    // User's revisions by date
{ userId: 1, status: 1 }           // Filter by status
```

### Example Document

```json
{
  "_id": "507f1f77bcf86cd799439013",
  "userId": "507f1f77bcf86cd799439011",
  "problemId": "507f1f77bcf86cd799439012",
  "scheduledDate": "2024-02-25T00:00:00.000Z",
  "completedDate": null,
  "cycle": "3-day",
  "status": "Pending",
  "performanceNotes": "",
  "timeTaken": null,
  "createdAt": "2024-02-22T10:00:00.000Z",
  "updatedAt": "2024-02-22T10:00:00.000Z"
}
```

---

## 4. FriendConnections Collection

**Purpose**: Manage friend relationships

### Schema

```typescript
{
  _id: ObjectId,
  requesterId: ObjectId,            // User who sent request
  recipientId: ObjectId,            // User who received request
  status: String,                   // "Pending", "Accepted", "Rejected"
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes

```javascript
{ requesterId: 1, recipientId: 1 }  // Unique compound index
{ requesterId: 1, status: 1 }       // Requester's connections
{ recipientId: 1, status: 1 }       // Recipient's connections
```

### Example Document

```json
{
  "_id": "507f1f77bcf86cd799439014",
  "requesterId": "507f1f77bcf86cd799439011",
  "recipientId": "507f1f77bcf86cd799439015",
  "status": "Accepted",
  "createdAt": "2024-02-20T15:00:00.000Z",
  "updatedAt": "2024-02-20T15:30:00.000Z"
}
```

---

## 5. Comments Collection

**Purpose**: Store comments on problems

### Schema

```typescript
{
  _id: ObjectId,
  userId: ObjectId,                 // Commenter
  problemId: ObjectId,              // Problem commented on
  content: String,                  // Comment text
  reactions: [{
    userId: ObjectId,
    type: String                    // "like", "love", "fire", "clap"
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes

```javascript
{ problemId: 1, createdAt: -1 }   // Comments by problem
{ userId: 1 }                      // User's comments
```

---

## 6. Challenges Collection

**Purpose**: Track user challenges

### Schema

```typescript
{
  _id: ObjectId,
  creatorId: ObjectId,              // Challenge creator
  participants: [ObjectId],         // Array of user IDs
  title: String,                    // Challenge name
  description: String,              // Details
  targetCount: Number,              // Goal (e.g., 5 problems)
  topic: String?,                   // Optional topic filter
  difficulty: String?,              // Optional difficulty
  startDate: Date,
  endDate: Date,
  status: String,                   // "Active", "Completed", "Failed", "Abandoned"
  progress: Map<String, Number>,    // userId -> problem count
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes

```javascript
{ participants: 1, status: 1 }    // User's active challenges
{ creatorId: 1 }                   // Created challenges
```

---

## 7. Achievements Collection

**Purpose**: Track unlocked achievements

### Schema

```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  type: String,                     // Achievement type
  title: String,                    // Display title
  description: String,              // What it's for
  icon: String,                     // Emoji or icon
  unlockedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes

```javascript
{ userId: 1, unlockedAt: -1 }     // User's achievements
```

### Achievement Types

- First Problem
- Week Streak
- Month Streak
- 100 Problems
- 500 Problems
- Topic Master
- Speed Demon
- Night Owl
- Early Bird

---

## 8. AIReports Collection

**Purpose**: Store AI-generated insights

### Schema

```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  type: String,                     // Report type
  title: String,                    // Report title
  content: Mixed,                   // Structured JSON from AI
  metadata: Mixed?,                 // Additional data
  generatedAt: Date,
  weekNumber: Number?,              // For weekly reports
  year: Number?,
  createdAt: Date,
  updatedAt: Date
}
```

### Report Types

- Weekly Growth
- Problem Recommendation
- Solution Analysis
- Comparison Insight
- Pattern Detection
- Confidence Score

### Indexes

```javascript
{ userId: 1, type: 1, generatedAt: -1 }
{ userId: 1, weekNumber: 1, year: 1 }
```

---

## 9. UserStats Collection

**Purpose**: Cached aggregated statistics

### Schema

```typescript
{
  _id: ObjectId,
  userId: ObjectId,                 // Unique
  totalProblems: Number,
  easyCount: Number,
  mediumCount: Number,
  hardCount: Number,
  topicStats: Map<String, {
    total: Number,
    easy: Number,
    medium: Number,
    hard: Number,
    avgTime: Number,
    accuracy: Number
  }>,
  weeklyProgress: [{
    weekNumber: Number,
    year: Number,
    problemsSolved: Number
  }],
  lastCalculated: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes

```javascript
{ userId: 1 }                      // Unique index
```

---

## Relationships

```
Users (1) ----< (N) Problems
Users (1) ----< (N) Revisions
Problems (1) ----< (N) Revisions
Users (N) ----< (N) FriendConnections (self-referencing)
Users (1) ----< (N) Comments
Problems (1) ----< (N) Comments
Users (1) ----< (N) Challenges (as creator)
Users (N) ----< (N) Challenges (as participants)
Users (1) ----< (N) Achievements
Users (1) ----< (N) AIReports
Users (1) ----< (1) UserStats
```

---

## Data Flow Examples

### Adding a Problem

1. User submits problem via `/api/problems` (POST)
2. Create Problem document
3. Update User.totalProblemsSolved
4. Calculate and add XP to User.xp
5. Update User.level based on XP
6. If marked for revision:
   - Create 3 Revision documents (3-day, 7-day, 30-day)
7. Invalidate UserStats cache

### Completing a Revision

1. User marks revision complete via `/api/revisions/[id]/complete` (POST)
2. Update Revision.status = "Completed"
3. Set Revision.completedDate
4. Update Problem.revisionCount++
5. Add to Problem.revisionDates[]

### Friend Request Flow

1. User A sends request to User B
2. Create FriendConnection with status="Pending"
3. User B accepts/rejects
4. Update FriendConnection.status = "Accepted"/"Rejected"

---

## Indexes Summary

| Collection | Index | Type |
|-----------|-------|------|
| Users | email | Unique |
| Users | username | Unique |
| Problems | userId + dateSolved | Compound |
| Problems | userId + topic | Compound |
| Problems | userId + markedForRevision | Compound |
| Revisions | userId + scheduledDate | Compound |
| Revisions | userId + status | Compound |
| FriendConnections | requesterId + recipientId | Unique Compound |
| FriendConnections | requesterId + status | Compound |
| FriendConnections | recipientId + status | Compound |
| Comments | problemId + createdAt | Compound |
| Challenges | participants + status | Compound |
| Achievements | userId + unlockedAt | Compound |
| AIReports | userId + type + generatedAt | Compound |
| UserStats | userId | Unique |

---

##MongoDB Shell Commands

### Create Indexes

```javascript
// Users
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });

// Problems
db.problems.createIndex({ userId: 1, dateSolved: -1 });
db.problems.createIndex({ userId: 1, topic: 1 });
db.problems.createIndex({ userId: 1, markedForRevision: 1 });

// Revisions
db.revisions.createIndex({ userId: 1, scheduledDate: 1 });
db.revisions.createIndex({ userId: 1, status: 1 });

// FriendConnections
db.friendconnections.createIndex({ requesterId: 1, recipientId: 1 }, { unique: true });
db.friendconnections.createIndex({ requesterId: 1, status: 1 });
db.friendconnections.createIndex({ recipientId: 1, status: 1 });

// Comments
db.comments.createIndex({ problemId: 1, createdAt: -1 });
db.comments.createIndex({ userId: 1 });

// Challenges
db.challenges.createIndex({ participants: 1, status: 1 });
db.challenges.createIndex({ creatorId: 1 });

// Achievements
db.achievements.createIndex({ userId: 1, unlockedAt: -1 });

// AIReports
db.aireports.createIndex({ userId: 1, type: 1, generatedAt: -1 });
db.aireports.createIndex({ userId: 1, weekNumber: 1, year: 1 });

// UserStats
db.userstats.createIndex({ userId: 1 }, { unique: true });
```

---

## Best Practices

1. **Always use indexes** for frequent queries
2. **Normalize references** (use ObjectId references)
3. **Denormalize for reads** (UserStats collection)
4. **Use aggregation pipelines** for complex analytics
5. **Implement TTL indexes** for temporary data (optional)
6. **Set up backup strategy** (daily snapshots)
7. **Monitor slow queries** (enable profiling)

---

## Sample Queries

### Get user's problems with pagination

```javascript
db.problems.find({ userId: ObjectId("...") })
  .sort({ dateSolved: -1 })
  .skip(0)
  .limit(20);
```

### Get today's revisions

```javascript
const today = new Date();
today.setHours(0, 0, 0, 0);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

db.revisions.find({
  userId: ObjectId("..."),
  scheduledDate: { $gte: today, $lt: tomorrow },
  status: "Pending"
}).populate("problemId");
```

### Get friend list

```javascript
db.friendconnections.aggregate([
  {
    $match: {
      $or: [
        { requesterId: ObjectId("...") },
        { recipientId: ObjectId("...") }
      ],
      status: "Accepted"
    }
  },
  {
    $lookup: {
      from: "users",
      localField: "requesterId",
      foreignField: "_id",
      as: "requester"
    }
  },
  {
    $lookup: {
      from: "users",
      localField: "recipientId",
      foreignField: "_id",
      as: "recipient"
    }
  }
]);
```

---

**Database Schema Version**: 1.0.0
**Last Updated**: February 22, 2026
