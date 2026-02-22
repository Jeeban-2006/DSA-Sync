import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Problem from '@/models/Problem';
import User from '@/models/User';
import { authenticateRequest } from '@/lib/auth';
import { generateAIResponse, AI_PROMPTS } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest();
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { userProblemId, friendProblemId } = await request.json();

    if (!userProblemId || !friendProblemId) {
      return NextResponse.json(
        { error: 'Both problem IDs required' },
        { status: 400 }
      );
    }

    const userProblem = await Problem.findOne({
      _id: userProblemId,
      userId: auth.user.userId,
    });

    const friendProblem = await Problem.findById(friendProblemId);

    if (!userProblem || !friendProblem) {
      return NextResponse.json({ error: 'Problems not found' }, { status: 404 });
    }

    // Get user details
    const user = await User.findById(auth.user.userId).select('username');
    const friend = await User.findById(friendProblem.userId).select('username');

    const user1Data = {
      username: user?.username,
      problemName: userProblem.problemName,
      approachSummary: userProblem.approachSummary,
      timeTaken: userProblem.timeTaken,
      mistakesFaced: userProblem.mistakesFaced,
    };

    const user2Data = {
      username: friend?.username,
      problemName: friendProblem.problemName,
      approachSummary: friendProblem.approachSummary,
      timeTaken: friendProblem.timeTaken,
      mistakesFaced: friendProblem.mistakesFaced,
    };

    // Generate AI comparison
    const aiResponse = await generateAIResponse({
      systemPrompt: AI_PROMPTS.COMPARISON_INSIGHT.system,
      userPrompt: AI_PROMPTS.COMPARISON_INSIGHT.buildUserPrompt(user1Data, user2Data),
      temperature: 0.7,
      jsonMode: true,
    });

    if (!aiResponse.success) {
      return NextResponse.json(
        { error: aiResponse.error || 'AI service error' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      comparison: aiResponse.data,
      users: {
        user1: user?.username,
        user2: friend?.username,
      },
    });
  } catch (error) {
    console.error('AI comparison error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
