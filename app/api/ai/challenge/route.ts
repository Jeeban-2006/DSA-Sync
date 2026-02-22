import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Problem from '@/models/Problem';
import User from '@/models/User';
import { authenticateRequest } from '@/lib/auth';
import { generateChallenge } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest();
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { friendUsername } = body;

    if (!friendUsername) {
      return NextResponse.json(
        { error: 'friendUsername is required' },
        { status: 400 }
      );
    }

    // Get friend user
    const friendUser = await User.findOne({ username: friendUsername });
    if (!friendUser) {
      return NextResponse.json(
        { error: 'Friend user not found' },
        { status: 404 }
      );
    }

    // Get both users' problems
    const [userProblems, friendProblems] = await Promise.all([
      Problem.find({ userId: auth.user.userId }),
      Problem.find({ userId: friendUser._id }),
    ]);

    // Calculate weak topics for both users
    const getUserWeakTopics = (problems: any[]) => {
      const topicStats: Record<string, number> = {};
      problems.forEach((p) => {
        topicStats[p.topic] = (topicStats[p.topic] || 0) + 1;
      });

      // Topics with less than 5 problems are considered weak
      return Object.entries(topicStats)
        .filter(([, count]) => count < 5)
        .map(([topic]) => topic)
        .slice(0, 3); // Top 3 weak topics
    };

    const userAWeakTopics = getUserWeakTopics(userProblems);
    const userBWeakTopics = getUserWeakTopics(friendProblems);

    // Check if both have inconsistent streak (placeholder logic)
    // In real implementation, you'd check UserStats model for streak data
    const bothInconsistentStreak = userProblems.length < 10 || friendProblems.length < 10;

    const challengeData = {
      userAWeakTopics: userAWeakTopics.length > 0 ? userAWeakTopics : ['Array', 'String'],
      userBWeakTopics: userBWeakTopics.length > 0 ? userBWeakTopics : ['Tree', 'Graph'],
      bothInconsistentStreak,
    };

    // Generate AI challenge
    const aiResponse = await generateChallenge(challengeData);

    if (!aiResponse.success) {
      return NextResponse.json(
        { error: aiResponse.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      challenge: aiResponse.data,
      participants: {
        user: auth.user.username,
        friend: friendUsername,
      },
    });
  } catch (error: any) {
    console.error('Challenge Generation Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate challenge' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest();
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      message: 'Use POST with friendUsername to generate a challenge',
      example: {
        friendUsername: 'john_doe',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
