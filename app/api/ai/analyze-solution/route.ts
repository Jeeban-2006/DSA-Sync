import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Problem from '@/models/Problem';
import { authenticateRequest } from '@/lib/auth';
import { generateAIResponse, AI_PROMPTS } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest();
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { problemId } = await request.json();

    if (!problemId) {
      return NextResponse.json({ error: 'problemId required' }, { status: 400 });
    }

    const problem = await Problem.findOne({
      _id: problemId,
      userId: auth.user.userId,
    });

    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    // Generate AI analysis
    const aiResponse = await generateAIResponse({
      systemPrompt: AI_PROMPTS.SOLUTION_ANALYZER.system,
      userPrompt: AI_PROMPTS.SOLUTION_ANALYZER.buildUserPrompt(problem),
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
      analysis: aiResponse.data,
      problem: {
        name: problem.problemName,
        difficulty: problem.difficulty,
        topic: problem.topic,
      },
    });
  } catch (error) {
    console.error('AI solution analysis error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
