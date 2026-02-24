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

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest();
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { problemId } = body;

    if (!problemId) {
      return NextResponse.json({ error: 'Problem ID is required' }, { status: 400 });
    }

    await connectDB();

    // Check if problem exists and belongs to user
    const problem = await Problem.findOne({
      _id: problemId,
      userId: auth.user.userId,
    });

    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    // Check if revision already exists
    const existingRevision = await Revision.findOne({
      userId: auth.user.userId,
      problemId: problemId,
      status: 'Pending',
    });

    if (existingRevision) {
      return NextResponse.json({ error: 'Revision already exists for this problem' }, { status: 400 });
    }

    // Create revision with 3-day cycle as default
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + 3);

    const revision = await Revision.create({
      userId: auth.user.userId,
      problemId: problemId,
      scheduledDate: scheduledDate,
      cycle: '3-day',
      status: 'Pending',
    });

    // Update problem markedForRevision flag
    await Problem.updateOne(
      { _id: problemId },
      { $set: { markedForRevision: true } }
    );

    return NextResponse.json({ 
      message: 'Revision created successfully',
      revision 
    });
  } catch (error) {
    console.error('Create revision error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await authenticateRequest();
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const problemId = searchParams.get('problemId');

    if (!problemId) {
      return NextResponse.json({ error: 'Problem ID is required' }, { status: 400 });
    }

    await connectDB();

    // Delete all pending revisions for this problem
    await Revision.deleteMany({
      userId: auth.user.userId,
      problemId: problemId,
      status: 'Pending',
    });

    // Update problem markedForRevision flag
    await Problem.updateOne(
      { _id: problemId },
      { $set: { markedForRevision: false } }
    );

    return NextResponse.json({ message: 'Revision removed successfully' });
  } catch (error) {
    console.error('Delete revision error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
