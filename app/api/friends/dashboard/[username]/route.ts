import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Problem from '@/models/Problem';
import ActivityLog from '@/models/ActivityLog';
import FriendConnection from '@/models/FriendConnection';
import { authenticateRequest } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const auth = await authenticateRequest();
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { username } = params;

    // Find the friend by username
    const friend = await User.findOne({ username: username.toLowerCase() });

    if (!friend) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify friendship exists
    const friendship = await FriendConnection.findOne({
      $or: [
        { requesterId: auth.user.userId, recipientId: friend._id, status: 'Accepted' },
        { requesterId: friend._id, recipientId: auth.user.userId, status: 'Accepted' },
      ],
    });

    if (!friendship) {
      return NextResponse.json({ error: 'Not friends with this user' }, { status: 403 });
    }

    // Get current user data for comparison
    const currentUser = await User.findById(auth.user.userId);

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch friend's problems
    const friendProblems = await Problem.find({ userId: friend._id })
      .sort({ dateSolved: -1 })
      .lean();

    // Fetch current user's problems
    const userProblems = await Problem.find({ userId: auth.user.userId })
      .sort({ dateSolved: -1 })
      .lean();

    // Calculate friend stats
    const hardProblems = friendProblems.filter(p => p.difficulty === 'Hard').length;
    const avgSolveTime = friendProblems.length > 0
      ? friendProblems.reduce((sum, p) => sum + p.timeTaken, 0) / friendProblems.length
      : 0;

    // Calculate topic distribution for friend
    const topicStats = friendProblems.reduce((acc, p) => {
      acc[p.topic] = (acc[p.topic] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sortedTopics = Object.entries(topicStats).sort((a, b) => b[1] - a[1]);
    const strongestTopic = sortedTopics[0]?.[0] || 'N/A';
    const weakestTopic = sortedTopics[sortedTopics.length - 1]?.[0] || 'N/A';

    // Calculate user stats for comparison
    const userHardProblems = userProblems.filter(p => p.difficulty === 'Hard').length;
    const userAvgSolveTime = userProblems.length > 0
      ? userProblems.reduce((sum, p) => sum + p.timeTaken, 0) / userProblems.length
      : 0;

    const userTopicStats = userProblems.reduce((acc, p) => {
      acc[p.topic] = (acc[p.topic] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const userSortedTopics = Object.entries(userTopicStats).sort((a, b) => b[1] - a[1]);
    const userWeakestTopic = userSortedTopics[userSortedTopics.length - 1]?.[0] || 'N/A';

    // Find common problems
    const friendProblemNames = new Set(friendProblems.map(p => p.problemName.toLowerCase()));
    const commonProblems = userProblems.filter(p => 
      friendProblemNames.has(p.problemName.toLowerCase())
    ).map(userProblem => {
      const friendProblem = friendProblems.find(
        fp => fp.problemName.toLowerCase() === userProblem.problemName.toLowerCase()
      );
      return {
        problemName: userProblem.problemName,
        platform: userProblem.platform,
        difficulty: userProblem.difficulty,
        topic: userProblem.topic,
        userTimeTaken: userProblem.timeTaken,
        friendTimeTaken: friendProblem?.timeTaken,
        userApproach: userProblem.approachSummary,
        friendApproach: friendProblem?.approachSummary,
        userMistakes: userProblem.mistakesFaced,
        friendMistakes: friendProblem?.mistakesFaced,
        userProblemId: userProblem._id,
        friendProblemId: friendProblem?._id,
      };
    });

    // Fetch recent activity
    const recentActivity = await ActivityLog.find({ userId: friend._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Prepare summary data
    const summary = {
      totalProblemsSolved: friend.totalProblemsSolved,
      currentStreak: friend.currentStreak,
      longestStreak: friend.longestStreak,
      level: friend.level,
      weakestTopic,
      strongestTopic,
      hardProblemsCount: hardProblems,
      avgSolveTime: Math.round(avgSolveTime),
    };

    // Prepare comparison data
    const comparison = {
      totalSolved: {
        user: currentUser.totalProblemsSolved,
        friend: friend.totalProblemsSolved,
      },
      currentStreak: {
        user: currentUser.currentStreak,
        friend: friend.currentStreak,
      },
      hardSolved: {
        user: userHardProblems,
        friend: hardProblems,
      },
      avgSolveTime: {
        user: Math.round(userAvgSolveTime),
        friend: Math.round(avgSolveTime),
      },
      weakestTopic: {
        user: userWeakestTopic,
        friend: weakestTopic,
      },
    };

    // Topic strength comparison
    const allTopics = new Set([...Object.keys(topicStats), ...Object.keys(userTopicStats)]);
    const topicComparison = Array.from(allTopics).map(topic => ({
      topic,
      userCount: userTopicStats[topic] || 0,
      friendCount: topicStats[topic] || 0,
      stronger: (userTopicStats[topic] || 0) > (topicStats[topic] || 0) ? 'user' : 'friend',
    }));

    const response = {
      friend: {
        id: friend._id,
        name: friend.name,
        username: friend.username,
        avatar: friend.avatar,
        level: friend.level,
      },
      summary,
      recentActivity: recentActivity.map(activity => ({
        id: activity._id,
        type: activity.type,
        metadata: activity.metadata,
        createdAt: activity.createdAt,
      })),
      comparison,
      topicComparison,
      commonProblems,
      commonWeakTopics: topicComparison
        .filter(tc => tc.userCount > 0 && tc.friendCount > 0)
        .filter(tc => tc.userCount < 3 || tc.friendCount < 3) // Both have fewer than 3 problems
        .map(tc => tc.topic),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Get friend dashboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
