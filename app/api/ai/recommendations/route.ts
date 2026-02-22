import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Problem from '@/models/Problem';
import UserStats from '@/models/UserStats';
import { authenticateRequest } from '@/lib/auth';
import { generateAIResponse, AI_PROMPTS } from '@/lib/ai-service';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest();
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get user's problem data
    const problems = await Problem.find({ userId: auth.user.userId });

    if (problems.length < 5) {
      return NextResponse.json({
        message: 'Solve at least 5 problems to get AI recommendations',
        recommendations: [],
      });
    }

    // Calculate stats
    const topicStats: any = {};
    problems.forEach((p) => {
      if (!topicStats[p.topic]) {
        topicStats[p.topic] = { total: 0, easy: 0, medium: 0, hard: 0 };
      }
      topicStats[p.topic].total++;
      topicStats[p.topic][p.difficulty.toLowerCase()]++;
    });

    // Find weak topics (less than 5 problems)
    const weakTopics = Object.entries(topicStats)
      .filter(([, stats]: any) => stats.total < 5)
      .map(([topic]) => topic);

    const stats = {
      totalProblems: problems.length,
      easyCount: problems.filter((p) => p.difficulty === 'Easy').length,
      mediumCount: problems.filter((p) => p.difficulty === 'Medium').length,
      hardCount: problems.filter((p) => p.difficulty === 'Hard').length,
      weakTopics,
      topicStats,
      lastActivity: problems[problems.length - 1]?.dateSolved || new Date(),
    };

    // Generate AI recommendations
    const aiResponse = await generateAIResponse({
      systemPrompt: AI_PROMPTS.PROBLEM_RECOMMENDATION.system,
      userPrompt: AI_PROMPTS.PROBLEM_RECOMMENDATION.buildUserPrompt(stats),
      temperature: 0.7,
      jsonMode: true,
    });

    if (!aiResponse.success) {
      return NextResponse.json(
        { error: aiResponse.error || 'AI service error' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      recommendations: aiResponse.data,
      stats,
    });
  } catch (error) {
    console.error('AI recommendations error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
