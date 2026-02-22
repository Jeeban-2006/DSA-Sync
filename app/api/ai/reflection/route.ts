import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Problem from '@/models/Problem';
import { authenticateRequest } from '@/lib/auth';
import { generateReflection } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest();
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { date } = body; // Optional: specific date, defaults to today

    // Get today's problems (or specified date)
    const startOfDay = date ? new Date(date) : new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(23, 59, 59, 999);

    const todayProblems = await Problem.find({
      userId: auth.user.userId,
      dateSolved: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    if (todayProblems.length === 0) {
      return NextResponse.json({
        message: 'No problems solved today. Solve some problems first!',
        reflection: null,
      });
    }

    // Build activity data
    const topicsPracticed = [...new Set(todayProblems.map((p) => p.topic))];
    const difficulties = [...new Set(todayProblems.map((p) => p.difficulty))];
    const mistakes = todayProblems
      .filter((p) => p.mistakesFaced && p.mistakesFaced.trim() !== '')
      .map((p) => p.mistakesFaced);

    const activity = {
      topicsPracticed,
      problemsSolved: todayProblems.length,
      difficulties,
      mistakes: mistakes.length > 0 ? mistakes : ['None reported'],
    };

    // Generate AI reflection
    const aiResponse = await generateReflection(activity);

    if (!aiResponse.success) {
      return NextResponse.json(
        { error: aiResponse.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      reflection: aiResponse.data,
      problemsCount: todayProblems.length,
    });
  } catch (error: any) {
    console.error('Reflection Generation Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate reflection' },
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

    // Get today's problems
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(23, 59, 59, 999);

    const todayProblems = await Problem.find({
      userId: auth.user.userId,
      dateSolved: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    if (todayProblems.length === 0) {
      return NextResponse.json({
        message: 'No problems solved today',
        reflection: null,
      });
    }

    // Build activity data
    const topicsPracticed = [...new Set(todayProblems.map((p) => p.topic))];
    const difficulties = [...new Set(todayProblems.map((p) => p.difficulty))];
    const mistakes = todayProblems
      .filter((p) => p.mistakesFaced && p.mistakesFaced.trim() !== '')
      .map((p) => p.mistakesFaced);

    const activity = {
      topicsPracticed,
      problemsSolved: todayProblems.length,
      difficulties,
      mistakes: mistakes.length > 0 ? mistakes : ['None reported'],
    };

    // Generate AI reflection
    const aiResponse = await generateReflection(activity);

    if (!aiResponse.success) {
      return NextResponse.json(
        { error: aiResponse.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      reflection: aiResponse.data,
      problemsCount: todayProblems.length,
    });
  } catch (error: any) {
    console.error('Reflection Generation Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate reflection' },
      { status: 500 }
    );
  }
}
