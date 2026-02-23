import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ActivityLog from '@/models/ActivityLog';
import { authenticateRequest } from '@/lib/auth';

// Get activity logs
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest();
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || auth.user.userId;
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type');

    const query: any = { userId };
    if (type) {
      query.type = type;
    }

    const activities = await ActivityLog.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ activities });
  } catch (error) {
    console.error('Get activity logs error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create activity log
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest();
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { type, metadata } = await request.json();

    if (!type) {
      return NextResponse.json({ error: 'Activity type required' }, { status: 400 });
    }

    const activity = await ActivityLog.create({
      userId: auth.user.userId,
      type,
      metadata: metadata || {},
    });

    return NextResponse.json({ activity }, { status: 201 });
  } catch (error) {
    console.error('Create activity log error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
