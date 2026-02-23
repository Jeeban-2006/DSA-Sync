import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PushSubscription from '@/models/PushSubscription';
import { authenticateRequest } from '@/lib/auth';
import webpush from 'web-push';

// Configure web push
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:' + (process.env.ADMIN_EMAIL || 'admin@dsasync.com'),
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

// Send a test notification
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest();
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const subscriptions = await PushSubscription.find({
      userId: auth.user.userId,
      isActive: true,
    });

    if (subscriptions.length === 0) {
      return NextResponse.json(
        { error: 'No active subscriptions found' },
        { status: 404 }
      );
    }

    const payload = JSON.stringify({
      title: '✅ Test Notification',
      body: 'Your notifications are working perfectly!',
      icon: '/icons/icon-512x512.svg',
      badge: '/icons/icon-512x512.svg',
      url: '/dashboard',
      timestamp: Date.now(),
    });

    const results = [];

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys,
          },
          payload
        );

        await PushSubscription.updateOne(
          { _id: sub._id },
          { lastUsed: new Date() }
        );

        results.push({ success: true, endpoint: sub.endpoint });
      } catch (error: any) {
        console.error('Test notification error:', error);

        // Deactivate if invalid
        if (error.statusCode === 410 || error.statusCode === 404) {
          await PushSubscription.updateOne(
            { _id: sub._id },
            { isActive: false }
          );
        }

        results.push({
          success: false,
          endpoint: sub.endpoint,
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      message: 'Test notifications sent',
      results,
    });
  } catch (error) {
    console.error('Send test notification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
