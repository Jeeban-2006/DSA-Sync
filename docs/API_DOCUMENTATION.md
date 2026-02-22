# 🔌 API Documentation - DSA Sync

Complete REST API reference for the DSA Sync platform.

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Error Responses

All endpoints follow this error format:

```json
{
  "error": "Error message description"
}
```

**HTTP Status Codes**:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

---

## Table of Contents

1. [Authentication](#authentication-endpoints)
2. [Problems](#problems-endpoints)
3. [Revisions](#revisions-endpoints)
4. [Analytics](#analytics-endpoints)
5. [Friends](#friends-endpoints)
6. [Challenges](#challenges-endpoints)
7. [Comments](#comments-endpoints)
8. [AI Features](#ai-endpoints)

---

## Authentication Endpoints

### Register User

Create a new user account.

**Endpoint**: `POST /api/auth/register`

**Authentication**: None

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "username": "johndoe",
  "password": "password123"
}
```

**Response** (201):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "username": "johndoe",
    "level": 1,
    "xp": 0,
    "currentStreak": 0,
    "longestStreak": 0,
    "totalProblemsSolved": 0
  }
}
```

**Validation**:
- Name: Required, min 2 characters
- Email: Required, valid email format
- Username: Required, unique, alphanumeric
- Password: Required, min 6 characters

**Example cURL**:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","username":"johndoe","password":"password123"}'
```

---

### Login User

Authenticate and receive JWT token.

**Endpoint**: `POST /api/auth/login`

**Authentication**: None

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response** (200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "username": "johndoe",
    "level": 5,
    "xp": 850,
    "currentStreak": 7,
    "longestStreak": 14,
    "totalProblemsSolved": 42
  }
}
```

**Example cURL**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

---

### Get Current User

Retrieve authenticated user's profile.

**Endpoint**: `GET /api/auth/me`

**Authentication**: Required

**Response** (200):
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "username": "johndoe",
  "level": 5,
  "xp": 850,
  "currentStreak": 7,
  "longestStreak": 14,
  "totalProblemsSolved": 42,
  "achievements": ["First Problem", "Week Streak"]
}
```

**Example cURL**:
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Problems Endpoints

### Get Problems

Retrieve user's problems with pagination and filtering.

**Endpoint**: `GET /api/problems`

**Authentication**: Required

**Query Parameters**:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `topic` (string): Filter by topic
- `difficulty` (string): Filter by difficulty (Easy/Medium/Hard)
- `status` (string): Filter by status

**Response** (200):
```json
{
  "problems": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "problemName": "Two Sum",
      "platform": "LeetCode",
      "problemLink": "https://leetcode.com/problems/two-sum/",
      "difficulty": "Easy",
      "topic": "Array",
      "subtopic": "Hash Table",
      "timeTaken": 15,
      "dateSolved": "2024-02-22T10:00:00.000Z",
      "status": "Solved",
      "markedForRevision": true,
      "revisionCount": 0
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalProblems": 42,
    "hasMore": true
  }
}
```

**Example cURL**:
```bash
curl "http://localhost:3000/api/problems?page=1&limit=20&topic=Array" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### Create Problem

Add a new problem.

**Endpoint**: `POST /api/problems`

**Authentication**: Required

**Request Body**:
```json
{
  "problemName": "Two Sum",
  "platform": "LeetCode",
  "problemLink": "https://leetcode.com/problems/two-sum/",
  "difficulty": "Easy",
  "topic": "Array",
  "subtopic": "Hash Table",
  "timeTaken": 15,
  "dateSolved": "2024-02-22",
  "status": "Solved",
  "approachSummary": "Used hash map to store complement values",
  "mistakesFaced": "Initially tried O(n²) brute force",
  "keyLearning": "Hash table lookup is O(1)",
  "codeSnippet": "def twoSum(nums, target):\n    seen = {}\n    ...",
  "markedForRevision": true
}
```

**Response** (201):
```json
{
  "problem": { /* problem object */ },
  "xpEarned": 20,
  "newLevel": 5,
  "message": "Problem added successfully! +20 XP"
}
```

**XP Calculation**:
- Easy: 10 XP base + 5 XP (first time) = 15 XP
- Medium: 20 XP base + 10 XP (first time) = 30 XP
- Hard: 30 XP base + 15 XP (first time) = 45 XP
- Bonus: +5 XP if solved under median time

**Example cURL**:
```bash
curl -X POST http://localhost:3000/api/problems \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"problemName":"Two Sum","platform":"LeetCode","difficulty":"Easy","topic":"Array",...}'
```

---

### Get Single Problem

Retrieve a specific problem by ID.

**Endpoint**: `GET /api/problems/[id]`

**Authentication**: Required

**Response** (200):
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "problemName": "Two Sum",
  "platform": "LeetCode",
  "problemLink": "https://leetcode.com/problems/two-sum/",
  "difficulty": "Easy",
  "topic": "Array",
  "subtopic": "Hash Table",
  "timeTaken": 15,
  "dateSolved": "2024-02-22T10:00:00.000Z",
  "status": "Solved",
  "approachSummary": "Used hash map...",
  "mistakesFaced": "Initially tried...",
  "keyLearning": "Hash table lookup...",
  "codeSnippet": "def twoSum...",
  "markedForRevision": true,
  "revisionDates": [],
  "revisionCount": 0
}
```

---

### Update Problem

Update an existing problem.

**Endpoint**: `PUT /api/problems/[id]`

**Authentication**: Required

**Request Body**: (All fields optional)
```json
{
  "status": "Needs Revision",
  "approachSummary": "Updated approach...",
  "markedForRevision": true
}
```

**Response** (200):
```json
{
  "message": "Problem updated successfully",
  "problem": { /* updated problem */ }
}
```

---

### Delete Problem

Delete a problem.

**Endpoint**: `DELETE /api/problems/[id]`

**Authentication**: Required

**Response** (200):
```json
{
  "message": "Problem deleted successfully"
}
```

---

## Revisions Endpoints

### Get Revisions

Retrieve today's and upcoming revisions.

**Endpoint**: `GET /api/revisions`

**Authentication**: Required

**Query Parameters**:
- `date` (string): Specific date (YYYY-MM-DD)
- `status` (string): Filter by status

**Response** (200):
```json
{
  "today": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "scheduledDate": "2024-02-22",
      "cycle": "3-day",
      "status": "Pending",
      "problem": {
        "_id": "507f1f77bcf86cd799439012",
        "problemName": "Two Sum",
        "difficulty": "Easy",
        "topic": "Array"
      }
    }
  ],
  "upcoming": [ /* future revisions */ ],
  "stats": {
    "totalPending": 5,
    "totalCompleted": 42,
    "completionRate": 89.4
  }
}
```

**Example cURL**:
```bash
curl http://localhost:3000/api/revisions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### Complete Revision

Mark a revision as completed.

**Endpoint**: `POST /api/revisions/[id]/complete`

**Authentication**: Required

**Request Body**:
```json
{
  "performanceNotes": "Solved faster this time",
  "timeTaken": 12
}
```

**Response** (200):
```json
{
  "message": "Revision completed successfully",
  "revision": { /* updated revision */ },
  "xpEarned": 10
}
```

---

## Analytics Endpoints

### Get Analytics

Retrieve comprehensive user analytics.

**Endpoint**: `GET /api/analytics`

**Authentication**: Required

**Response** (200):
```json
{
  "overview": {
    "totalProblems": 42,
    "easyCount": 15,
    "mediumCount": 20,
    "hardCount": 7,
    "currentStreak": 7,
    "longestStreak": 14,
    "level": 5,
    "xp": 850
  },
  "topicStats": {
    "Array": {
      "total": 12,
      "easy": 5,
      "medium": 5,
      "hard": 2,
      "avgTime": 25.5,
      "accuracy": 83.3
    }
  },
  "heatmap": [
    {
      "date": "2024-02-22",
      "count": 3
    }
  ],
  "streaks": {
    "current": 7,
    "longest": 14,
    "thisWeek": 5,
    "thisMonth": 22
  },
  "weakestTopics": [
    {
      "topic": "Dynamic Programming",
      "accuracy": 45.2
    }
  ],
  "recentProblems": [ /* last 10 problems */ ],
  "timeTrends": {
    "thisWeek": 28.5,
    "lastWeek": 32.1,
    "improvement": 11.2
  }
}
```

**Example cURL**:
```bash
curl http://localhost:3000/api/analytics \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Friends Endpoints

### Get Friends

Retrieve friends list with optional status filter.

**Endpoint**: `GET /api/friends`

**Authentication**: Required

**Query Parameters**:
- `status` (string): Filter by status (Pending/Accepted/Rejected)

**Response** (200):
```json
{
  "friends": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "status": "Accepted",
      "friend": {
        "_id": "507f1f77bcf86cd799439015",
        "name": "Jane Smith",
        "username": "janesmith",
        "level": 7,
        "currentStreak": 12,
        "totalProblemsSolved": 68
      },
      "createdAt": "2024-02-20T15:00:00.000Z"
    }
  ]
}
```

---

### Send Friend Request

Send a friend request by username.

**Endpoint**: `POST /api/friends`

**Authentication**: Required

**Request Body**:
```json
{
  "username": "janesmith"
}
```

**Response** (201):
```json
{
  "message": "Friend request sent successfully",
  "connection": { /* connection object */ }
}
```

---

### Respond to Friend Request

Accept or reject a friend request.

**Endpoint**: `POST /api/friends/[id]/respond`

**Authentication**: Required

**Request Body**:
```json
{
  "action": "accept"
}
```

**Actions**: `accept` or `reject`

**Response** (200):
```json
{
  "message": "Friend request accepted",
  "connection": { /* updated connection */ }
}
```

---

### View Friend's Dashboard

Get a friend's dashboard statistics.

**Endpoint**: `GET /api/friends/[friendId]/dashboard`

**Authentication**: Required

**Response** (200):
```json
{
  "user": {
    "name": "Jane Smith",
    "username": "janesmith",
    "level": 7,
    "currentStreak": 12
  },
  "stats": {
    "totalProblems": 68,
    "easyCount": 25,
    "mediumCount": 30,
    "hardCount": 13
  },
  "recentActivity": [ /* recent problems */ ]
}
```

---

### Compare Solutions

Compare solutions for the same problem.

**Endpoint**: `GET /api/friends/compare`

**Authentication**: Required

**Query Parameters**:
- `friendId` (string): Friend's user ID
- `problemName` (string): Problem name to compare

**Response** (200):
```json
{
  "yourSolution": {
    "problemName": "Two Sum",
    "timeTaken": 15,
    "dateSolved": "2024-02-22",
    "approachSummary": "Hash map approach..."
  },
  "friendSolution": {
    "problemName": "Two Sum",
    "timeTaken": 12,
    "dateSolved": "2024-02-20",
    "approachSummary": "Two pointer approach..."
  }
}
```

---

## Challenges Endpoints

### Get Challenges

Retrieve user's challenges.

**Endpoint**: `GET /api/challenges`

**Authentication**: Required

**Response** (200):
```json
{
  "challenges": [
    {
      "_id": "507f1f77bcf86cd799439016",
      "title": "5 DP Problems in 3 Days",
      "description": "Solve 5 dynamic programming problems",
      "targetCount": 5,
      "topic": "Dynamic Programming",
      "startDate": "2024-02-22",
      "endDate": "2024-02-25",
      "status": "Active",
      "progress": {
        "507f1f77bcf86cd799439011": 2
      }
    }
  ]
}
```

---

### Create Challenge

Create a new challenge.

**Endpoint**: `POST /api/challenges`

**Authentication**: Required

**Request Body**:
```json
{
  "title": "5 DP Problems in 3 Days",
  "description": "Solve 5 dynamic programming problems",
  "targetCount": 5,
  "topic": "Dynamic Programming",
  "difficulty": "Medium",
  "durationDays": 3,
  "participants": ["507f1f77bcf86cd799439015"]
}
```

**Response** (201):
```json
{
  "message": "Challenge created successfully",
  "challenge": { /* challenge object */ }
}
```

---

## Comments Endpoints

### Get Comments

Retrieve comments for a problem.

**Endpoint**: `GET /api/comments`

**Authentication**: Required

**Query Parameters**:
- `problemId` (string): Problem ID

**Response** (200):
```json
{
  "comments": [
    {
      "_id": "507f1f77bcf86cd799439017",
      "content": "Great approach! I used a similar method.",
      "user": {
        "name": "Jane Smith",
        "username": "janesmith"
      },
      "reactions": [
        {
          "userId": "507f1f77bcf86cd799439011",
          "type": "like"
        }
      ],
      "createdAt": "2024-02-22T12:00:00.000Z"
    }
  ]
}
```

---

### Add Comment

Add a comment to a problem.

**Endpoint**: `POST /api/comments`

**Authentication**: Required

**Request Body**:
```json
{
  "problemId": "507f1f77bcf86cd799439012",
  "content": "Great approach! I used a similar method."
}
```

**Response** (201):
```json
{
  "message": "Comment added successfully",
  "comment": { /* comment object */ }
}
```

---

## AI Endpoints

### Get Problem Recommendations

Get AI-powered problem recommendations.

**Endpoint**: `GET /api/ai/recommendations`

**Authentication**: Required

**Requirements**: At least 5 problems solved

**Response** (200):
```json
{
  "recommendations": [
    {
      "problemName": "Longest Increasing Subsequence",
      "topic": "Dynamic Programming",
      "difficulty": "Medium",
      "reason": "Your DP accuracy is low at 45%. This is a classic DP problem.",
      "estimatedTime": 30
    }
  ],
  "strategy": "Focus on Dynamic Programming problems. Practice 3-4 this week.",
  "weeklyGoal": "Solve 5 DP problems to improve weak area",
  "focusAreas": ["Dynamic Programming", "Graph Traversal"]
}
```

---

### Analyze Solution

Get AI feedback on your approach.

**Endpoint**: `POST /api/ai/analyze-solution`

**Authentication**: Required

**Request Body**:
```json
{
  "problemName": "Two Sum",
  "difficulty": "Easy",
  "topic": "Array",
  "approach": "Used hash map to store complement values",
  "timeComplexity": "O(n)",
  "spaceComplexity": "O(n)"
}
```

**Response** (200):
```json
{
  "analysis": {
    "strengths": ["Optimal time complexity", "Clean approach"],
    "optimizations": ["Consider using two-pointer for sorted arrays"],
    "isBruteForce": false,
    "betterApproaches": [],
    "overallScore": 9
  }
}
```

---

### Compare Solutions (AI)

AI compares two users' solutions.

**Endpoint**: `POST /api/ai/compare`

**Authentication**: Required

**Request Body**:
```json
{
  "user1": {
    "username": "johndoe",
    "approach": "Hash map approach",
    "timeTaken": 15
  },
  "user2": {
    "username": "janesmith",
    "approach": "Two pointer approach",
    "timeTaken": 12
  },
  "problemName": "Two Sum"
}
```

**Response** (200):
```json
{
  "comparison": {
    "winner": "janesmith",
    "reason": "More efficient approach with less memory usage",
    "user1Analysis": "Good time complexity but uses extra space",
    "user2Analysis": "Optimal for sorted arrays, constant space",
    "suggestions": ["Learn two-pointer technique", "Consider space-time tradeoffs"]
  }
}
```

---

### Pattern Detection

Analyze solving patterns (requires 50+ problems).

**Endpoint**: `GET /api/ai/pattern-detection`

**Authentication**: Required

**Requirements**: At least 50 problems solved

**Response** (200):
```json
{
  "pattern": {
    "solvingStyle": "Iterative Problem Solver",
    "strengths": ["Arrays", "Hash Tables", "Two Pointers"],
    "weaknesses": ["Dynamic Programming", "Tree Recursion"],
    "favoriteTopics": ["Array", "String", "Hash Table"],
    "avoidedTopics": ["Graph", "Backtracking"],
    "avgTimeByDifficulty": {
      "Easy": 12,
      "Medium": 28,
      "Hard": 55
    },
    "consistency": {
      "weekday": 0.85,
      "weekend": 0.65
    },
    "learningCurve": "Progressive improver",
    "recommendations": [
      "Work on DP fundamentals",
      "Practice tree problems"
    ]
  }
}
```

---

### Weekly Growth Report

Generate or fetch weekly reports.

**Endpoint**: `POST /api/ai/weekly-report` (Generate)
**Endpoint**: `GET /api/ai/weekly-report` (Fetch)

**Authentication**: Required

**POST Response** (201):
```json
{
  "report": {
    "weekNumber": 8,
    "year": 2024,
    "summary": "Great week! Solved 12 problems, improved consistency.",
    "highlights": [
      "Solved first Hard problem",
      "Maintained 7-day streak"
    ],
    "areasOfImprovement": [
      "Dynamic Programming accuracy low",
      "Graph problems avoided"
    ],
    "nextWeekFocus": "Focus on DP problems, practice 3-4 this week",
    "statistics": {
      "problemsSolved": 12,
      "topicsExplored": ["Array", "String", "DP"],
      "avgTime": 24.5
    }
  }
}
```

**GET Response** (200):
```json
{
  "reports": [ /* array of past reports */ ]
}
```

---

### Confidence Score

Get interview readiness score.

**Endpoint**: `GET /api/ai/confidence`

**Authentication**: Required

**Requirements**: At least 20 problems solved

**Response** (200):
```json
{
  "confidence": {
    "overallScore": 72,
    "interviewReady": true,
    "breakdown": {
      "Easy": 85,
      "Medium": 65,
      "Hard": 40
    },
    "topicConfidence": {
      "Array": 90,
      "String": 85,
      "Dynamic Programming": 45,
      "Graph": 50
    },
    "strengths": ["Arrays", "Hash Tables"],
    "riskyTopics": ["Dynamic Programming", "Graph"],
    "recommendation": "Focus on DP and Graph. Solve 10 more Medium problems to reach 80% confidence."
  }
}
```

---

## Rate Limiting

**Current**: No rate limiting (add in production)

**Recommended**:
- Authentication endpoints: 5 requests/minute
- Problem endpoints: 60 requests/minute
- AI endpoints: 10 requests/minute

---

## WebSocket Support

**Status**: Not implemented (future feature)

**Planned**: Real-time friend activity updates

---

## Pagination

All list endpoints support pagination with these standard parameters:

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)

**Response includes**:
```json
{
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 100,
    "hasMore": true
  }
}
```

---

## Testing

### Using Postman

1. Import the collection (create one with all endpoints)
2. Set environment variable `token` after login
3. Use `{{token}}` in Authorization headers

### Using cURL

```bash
# Store token
TOKEN="your_jwt_token"

# Use in requests
curl http://localhost:3000/api/analytics \
  -H "Authorization: Bearer $TOKEN"
```

---

## Changelog

**v1.0.0** (Feb 2024)
- Initial API release
- All core endpoints implemented
- AI integration complete

---

**API Version**: 1.0.0
**Last Updated**: February 22, 2024
