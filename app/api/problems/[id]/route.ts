import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Problem from '@/models/Problem';
import { authenticateRequest } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await authenticateRequest();
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const problem = await Problem.findOne({
      _id: id,
      userId: auth.user.userId,
    });

    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    return NextResponse.json({ problem });
  } catch (error) {
    console.error('Get problem error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await authenticateRequest();
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const updates = await request.json();

    const problem = await Problem.findOneAndUpdate(
      { _id: id, userId: auth.user.userId },
      { $set: updates },
      { new: true }
    );

    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Problem updated successfully',
      problem,
    });
  } catch (error) {
    console.error('Update problem error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await authenticateRequest();
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const problem = await Problem.findOneAndDelete({
      _id: id,
      userId: auth.user.userId,
    });

    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    // Handle reverse orphan for Master DSA
    // If this problem was linked from Master DSA progress, unlink it
    try {
      // Import dynamically to avoid circular dependencies if any
      const UserMasterProgress = (await import('@/models/UserMasterProgress')).default;
      await UserMasterProgress.updateMany(
        { linkedProblemId: id },
        { $set: { done: false, linkedProblemId: null } }
      );
    } catch (e) {
      console.error('Error unlinking UserMasterProgress:', e);
    }

    return NextResponse.json({ message: 'Problem deleted successfully' });
  } catch (error) {
    console.error('Delete problem error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
