import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Problem from '@/models/Problem';
import Revision from '@/models/Revision';
import { authenticateRequest } from '@/lib/auth';
import { generateAIResponse, AI_PROMPTS } from '@/lib/ai-service';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest();
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const problems = await Problem.find({ userId: auth.user.userId });

    if (problems.length < 20) {
      return NextResponse.json({
        message: 'Solve at least 20 problems for confidence estimation',
        confidence: null,
      });
    }

    // Calculate revision rate
    const totalRevisions = await Revision.countDocuments({
      userId: auth.user.userId,
    });
    const completedRevisions = await Revision.countDocuments({
      userId: auth.user.userId,
      status: 'Completed',
    });
    const revisionRate = totalRevisions > 0 ? (completedRevisions / totalRevisions) * 100 : 0;

    // Calculate reattempt success
    const reattemptedProblems = problems.filter((p) => p.timesAttempted > 1);
    const successfulReattempts = reattemptedProblems.filter((p) => p.status === 'Solved');
    const reattemptSuccess =
      reattemptedProblems.length > 0
        ? (successfulReattempts.length / reattemptedProblems.length) * 100
        : 0;

    // Topic stats
    const topicStats: any = {};
    problems.forEach((p) => {
      if (!topicStats[p.topic]) {
        topicStats[p.topic] = { total: 0, solved: 0 };
      }
      topicStats[p.topic].total++;
      if (p.status === 'Solved') {
        topicStats[p.topic].solved++;
      }
    });

    // Calculate consistency (unique solve dates in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentProblems = problems.filter((p) => new Date(p.dateSolved) >= thirtyDaysAgo);
    const uniqueDates = [...new Set(recentProblems.map((p) => p.dateSolved.toDateString()))];
    const consistency = Math.min((uniqueDates.length / 30) * 100, 100);

    const userStats = {
      totalProblems: problems.length,
      revisionRate: revisionRate.toFixed(1),
      topicStats,
      reattemptSuccess: reattemptSuccess.toFixed(1),
      consistency: consistency.toFixed(1),
    };

    // Generate AI confidence estimation
    const aiResponse = await generateAIResponse({
      systemPrompt: AI_PROMPTS.CONFIDENCE_ESTIMATOR.system,
      userPrompt: AI_PROMPTS.CONFIDENCE_ESTIMATOR.buildUserPrompt(userStats),
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
      confidence: aiResponse.data,
      stats: userStats,
    });
  } catch (error) {
    console.error('AI confidence estimation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
