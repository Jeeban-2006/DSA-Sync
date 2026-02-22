import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Problem from '@/models/Problem';
import { authenticateRequest } from '@/lib/auth';
import { generateAIResponse, AI_PROMPTS } from '@/lib/ai-service';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest();
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const problems = await Problem.find({ userId: auth.user.userId })
      .sort({ dateSolved: -1 })
      .limit(50);

    if (problems.length < 50) {
      return NextResponse.json({
        message: 'Solve at least 50 problems to get pattern detection',
        profile: null,
      });
    }

    // Prepare problem data for AI
    const problemData = problems.map((p) => ({
      problemName: p.problemName,
      difficulty: p.difficulty,
      topic: p.topic,
      timeTaken: p.timeTaken,
      status: p.status,
      mistakesFaced: p.mistakesFaced,
    }));

    // Generate AI pattern detection
    const aiResponse = await generateAIResponse({
      systemPrompt: AI_PROMPTS.PATTERN_DETECTION.system,
      userPrompt: AI_PROMPTS.PATTERN_DETECTION.buildUserPrompt(problemData),
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
      profile: aiResponse.data,
      dataPoints: problems.length,
    });
  } catch (error) {
    console.error('AI pattern detection error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
