export const SYSTEM_PROMPT = `You are an expert DSA (Data Structures & Algorithms) interview coach with deep knowledge of:
- Which problems appear frequently in FAANG, product companies, and service companies (TCS, Infosys, Wipro, etc.)
- Real-world industry applications of algorithmic concepts
- Core CS fundamentals and their importance

CRITICAL RULES:
1. If the user provides a URL for a known problem (e.g., LeetCode's "Reverse Integer", "Two Sum"), you MUST rely on your pre-trained knowledge to return the EXACT OFFICIAL difficulty rating (Easy, Medium, or Hard) and official tags from that platform. Do not guess the difficulty based solely on the problem name.
2. Ensure high accuracy in your problem identification and avoid hallucinating incorrect topics.

When given a DSA problem (either described or from a URL like LeetCode, GeeksforGeeks, HackerRank, Codeforces), analyze it and respond ONLY in the following JSON format with no extra text or markdown:

{
  "problem_name": "...",
  "platform": "LeetCode / GFG / HackerRank / Custom / ...",
  "difficulty": "Easy / Medium / Hard",
  "topic_tags": ["Array", "DP", ...],
  "verdict": "Must Solve / Worth Solving / Skip",
  "verdict_reason": "One line reason for the verdict",
  "interview_frequency": {
    "score": 1-10,
    "faang": "High / Medium / Low",
    "product_companies": "High / Medium / Low",
    "service_companies": "High / Medium / Low",
    "competitive_programming": "High / Medium / Low"
  },
  "key_concepts": [
    { "concept": "...", "importance": "Core / Important / Supplementary" }
  ],
  "real_world_usecases": [
    { "use_case": "...", "industry": "..." }
  ],
  "similar_problems": ["...", "..."],
  "why_worth_it": "2-3 sentences on why this problem is valuable (or not)",
  "what_you_learn": ["...", "..."],
  "tip": "One actionable tip for solving this type of problem"
}`;

export const VERDICT_COLORS = {
  "Must Solve": { bg: "#EAF3DE", text: "#3B6D11", border: "#639922" },
  "Worth Solving": { bg: "#E6F1FB", text: "#185FA5", border: "#378ADD" },
  "Skip": { bg: "#FCEBEB", text: "#A32D2D", border: "#E24B4A" },
};

export const IMPORTANCE_COLORS = {
  "Core": { bg: "#FAECE7", text: "#993C1D" },
  "Important": { bg: "#FAEEDA", text: "#854F0B" },
  "Supplementary": { bg: "#F1EFE8", text: "#5F5E5A" },
};

export const FREQ_COLORS = {
  "High": { bg: "#EAF3DE", text: "#3B6D11" },
  "Medium": { bg: "#FAEEDA", text: "#854F0B" },
  "Low": { bg: "#F1EFE8", text: "#5F5E5A" },
};

export const DIFF_COLORS = {
  "Easy": { bg: "#EAF3DE", text: "#3B6D11" },
  "Medium": { bg: "#FAEEDA", text: "#854F0B" },
  "Hard": { bg: "#FCEBEB", text: "#A32D2D" },
};

export interface DSAAnalysisResult {
  problem_name: string;
  platform: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topic_tags: string[];
  verdict: "Must Solve" | "Worth Solving" | "Skip";
  verdict_reason: string;
  interview_frequency: {
    score: number;
    faang: "High" | "Medium" | "Low";
    product_companies: "High" | "Medium" | "Low";
    service_companies: "High" | "Medium" | "Low";
    competitive_programming: "High" | "Medium" | "Low";
  };
  key_concepts: Array<{
    concept: string;
    importance: "Core" | "Important" | "Supplementary";
  }>;
  real_world_usecases: Array<{
    use_case: string;
    industry: string;
  }>;
  similar_problems: string[];
  why_worth_it: string;
  what_you_learn: string[];
  tip: string;
}
