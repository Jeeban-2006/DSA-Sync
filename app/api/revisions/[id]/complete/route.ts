import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Revision from '@/models/Revision';
import Problem from '@/models/Problem';
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

    const { performanceNotes, timeTaken } = await request.json();

    const revision = await Revision.findOneAndUpdate(
      { _id: params.id, userId: auth.user.userId },
      {
        $set: {
          status: 'Completed',
          completedDate: new Date(),
          performanceNotes,
          timeTaken,
        },
      },
      { new: true }
    );

    if (!revision) {
      return NextResponse.json({ error: 'Revision not found' }, { status: 404 });
    }

    // Update problem revision count
    await Problem.findByIdAndUpdate(revision.problemId, {
      $inc: { revisionCount: 1 },
      $set: { lastRevised: new Date() },
      $push: { revisionDates: new Date() },
    });

    return NextResponse.json({
      message: 'Revision completed successfully',
      revision,
    });
  } catch (error) {
    console.error('Complete revision error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
