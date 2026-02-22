import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Comment from '@/models/Comment';
import { authenticateRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest();
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { problemId, content } = await request.json();

    if (!problemId || !content) {
      return NextResponse.json(
        { error: 'problemId and content required' },
        { status: 400 }
      );
    }

    const comment = await Comment.create({
      userId: auth.user.userId,
      problemId,
      content,
    });

    const populatedComment = await Comment.findById(comment._id).populate(
      'userId',
      'name username avatar'
    );

    return NextResponse.json(
      {
        message: 'Comment added successfully',
        comment: populatedComment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Add comment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest();
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const problemId = searchParams.get('problemId');

    if (!problemId) {
      return NextResponse.json(
        { error: 'problemId required' },
        { status: 400 }
      );
    }

    const comments = await Comment.find({ problemId })
      .populate('userId', 'name username avatar')
      .sort({ createdAt: -1 });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Get comments error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
