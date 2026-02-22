import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Problem from '@/models/Problem';
import User from '@/models/User';
import FriendConnection from '@/models/FriendConnection';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest();
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const friendId = searchParams.get('friendId');
    const problemName = searchParams.get('problemName');

    if (!friendId || !problemName) {
      return NextResponse.json(
        { error: 'friendId and problemName required' },
        { status: 400 }
      );
    }

    // Verify friendship
    const friendship = await FriendConnection.findOne({
      $or: [
        { requesterId: auth.user.userId, recipientId: friendId },
        { requesterId: friendId, recipientId: auth.user.userId },
      ],
      status: 'Accepted',
    });

    if (!friendship) {
      return NextResponse.json({ error: 'Not friends' }, { status: 403 });
    }

    // Get both users' attempts at this problem
    const userProblem = await Problem.findOne({
      userId: auth.user.userId,
      problemName: { $regex: new RegExp(problemName, 'i') },
    });

    const friendProblem = await Problem.findOne({
      userId: friendId,
      problemName: { $regex: new RegExp(problemName, 'i') },
    });

    if (!userProblem || !friendProblem) {
      return NextResponse.json(
        { error: 'Both users must have solved this problem' },
        { status: 404 }
      );
    }

    // Get user details
    const user = await User.findById(auth.user.userId).select('name username avatar');
    const friend = await User.findById(friendId).select('name username avatar');

    return NextResponse.json({
      comparison: {
        user: {
          userData: user,
          problem: userProblem,
        },
        friend: {
          userData: friend,
          problem: friendProblem,
        },
      },
    });
  } catch (error) {
    console.error('Compare problems error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
