import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getAdminMessaging } from '@/lib/firebase-admin';

// Vercel cron jobs pass an Authorization header you can verify
// For testing locally, just send the CRON_SECRET as a Bearer token or URL param

const motivationalQuotes = [
  "Consistency is the key to mastering DSA! Keep coding.",
  "Every problem solved is a step closer to your dream job.",
  "Don't stop when you're tired, stop when you're done.",
  "Small daily improvements are the key to staggering long-term results."
];

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const secret = process.env.CRON_SECRET;
    
    // In production, ensure this is hit only by authorized cron services
    if (secret && authHeader !== `Bearer ${secret}`) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Find users who have at least one FCM token
    const users = await User.find({ fcmTokens: { $exists: true, $not: { $size: 0 } } });

    if (!users || users.length === 0) {
      return NextResponse.json({ message: 'No users with FCM tokens found' });
    }

    // Get today's start and end timestamps to check activity
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const messages = [];

    for (const user of users) {
      let title = "Daily DSA Motivation 🚀";
      let body = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
      
      // If user hasn't been active today, encourage them to save their streak
      const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
      if (!lastActive || lastActive < today) {
        if (user.currentStreak > 0) {
          title = "🔥 Streak at Risk!";
          body = `You have a ${user.currentStreak}-day streak! Solve a problem today to keep it alive.`;
        } else {
          title = "Start your Streak today! 🎯";
          body = "You haven't solved a problem yet. Start your DSA journey today!";
        }
      }

      messages.push({
        notification: {
          title,
          body,
        },
        tokens: user.fcmTokens, // this is an array of tokens
      });
    }

    // Send notifications in batches (or one by one) using sendEachForMulticast
    let totalSuccess = 0;
    for (const message of messages) {
      if (message.tokens.length > 0) {
         try {
           const adminMessaging = getAdminMessaging();
           if (!adminMessaging) {
             console.error("Firebase admin messaging not available");
             continue;
           }
           const response = await adminMessaging.sendEachForMulticast(message);
           totalSuccess += response.successCount;
         } catch (e) {
           console.error('FCM send error for a user', e);
         }
      }
    }

    return NextResponse.json({ success: true, notificationsSent: totalSuccess });

  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
