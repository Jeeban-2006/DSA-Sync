import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Problem from '@/models/Problem';
import Revision from '@/models/Revision';
import ActivityLog from '@/models/ActivityLog';
import { sendStreakReminder, sendRevisionReminder } from '@/lib/push-service';

// Cron job endpoint - should be called daily
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'your-secret-key';

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const results = {
      streakReminders: 0,
      revisionReminders: 0,
      errors: 0,
    };

    // Get all users
    const users = await User.find().lean();

    for (const user of users) {
      try {
        const userId = user._id!.toString();
        
        // Check for streak reminder
        const hasSolvedToday = await Problem.findOne({
          userId: user._id,
          dateSolved: { $gte: today },
        });

        if (!hasSolvedToday && user.currentStreak > 0) {
          await sendStreakReminder(userId, user.currentStreak);
          results.streakReminders++;
        }

        // Check for revision reminders
        const now = new Date();
        const pendingRevisions = await Revision.find({
          userId: user._id,
          nextRevisionDate: { $lte: now },
          completed: false,
        }).populate('problemId');

        if (pendingRevisions.length > 0) {
          const problemName = (pendingRevisions[0].problemId as any)?.problemName;
          await sendRevisionReminder(
            userId,
            pendingRevisions.length,
            problemName
          );
          results.revisionReminders++;
        }
      } catch (error) {
        console.error(`Error processing user ${user._id}:`, error);
        results.errors++;
      }
    }

    // Log activity
    await ActivityLog.create({
      userId: users[0]?._id || 'system',
      type: 'streak_updated',
      metadata: {
        cronJob: 'daily_notifications',
        results,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Daily notifications sent',
      results,
    });
  } catch (error) {
    console.error('Daily notifications cron error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Manual trigger for testing
export async function GET(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization');
    const adminSecret = process.env.ADMIN_SECRET || 'admin-secret';

    if (auth !== `Bearer ${adminSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Trigger the cron job manually
    const response = await fetch(request.url, {
      method: 'POST',
      headers: {
        'authorization': `Bearer ${process.env.CRON_SECRET || 'your-secret-key'}`,
      },
    });

    const data = await response.json();

    return NextResponse.json({
      message: 'Cron job triggered manually',
      result: data,
    });
  } catch (error) {
    console.error('Manual cron trigger error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
