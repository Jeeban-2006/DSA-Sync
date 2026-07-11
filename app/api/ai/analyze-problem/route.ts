import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { input } = await req.json();

    if (!input) {
      return NextResponse.json(
        { error: 'Input is required' },
        { status: 400 }
      );
    }

    // Import the AI service and prompts
    const { generateAIResponse } = await import('@/lib/ai-service');
    const { SYSTEM_PROMPT } = await import('@/lib/dsa-analyzer');

    const response = await generateAIResponse({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: `Analyze this DSA problem: ${input}`,
      temperature: 0.1, // Low temperature for consistent JSON
    });

    if (!response.success) {
      return NextResponse.json(
        { error: response.error || 'Failed to analyze problem' },
        { status: 500 }
      );
    }

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Problem Analysis Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}