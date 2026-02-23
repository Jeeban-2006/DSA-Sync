import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Problem from '@/models/Problem';
import User from '@/models/User';
import Revision from '@/models/Revision';
import ActivityLog from '@/models/ActivityLog';
import { authenticateRequest } from '@/lib/auth';
import { calculateXP, calculateLevel } from '@/lib/utils';
import { addDays } from 'date-fns';

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest();
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const data = await request.json();
    const {
      problemName,
      platform,
      problemLink,
      difficulty,
      topic,
      subtopic,
      timeTaken,
      dateSolved,
      status,
      approachSummary,
      mistakesFaced,
      keyLearning,
      codeSnippet,
      markedForRevision,
    } = data;

    // Validation
    if (!problemName || !platform || !difficulty || !topic || !timeTaken) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      );
    }

    // Create problem
    const problem = await Problem.create({
      userId: auth.user.userId,
      problemName,
      platform,
      problemLink: problemLink || '',
      difficulty,
      topic,
      subtopic: subtopic || '',
      timeTaken,
      dateSolved: dateSolved || new Date(),
      status,
      approachSummary: approachSummary || '',
      mistakesFaced: mistakesFaced || '',
      keyLearning: keyLearning || '',
      codeSnippet: codeSnippet || '',
      markedForRevision: markedForRevision || false,
    });

    // Update user stats
    const xpGained = calculateXP(difficulty, timeTaken);
    const user = await User.findById(auth.user.userId);

    if (user) {
      user.totalProblemsSolved += 1;
      user.xp += xpGained;
      user.level = calculateLevel(user.xp);
      user.lastActiveDate = new Date();
      await user.save();
    }

    // Schedule revisions if marked
    if (markedForRevision || status === 'Needs Revision') {
      const today = new Date(dateSolved || new Date());
      
      await Revision.create([
        {
          userId: auth.user.userId,
          problemId: problem._id,
          scheduledDate: addDays(today, 3),
          cycle: '3-day',
        },
        {
          userId: auth.user.userId,
          problemId: problem._id,
          scheduledDate: addDays(today, 7),
          cycle: '7-day',
        },
        {
          userId: auth.user.userId,
          problemId: problem._id,
          scheduledDate: addDays(today, 30),
          cycle: '30-day',
        },
      ]);
    }

    // Log activity
    await ActivityLog.create({
      userId: auth.user.userId,
      type: 'problem_solved',
      metadata: {
        problemName,
        difficulty,
        topic,
        subtopic,
        timeTaken,
        platform,
      },
    });

    return NextResponse.json(
      {
        message: 'Problem added successfully',
        problem,
        xpGained,
        newLevel: user?.level,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Add problem error:', error);
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
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');
    const topic = searchParams.get('topic');
    const difficulty = searchParams.get('difficulty');

    const query: any = { userId: auth.user.userId };
    if (topic) query.topic = topic;
    if (difficulty) query.difficulty = difficulty;

    const problems = await Problem.find(query)
      .sort({ dateSolved: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Problem.countDocuments(query);

    return NextResponse.json({
      problems,
      total,
      hasMore: skip + problems.length < total,
    });
  } catch (error) {
    console.error('Get problems error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
