import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import NotificationPreferences from '@/models/NotificationPreferences';
import User from '@/models/User';

// GET /api/notifications/preferences - Get notification preferences
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest();
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    let prefs = await NotificationPreferences.findOne({ userId: auth.user.userId });

    // Create default preferences if not exists
    if (!prefs) {
      const userData = await User.findById(auth.user.userId);
      prefs = await NotificationPreferences.create({
        userId: auth.user.userId,
        email: userData.email,
      });
    }

    return NextResponse.json(prefs);
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

// PUT /api/notifications/preferences - Update notification preferences
export async function PUT(request: NextRequest) {
  try {
    const auth = await authenticateRequest();
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();

    const prefs = await NotificationPreferences.findOneAndUpdate(
      { userId: auth.user.userId },
      { ...body, updatedAt: new Date() },
      { new: true, upsert: true }
    );

    return NextResponse.json(prefs);
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}

// POST /api/notifications/preferences/subscribe - Subscribe to push notifications
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest();
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { subscription } = body;

    await NotificationPreferences.findOneAndUpdate(
      { userId: auth.user.userId },
      {
        pushEnabled: true,
        pushSubscription: subscription,
        updatedAt: new Date(),
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}
