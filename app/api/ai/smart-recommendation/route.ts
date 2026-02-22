import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Problem from '@/models/Problem';
import { authenticateRequest } from '@/lib/auth';
import { generateSmartRecommendation } from '@/lib/ai-service';

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
        message: 'Solve at least 5 problems to get smart recommendations',
        recommendation: null,
      });
    }

    // Calculate weak topics (less than 5 problems per topic)
    const topicStats: Record<string, number> = {};
    problems.forEach((p) => {
      topicStats[p.topic] = (topicStats[p.topic] || 0) + 1;
    });

    const weakTopics = Object.entries(topicStats)
      .filter(([, count]) => count < 5)
      .map(([topic]) => topic)
      .slice(0, 3); // Top 3 weak topics

    // Calculate days since last hard problem
    const hardProblems = problems.filter((p) => p.difficulty === 'Hard');
    const lastHardDate = hardProblems.length > 0
      ? new Date(hardProblems[hardProblems.length - 1].dateSolved)
      : null;
    
    const noHardSolvedInDays = lastHardDate
      ? Math.floor((Date.now() - lastHardDate.getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    // Count revision pending (problems due for revision)
    const now = new Date();
    const revisionPending = problems.filter((p) => {
      if (!p.nextRevisionDate) return false;
      return new Date(p.nextRevisionDate) <= now && p.status !== 'mastered';
    }).length;

    // Calculate average time
    const avgTime = problems.reduce((sum, p) => sum + (p.timeTaken || 0), 0) / problems.length;

    const stats = {
      weakTopics: weakTopics.length > 0 ? weakTopics : ['Array', 'String'],
      noHardSolvedInDays,
      revisionPending,
      avgTime: Math.floor(avgTime),
    };

    // Generate AI recommendation
    const aiResponse = await generateSmartRecommendation(stats);

    if (!aiResponse.success) {
      return NextResponse.json(
        { error: aiResponse.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      recommendation: aiResponse.data,
      stats,
    });
  } catch (error: any) {
    console.error('Smart Recommendation Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendation' },
      { status: 500 }
    );
  }
}
