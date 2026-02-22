import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Problem from '@/models/Problem';
import User from '@/models/User';
import FriendConnection from '@/models/FriendConnection';
import { authenticateRequest } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticateRequest();
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Verify friendship
    const friendship = await FriendConnection.findOne({
      $or: [
        { requesterId: auth.user.userId, recipientId: params.id },
        { requesterId: params.id, recipientId: auth.user.userId },
      ],
      status: 'Accepted',
    });

    if (!friendship) {
      return NextResponse.json({ error: 'Not friends' }, { status: 403 });
    }

    // Get friend's problems
    const problems = await Problem.find({ userId: params.id })
      .sort({ dateSolved: -1 })
      .limit(50);

    // Get friend's user info
    const friend = await User.findById(params.id).select('-password');

    // Calculate friend stats
    const totalProblems = problems.length;
    const easyCount = problems.filter((p) => p.difficulty === 'Easy').length;
    const mediumCount = problems.filter((p) => p.difficulty === 'Medium').length;
    const hardCount = problems.filter((p) => p.difficulty === 'Hard').length;

    const topicStats: any = {};
    problems.forEach((p) => {
      if (!topicStats[p.topic]) {
        topicStats[p.topic] = 0;
      }
      topicStats[p.topic]++;
    });

    return NextResponse.json({
      friend,
      recentProblems: problems.slice(0, 10),
      stats: {
        totalProblems,
        difficultyDistribution: {
          easy: easyCount,
          medium: mediumCount,
          hard: hardCount,
        },
        topicStats,
        currentStreak: friend?.currentStreak || 0,
        level: friend?.level || 1,
      },
    });
  } catch (error) {
    console.error('Get friend dashboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
