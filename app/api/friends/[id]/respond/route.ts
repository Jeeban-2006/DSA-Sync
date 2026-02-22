import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import FriendConnection from '@/models/FriendConnection';
import { authenticateRequest } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticateRequest();
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { action } = await request.json();

    if (!['accept', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const connection = await FriendConnection.findOne({
      _id: params.id,
      recipientId: auth.user.userId,
      status: 'Pending',
    });

    if (!connection) {
      return NextResponse.json(
        { error: 'Friend request not found' },
        { status: 404 }
      );
    }

    connection.status = action === 'accept' ? 'Accepted' : 'Rejected';
    await connection.save();

    return NextResponse.json({
      message: `Friend request ${action}ed successfully`,
      connection,
    });
  } catch (error) {
    console.error('Respond to friend request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
