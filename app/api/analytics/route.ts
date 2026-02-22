import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Problem from '@/models/Problem';
import User from '@/models/User';
import { authenticateRequest } from '@/lib/auth';
import { calculateStreak } from '@/lib/utils';
import { startOfDay, endOfDay, subDays } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest();
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const userId = auth.user.userId;

    // Get all problems
    const problems = await Problem.find({ userId });

    // Calculate totals
    const totalProblems = problems.length;
    const easyCount = problems.filter((p) => p.difficulty === 'Easy').length;
    const mediumCount = problems.filter((p) => p.difficulty === 'Medium').length;
    const hardCount = problems.filter((p) => p.difficulty === 'Hard').length;

    // Topic distribution
    const topicStats: any = {};
    problems.forEach((p) => {
      if (!topicStats[p.topic]) {
        topicStats[p.topic] = { total: 0, easy: 0, medium: 0, hard: 0 };
      }
      topicStats[p.topic].total++;
      topicStats[p.topic][p.difficulty.toLowerCase()]++;
    });

    // Heatmap data (last 90 days)
    const last90Days = Array.from({ length: 90 }, (_, i) => {
      const date = subDays(new Date(), i);
      return {
        date: startOfDay(date).toISOString(),
        count: 0,
      };
    }).reverse();

    problems.forEach((p) => {
      const problemDate = startOfDay(new Date(p.dateSolved)).toISOString();
      const dayData = last90Days.find((d) => d.date === problemDate);
      if (dayData) {
        dayData.count++;
      }
    });

    // Calculate streaks
    const dates = problems.map((p) => new Date(p.dateSolved));
    const { current: currentStreak, longest: longestStreak } = calculateStreak(dates);

    // Update user streaks
    await User.findByIdAndUpdate(userId, {
      currentStreak,
      longestStreak: Math.max(longestStreak, (await User.findById(userId))?.longestStreak || 0),
    });

    // Weakest topics (least problems solved)
    const sortedTopics = Object.entries(topicStats)
      .sort(([, a]: any, [, b]: any) => a.total - b.total)
      .slice(0, 3)
      .map(([topic]) => topic);

    // Recent activity
    const recentProblems = problems
      .sort((a, b) => new Date(b.dateSolved).getTime() - new Date(a.dateSolved).getTime())
      .slice(0, 10);

    // Time trend (avg time by difficulty)
    const timeTrend = {
      easy: problems.filter((p) => p.difficulty === 'Easy').reduce((sum, p) => sum + p.timeTaken, 0) / (easyCount || 1),
      medium: problems.filter((p) => p.difficulty === 'Medium').reduce((sum, p) => sum + p.timeTaken, 0) / (mediumCount || 1),
      hard: problems.filter((p) => p.difficulty === 'Hard').reduce((sum, p) => sum + p.timeTaken, 0) / (hardCount || 1),
    };

    // Get updated user data
    const user = await User.findById(userId);

    return NextResponse.json({
      totalProblems,
      difficultyDistribution: {
        easy: easyCount,
        medium: mediumCount,
        hard: hardCount,
      },
      topicStats,
      heatmap: last90Days,
      currentStreak,
      longestStreak,
      weakestTopics: sortedTopics,
      recentProblems,
      timeTrend,
      user: user ? {
        xp: user.xp,
        level: user.level,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        totalProblemsSolved: user.totalProblemsSolved,
      } : null,
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
