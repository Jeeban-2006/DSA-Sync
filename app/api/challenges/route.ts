import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Challenge from '@/models/Challenge';
import { authenticateRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest();
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { title, description, targetCount, topic, difficulty, startDate, endDate, participants } =
      await request.json();

    if (!title || !description || !targetCount || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      );
    }

    const challenge = await Challenge.create({
      creatorId: auth.user.userId,
      participants: [auth.user.userId, ...(participants || [])],
      title,
      description,
      targetCount,
      topic,
      difficulty,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      progress: { [auth.user.userId]: 0 },
    });

    return NextResponse.json(
      {
        message: 'Challenge created successfully',
        challenge,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create challenge error:', error);
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

    const challenges = await Challenge.find({
      participants: auth.user.userId,
    })
      .populate('creatorId', 'name username avatar')
      .populate('participants', 'name username avatar')
      .sort({ createdAt: -1 });

    return NextResponse.json({ challenges });
  } catch (error) {
    console.error('Get challenges error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
