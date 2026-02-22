import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Problem from '@/models/Problem';
import Revision from '@/models/Revision';
import AIReport from '@/models/AIReport';
import { authenticateRequest } from '@/lib/auth';
import { generateAIResponse, AI_PROMPTS } from '@/lib/ai-service';
import { startOfWeek, endOfWeek, getWeek, getYear } from 'date-fns';

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest();
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const now = new Date();
    const weekNumber = getWeek(now);
    const year = getYear(now);

    // Get this week's problems
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);

    const weekProblems = await Problem.find({
      userId: auth.user.userId,
      dateSolved: { $gte: weekStart, $lte: weekEnd },
    });

    if (weekProblems.length === 0) {
      return NextResponse.json({
        message: 'Solve at least 1 problem this week to generate report',
      });
    }

    // Calculate week stats
    const topics: any = {};
    weekProblems.forEach((p) => {
      topics[p.topic] = (topics[p.topic] || 0) + 1;
    });

    const easy = weekProblems.filter((p) => p.difficulty === 'Easy').length;
    const medium = weekProblems.filter((p) => p.difficulty === 'Medium').length;
    const hard = weekProblems.filter((p) => p.difficulty === 'Hard').length;

    // Get previous week count
    const prevWeekStart = new Date(weekStart);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const prevWeekEnd = new Date(weekEnd);
    prevWeekEnd.setDate(prevWeekEnd.getDate() - 7);

    const prevWeekProblems = await Problem.countDocuments({
      userId: auth.user.userId,
      dateSolved: { $gte: prevWeekStart, $lte: prevWeekEnd },
    });

    // Calculate streak
    const allProblems = await Problem.find({ userId: auth.user.userId });
    const dates = allProblems.map((p) => p.dateSolved);
    const uniqueDates = [...new Set(dates.map((d) => d.toDateString()))];

    const weekStats = {
      weekNumber,
      year,
      totalSolved: weekProblems.length,
      topics,
      easy,
      medium,
      hard,
      previousWeek: prevWeekProblems,
      streak: uniqueDates.length,
    };

    // Generate AI report
    const aiResponse = await generateAIResponse({
      systemPrompt: AI_PROMPTS.WEEKLY_GROWTH_REPORT.system,
      userPrompt: AI_PROMPTS.WEEKLY_GROWTH_REPORT.buildUserPrompt(weekStats),
      temperature: 0.8,
      jsonMode: true,
    });

    if (!aiResponse.success) {
      return NextResponse.json(
        { error: aiResponse.error || 'AI service error' },
        { status: 500 }
      );
    }

    // Save report
    const report = await AIReport.create({
      userId: auth.user.userId,
      type: 'Weekly Growth',
      title: `Week ${weekNumber} Growth Report`,
      content: aiResponse.data,
      weekNumber,
      year,
    });

    return NextResponse.json({
      message: 'Weekly growth report generated',
      report: {
        id: report._id,
        content: aiResponse.data,
        generatedAt: report.generatedAt,
      },
    });
  } catch (error) {
    console.error('Weekly growth report error:', error);
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

    const reports = await AIReport.find({
      userId: auth.user.userId,
      type: 'Weekly Growth',
    })
      .sort({ generatedAt: -1 })
      .limit(10);

    return NextResponse.json({ reports });
  } catch (error) {
    console.error('Get weekly reports error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
