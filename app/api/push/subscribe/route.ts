import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PushSubscription from '@/models/PushSubscription';
import { authenticateRequest } from '@/lib/auth';

// Get user's push subscriptions
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest();
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const subscriptions = await PushSubscription.find({
      userId: auth.user.userId,
      isActive: true,
    }).lean();

    return NextResponse.json({ subscriptions });
  } catch (error) {
    console.error('Get push subscriptions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Subscribe to push notifications
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest();
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { endpoint, keys, userAgent } = await request.json();

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      );
    }

    // Check if subscription already exists
    const existing = await PushSubscription.findOne({ endpoint });

    if (existing) {
      // Update existing subscription
      existing.userId = auth.user.userId;
      existing.keys = keys;
      existing.userAgent = userAgent;
      existing.isActive = true;
      existing.lastUsed = new Date();
      await existing.save();

      return NextResponse.json({ subscription: existing });
    }

    // Create new subscription
    const subscription = await PushSubscription.create({
      userId: auth.user.userId,
      endpoint,
      keys,
      userAgent,
      isActive: true,
    });

    return NextResponse.json({ subscription }, { status: 201 });
  } catch (error) {
    console.error('Subscribe push error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Unsubscribe from push notifications
export async function DELETE(request: NextRequest) {
  try {
    const auth = await authenticateRequest();
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { endpoint } = await request.json();

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint required' },
        { status: 400 }
      );
    }

    await PushSubscription.updateOne(
      { endpoint, userId: auth.user.userId },
      { isActive: false }
    );

    return NextResponse.json({ message: 'Unsubscribed successfully' });
  } catch (error) {
    console.error('Unsubscribe push error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
