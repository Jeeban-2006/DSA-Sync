import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Revision from '@/models/Revision';
import Problem from '@/models/Problem';
import { authenticateRequest } from '@/lib/auth';
import { startOfDay, endOfDay } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest();
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const today = new Date();

    // Get today's revisions
    const revisions = await Revision.find({
      userId: auth.user.userId,
      scheduledDate: {
        $gte: startOfDay(today),
        $lte: endOfDay(today),
      },
      status: 'Pending',
    })
      .populate('problemId')
      .sort({ scheduledDate: 1 });

    // Get upcoming revisions
    const upcoming = await Revision.find({
      userId: auth.user.userId,
      scheduledDate: { $gt: endOfDay(today) },
      status: 'Pending',
    })
      .populate('problemId')
      .sort({ scheduledDate: 1 })
      .limit(10);

    // Get revision stats
    const totalPending = await Revision.countDocuments({
      userId: auth.user.userId,
      status: 'Pending',
    });

    const totalCompleted = await Revision.countDocuments({
      userId: auth.user.userId,
      status: 'Completed',
    });

    const completionRate =
      totalCompleted + totalPending > 0
        ? (totalCompleted / (totalCompleted + totalPending)) * 100
        : 0;

    return NextResponse.json({
      today: revisions,
      upcoming,
      stats: {
        totalPending,
        totalCompleted,
        completionRate: completionRate.toFixed(1),
      },
    });
  } catch (error) {
    console.error('Get revisions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
