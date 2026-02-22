import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import FriendConnection from '@/models/FriendConnection';
import User from '@/models/User';
import { authenticateRequest } from '@/lib/auth';

// Send friend request
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest();
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { username } = await request.json();

    if (!username) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 });
    }

    // Find recipient
    const recipient = await User.findOne({ username: username.toLowerCase() });

    if (!recipient) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (recipient._id.toString() === auth.user.userId) {
      return NextResponse.json(
        { error: 'Cannot send friend request to yourself' },
        { status: 400 }
      );
    }

    // Check if connection already exists
    const existing = await FriendConnection.findOne({
      $or: [
        { requesterId: auth.user.userId, recipientId: recipient._id },
        { requesterId: recipient._id, recipientId: auth.user.userId },
      ],
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Friend request already exists' },
        { status: 400 }
      );
    }

    // Create friend request
    const connection = await FriendConnection.create({
      requesterId: auth.user.userId,
      recipientId: recipient._id,
    });

    return NextResponse.json(
      {
        message: 'Friend request sent successfully',
        connection,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Send friend request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get all friend connections
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest();
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'Accepted';

    const connections = await FriendConnection.find({
      $or: [
        { requesterId: auth.user.userId, status },
        { recipientId: auth.user.userId, status },
      ],
    })
      .populate('requesterId', 'name username avatar level currentStreak totalProblemsSolved')
      .populate('recipientId', 'name username avatar level currentStreak totalProblemsSolved')
      .sort({ createdAt: -1 });

    // Extract friend data
    const friends = connections.map((conn) => {
      const friend =
        conn.requesterId._id.toString() === auth.user!.userId
          ? conn.recipientId
          : conn.requesterId;

      return {
        connectionId: conn._id,
        friend,
        status: conn.status,
        since: conn.createdAt,
      };
    });

    return NextResponse.json({ friends });
  } catch (error) {
    console.error('Get friends error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
