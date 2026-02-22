# 🚀 Quick AI API Reference

## All AI Endpoints

| # | Feature | Method | Endpoint | Model |
|---|---------|--------|----------|-------|
| 1 | Weekly Growth Report | `GET` | `/api/ai/weekly-report` | 70B |
| 2 | Smart Recommendation | `GET` | `/api/ai/smart-recommendation` | 8B |
| 3 | Solution Comparison | `POST` | `/api/ai/compare` | 70B |
| 4 | Pattern Detection | `GET` | `/api/ai/pattern-detection` | 70B |
| 5 | Daily Reflection | `GET` | `/api/ai/reflection` | 8B |
| 6 | Challenge Generator | `POST` | `/api/ai/challenge` | 8B |

---

## Quick Test Commands

### 1. Weekly Report
```bash
curl http://localhost:3000/api/ai/weekly-report \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Smart Recommendation
```bash
curl http://localhost:3000/api/ai/smart-recommendation \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Pattern Detection
```bash
curl http://localhost:3000/api/ai/pattern-detection \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Daily Reflection
```bash
curl http://localhost:3000/api/ai/reflection \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Solution Comparison
```bash
curl -X POST http://localhost:3000/api/ai/compare \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "problemId": "PROBLEM_ID",
    "friendId": "FRIEND_USER_ID"
  }'
```

### 6. Challenge Generator
```bash
curl -X POST http://localhost:3000/api/ai/challenge \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "friendUsername": "john_doe"
  }'
```

---

## Frontend Usage Examples

### React/Next.js

```typescript
// Weekly Report
const getWeeklyReport = async () => {
  const res = await fetch('/api/ai/weekly-report', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  console.log(data.report);
};

// Smart Recommendation
const getRecommendation = async () => {
  const res = await fetch('/api/ai/smart-recommendation', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  console.log(data.recommendation);
};

// Daily Reflection
const getReflection = async () => {
  const res = await fetch('/api/ai/reflection', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  console.log(data.reflection);
};

// Challenge Generator
const createChallenge = async (friendUsername: string) => {
  const res = await fetch('/api/ai/challenge', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ friendUsername })
  });
  const data = await res.json();
  console.log(data.challenge);
};

// Solution Comparison
const compareSolutions = async (problemId: string, friendId: string) => {
  const res = await fetch('/api/ai/compare', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ problemId, friendId })
  });
  const data = await res.json();
  console.log(data.comparison);
};

// Pattern Detection
const getPatterns = async () => {
  const res = await fetch('/api/ai/pattern-detection', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  console.log(data.patterns);
};
```

---

## Response Examples

### Weekly Report Response
```json
{
  "success": true,
  "report": {
    "summary": "Completed 18 problems...",
    "strengths": ["DP mastery", "Consistent"],
    "weakAreas": ["Graph problems"],
    "improvementTrend": "50% increase",
    "nextWeekFocus": ["Focus on graphs"],
    "motivationalNote": "Great progress!"
  }
}
```

### Smart Recommendation Response
```json
{
  "success": true,
  "recommendation": {
    "recommendedTopics": ["Graph", "Backtracking"],
    "difficultySuggestion": "Medium for 2 weeks",
    "practicePlan": "3 problems daily",
    "revisionAdvice": "Complete 5 pending first"
  }
}
```

### Daily Reflection Response
```json
{
  "success": true,
  "reflection": {
    "reflection": "Practiced Tree & DFS",
    "keyTakeaway": "Null handling is weak",
    "improvementTip": "Draw tree first"
  },
  "problemsCount": 3
}
```

### Challenge Response
```json
{
  "success": true,
  "challenge": {
    "challengeTitle": "Graph Sprint",
    "duration": "7 days",
    "focusTopics": ["Graph", "Greedy"],
    "dailyGoal": "2 problems/day",
    "successCriteria": "14 problems, 80% success"
  }
}
```

---

## Environment Setup

```env
GROQ_API_KEY=gsk-your-groq-api-key-here
AI_PROVIDER=groq
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Direct Function Calls (No API Routes)

```typescript
import {
  generateWeeklyGrowthReport,
  generateSmartRecommendation,
  generateSolutionComparison,
  generatePatternDetection,
  generateReflection,
  generateChallenge,
} from '@/lib/ai-service';

// Example
const report = await generateWeeklyGrowthReport({
  totalSolved: 18,
  easy: 5,
  medium: 10,
  hard: 3,
  topicBreakdown: { Array: 6, DP: 4, Graph: 2 },
  weakestTopic: 'Graph',
  avgTimeMinutes: 32,
  revisionPending: 4,
  streak: 7,
  lastWeekSolved: 12,
});
```

---

## Error Handling

```typescript
const response = await fetch('/api/ai/weekly-report', {
  headers: { Authorization: `Bearer ${token}` }
});

if (!response.ok) {
  console.error('API Error:', response.status);
  return;
}

const data = await response.json();

if (!data.success) {
  console.error('AI Error:', data.error);
  return;
}

// Use data.report, data.recommendation, etc.
console.log(data);
```

---

## Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Unauthorized" | No/invalid token | Login and pass JWT token |
| "No problems solved" | Insufficient data | Solve more problems |
| "AI service not configured" | Missing GROQ_API_KEY | Check .env.local |
| "Failed to generate" | Groq API error | Check network/API status |

---

## Rate Limits

- **Groq Free Tier:** 30 requests/minute
- **Recommended:** Cache responses in DB
- **Retry Logic:** Implement exponential backoff

---

## Models Used

| Model | ID | Use Case |
|-------|-----|----------|
| Llama 3.3 70B | `llama-3.3-70b-versatile` | Complex analysis |
| Llama 3.1 8B | `llama-3.1-8b-instant` | Quick responses |

---

**Ready to use all 6 AI features! 🎉**
