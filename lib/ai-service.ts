import Groq from 'groq-sdk';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

// Initialize Groq client
const groq = GROQ_API_KEY ? new Groq({ apiKey: GROQ_API_KEY }) : null;

// Models
const MODELS = {
  LARGE: 'llama-3.3-70b-versatile', // For complex analysis
  FAST: 'llama-3.1-8b-instant', // For quick responses
};

export interface AIRequestOptions {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean; // For backward compatibility (always true with Groq)
}

export interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Core function to generate AI responses using Groq
 */
export const generateAIResponse = async (
  options: AIRequestOptions
): Promise<AIResponse> => {
  try {
    if (!groq) {
      return {
        success: false,
        error: 'AI service not configured. Please add GROQ_API_KEY to environment variables.',
      };
    }

    const {
      systemPrompt,
      userPrompt,
      model = MODELS.LARGE,
      temperature = 0.3,
      maxTokens = 2048,
    } = options;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      model,
      temperature,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' },
    });

    const content = chatCompletion.choices[0]?.message?.content || '{}';
    const parsedData = JSON.parse(content);

    return { success: true, data: parsedData };
  } catch (error: any) {
    console.error('Groq AI Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate AI response',
    };
  }
};

// =====================================================
// 1️⃣ WEEKLY GROWTH REPORT
// =====================================================
export interface WeeklyStats {
  totalSolved: number;
  easy: number;
  medium: number;
  hard: number;
  topicBreakdown: Record<string, number>;
  weakestTopic: string;
  avgTimeMinutes: number;
  revisionPending: number;
  streak: number;
  lastWeekSolved: number;
}

export interface WeeklyGrowthReport {
  summary: string;
  strengths: string[];
  weakAreas: string[];
  improvementTrend: string;
  nextWeekFocus: string[];
  motivationalNote: string;
}

export const generateWeeklyGrowthReport = async (
  stats: WeeklyStats
): Promise<AIResponse> => {
  const systemPrompt = `You are an expert DSA mentor and performance analyst.
Analyze structured user statistics and generate a concise, actionable weekly growth report.
Always return valid JSON only. No extra text.`;

  const userPrompt = `User Weekly Stats:
${JSON.stringify(stats, null, 2)}

Generate a weekly growth analysis.
Return JSON in this format:
{
  "summary": "",
  "strengths": [],
  "weakAreas": [],
  "improvementTrend": "",
  "nextWeekFocus": [],
  "motivationalNote": ""
}`;

  return generateAIResponse({
    systemPrompt,
    userPrompt,
    model: MODELS.LARGE,
    temperature: 0.3,
  });
};

// =====================================================
// 2️⃣ SMART RECOMMENDATION
// =====================================================
export interface RecommendationStats {
  weakTopics: string[];
  noHardSolvedInDays: number;
  revisionPending: number;
  avgTime: number;
}

export interface SmartRecommendation {
  recommendedTopics: string[];
  difficultySuggestion: string;
  practicePlan: string;
  revisionAdvice: string;
}

export const generateSmartRecommendation = async (
  stats: RecommendationStats
): Promise<AIResponse> => {
  const systemPrompt = `You are a DSA practice recommendation engine.
Suggest focused practice strategy based on performance stats.
Return JSON only.`;

  const userPrompt = `User Stats:
${JSON.stringify(stats, null, 2)}

Generate recommendation.
Return JSON:
{
  "recommendedTopics": [],
  "difficultySuggestion": "",
  "practicePlan": "",
  "revisionAdvice": ""
}`;

  return generateAIResponse({
    systemPrompt,
    userPrompt,
    model: MODELS.FAST,
    temperature: 0.3,
  });
};

// =====================================================
// 3️⃣ SOLUTION COMPARISON
// =====================================================
export interface UserSolution {
  timeTaken: number;
  approach: string;
  mistakes: string;
}

export interface SolutionComparisonData {
  problemName: string;
  userA: UserSolution & { name: string };
  userB: UserSolution & { name: string };
}

export interface SolutionComparison {
  betterApproach: string;
  efficiencyComparison: string;
  learningInsight: string;
  suggestedHybridIdea: string;
}

export const generateSolutionComparison = async (
  data: SolutionComparisonData
): Promise<AIResponse> => {
  const systemPrompt = `You are a DSA solution comparison expert.
Compare two users' approaches and generate structured insight.
Return JSON only.`;

  const userPrompt = `Problem: ${data.problemName}

User A (${data.userA.name}):
{
  "timeTaken": ${data.userA.timeTaken},
  "approach": "${data.userA.approach}",
  "mistakes": "${data.userA.mistakes}"
}

User B (${data.userB.name}):
{
  "timeTaken": ${data.userB.timeTaken},
  "approach": "${data.userB.approach}",
  "mistakes": "${data.userB.mistakes}"
}

Return JSON:
{
  "betterApproach": "",
  "efficiencyComparison": "",
  "learningInsight": "",
  "suggestedHybridIdea": ""
}`;

  return generateAIResponse({
    systemPrompt,
    userPrompt,
    model: MODELS.LARGE,
    temperature: 0.3,
  });
};

// =====================================================
// 4️⃣ PATTERN DETECTION (After 50+ Problems)
// =====================================================
export interface LongTermData {
  totalSolved: number;
  avgTime: number;
  accuracy: number;
  weakTopics: string[];
  frequentMistakes: string[];
  hardSolved: number;
}

export interface PatternDetection {
  solvingPersonality: string;
  majorPatterns: string[];
  riskAreas: string[];
  interviewReadinessLevel: string;
  strategicAdvice: string;
}

export const generatePatternDetection = async (
  data: LongTermData
): Promise<AIResponse> => {
  const systemPrompt = `You are an AI DSA performance pattern detector.
Analyze long-term solving data and identify behavioral patterns.
Return structured JSON only.`;

  const userPrompt = `User Long Term Data:
${JSON.stringify(data, null, 2)}

Return JSON:
{
  "solvingPersonality": "",
  "majorPatterns": [],
  "riskAreas": [],
  "interviewReadinessLevel": "",
  "strategicAdvice": ""
}`;

  return generateAIResponse({
    systemPrompt,
    userPrompt,
    model: MODELS.LARGE,
    temperature: 0.3,
  });
};

// =====================================================
// 5️⃣ AI REFLECTION GENERATOR
// =====================================================
export interface TodayActivity {
  topicsPracticed: string[];
  problemsSolved: number;
  difficulties: string[];
  mistakes: string[];
}

export interface Reflection {
  reflection: string;
  keyTakeaway: string;
  improvementTip: string;
}

export const generateReflection = async (
  activity: TodayActivity
): Promise<AIResponse> => {
  const systemPrompt = `You are a concise DSA reflection assistant.
Generate a short reflective summary.
Return JSON only.`;

  const userPrompt = `Today's Activity:
${JSON.stringify(activity, null, 2)}

Return JSON:
{
  "reflection": "",
  "keyTakeaway": "",
  "improvementTip": ""
}`;

  return generateAIResponse({
    systemPrompt,
    userPrompt,
    model: MODELS.FAST,
    temperature: 0.3,
  });
};

// =====================================================
// 6️⃣ AI CHALLENGE GENERATOR
// =====================================================
export interface ChallengeData {
  userAWeakTopics: string[];
  userBWeakTopics: string[];
  bothInconsistentStreak: boolean;
}

export interface Challenge {
  challengeTitle: string;
  duration: string;
  focusTopics: string[];
  dailyGoal: string;
  successCriteria: string;
}

export const generateChallenge = async (
  data: ChallengeData
): Promise<AIResponse> => {
  const systemPrompt = `You are a DSA challenge planner.
Create a short collaborative challenge plan.
Return JSON only.`;

  const userPrompt = `User A Weak Topics: ${JSON.stringify(data.userAWeakTopics)}
User B Weak Topics: ${JSON.stringify(data.userBWeakTopics)}
Both inconsistent streak: ${data.bothInconsistentStreak}

Return JSON:
{
  "challengeTitle": "",
  "duration": "",
  "focusTopics": [],
  "dailyGoal": "",
  "successCriteria": ""
}`;

  return generateAIResponse({
    systemPrompt,
    userPrompt,
    model: MODELS.FAST,
    temperature: 0.3,
  });
};

// AI Prompts Templates (Legacy)
export const AI_PROMPTS = {
  PROBLEM_RECOMMENDATION: {
    system: `You are an expert DSA mentor. Analyze user statistics and provide problem recommendations in strict JSON format.
    
Return JSON with this structure:
{
  "recommendations": [
    {
      "topic": "string",
      "difficulty": "Easy|Medium|Hard",
      "reason": "string",
      "focusAreas": ["string"],
      "estimatedTime": "number (minutes)"
    }
  ],
  "strategy": "string",
  "weeklyGoal": "string"
}`,
    buildUserPrompt: (stats: any) => `
User Statistics:
- Total Problems: ${stats.totalProblems}
- Easy: ${stats.easyCount}, Medium: ${stats.mediumCount}, Hard: ${stats.hardCount}
- Weak Topics: ${JSON.stringify(stats.weakTopics)}
- Topic Stats: ${JSON.stringify(stats.topicStats)}
- Last Activity: ${stats.lastActivity}

Provide 3-5 problem recommendations focusing on weak areas and balanced difficulty progression.`,
  },

  SOLUTION_ANALYZER: {
    system: `You are a DSA code review expert. Analyze the approach and provide optimization suggestions in strict JSON format.

Return JSON with this structure:
{
  "analysis": {
    "approachType": "string",
    "timeComplexity": "string",
    "spaceComplexity": "string",
    "isBruteForce": boolean,
    "strengths": ["string"],
    "weaknesses": ["string"]
  },
  "suggestions": [
    {
      "type": "optimization|pattern|edge-case",
      "title": "string",
      "description": "string",
      "impact": "high|medium|low"
    }
  ],
  "alternativeApproaches": ["string"],
  "rating": number (1-10)
}`,
    buildUserPrompt: (problem: any) => `
Problem: ${problem.problemName}
Difficulty: ${problem.difficulty}
Topic: ${problem.topic}
Your Approach: ${problem.approachSummary}
Mistakes Faced: ${problem.mistakesFaced}
Time Taken: ${problem.timeTaken} minutes

Analyze this solution and provide optimization insights.`,
  },

  COMPARISON_INSIGHT: {
    system: `You are a DSA mentor comparing two users' solutions. Provide comparative analysis in strict JSON format.

Return JSON with this structure:
{
  "comparison": {
    "problem": "string",
    "user1Analysis": {
      "approach": "string",
      "efficiency": "high|medium|low",
      "strengths": ["string"]
    },
    "user2Analysis": {
      "approach": "string",
      "efficiency": "high|medium|low",
      "strengths": ["string"]
    },
    "winner": "user1|user2|tie",
    "reasoning": "string"
  },
  "learnings": ["string"],
  "hybridApproach": "string",
  "keyTakeaway": "string"
}`,
    buildUserPrompt: (user1Data: any, user2Data: any) => `
Problem: ${user1Data.problemName}

User 1 (${user1Data.username}):
- Approach: ${user1Data.approachSummary}
- Time Taken: ${user1Data.timeTaken} minutes
- Mistakes: ${user1Data.mistakesFaced}

User 2 (${user2Data.username}):
- Approach: ${user2Data.approachSummary}
- Time Taken: ${user2Data.timeTaken} minutes
- Mistakes: ${user2Data.mistakesFaced}

Compare their approaches and provide insights.`,
  },

  PATTERN_DETECTION: {
    system: `You are a DSA learning pattern analyst. Analyze user's solving patterns and provide personality profile in strict JSON format.

Return JSON with this structure:
{
  "profile": {
    "solvingStyle": "fast-solver|careful-thinker|pattern-matcher|explorer",
    "strengths": ["string"],
    "weaknesses": ["string"],
    "characteristics": ["string"]
  },
  "patterns": [
    {
      "type": "positive|negative",
      "pattern": "string",
      "frequency": "high|medium|low",
      "impact": "string"
    }
  ],
  "recommendations": ["string"],
  "focusAreas": ["string"]
}`,
    buildUserPrompt: (problems: any[]) => `
Analyze these ${problems.length} problems solved by the user:

${problems.map((p, i) => `
${i + 1}. ${p.problemName} (${p.difficulty})
   - Topic: ${p.topic}
   - Time: ${p.timeTaken}min
   - Status: ${p.status}
   - Mistakes: ${p.mistakesFaced}
`).join('\n')}

Detect solving patterns, common mistakes, and personality profile.`,
  },

  WEEKLY_GROWTH_REPORT: {
    system: `You are a DSA growth analyst. Create a motivating weekly growth report in strict JSON format.

Return JSON with this structure:
{
  "summary": {
    "week": number,
    "year": number,
    "totalSolved": number,
    "improvement": "string",
    "highlights": ["string"]
  },
  "topicProgress": [
    {
      "topic": "string",
      "problemsSolved": number,
      "trend": "improving|stable|declining",
      "note": "string"
    }
  ],
  "achievements": ["string"],
  "challenges": ["string"],
  "nextWeekFocus": {
    "primaryTopic": "string",
    "targetProblems": number,
    "strategy": "string"
  },
  "motivationalMessage": "string"
}`,
    buildUserPrompt: (weekStats: any) => `
Week ${weekStats.weekNumber}, ${weekStats.year} Statistics:

Total Problems Solved: ${weekStats.totalSolved}
Topics Covered: ${JSON.stringify(weekStats.topics)}
Difficulty Distribution: Easy: ${weekStats.easy}, Medium: ${weekStats.medium}, Hard: ${weekStats.hard}
Streak: ${weekStats.streak} days
Previous Week: ${weekStats.previousWeek} problems

Generate a comprehensive growth report with actionable insights.`,
  },

  CONFIDENCE_ESTIMATOR: {
    system: `You are a technical interview readiness evaluator. Assess user's confidence and readiness in strict JSON format.

Return JSON with this structure:
{
  "overallConfidence": number (0-100),
  "topicConfidence": [
    {
      "topic": "string",
      "score": number (0-100),
      "readiness": "interview-ready|needs-practice|beginner",
      "reasoning": "string"
    }
  ],
  "interviewReadiness": {
    "score": number (0-100),
    "level": "ready|almost-ready|needs-work",
    "strengths": ["string"],
    "gaps": ["string"]
  },
  "recommendations": ["string"],
  "estimatedTimeToReady": "string"
}`,
    buildUserPrompt: (userStats: any) => `
User DSA Performance:

Total Problems: ${userStats.totalProblems}
Revision Completion Rate: ${userStats.revisionRate}%
Topic Distribution: ${JSON.stringify(userStats.topicStats)}
Average Reattempt Success: ${userStats.reattemptSuccess}%
Consistency: ${userStats.consistency}

Estimate confidence and interview readiness.`,
  },
};
