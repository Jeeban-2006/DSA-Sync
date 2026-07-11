import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Problem from '@/models/Problem';
import { pushProblemToGithub } from '@/lib/github';

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest();

    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(auth.user.userId);

    if (!user || !user.github?.accessToken) {
      return NextResponse.json({ error: 'GitHub not connected' }, { status: 400 });
    }

    // Get all problems for user
    const problems = await Problem.find({ userId: auth.user.userId, status: { $ne: 'Attempted' } });

    if (problems.length === 0) {
      return NextResponse.json({ count: 0, message: 'No problems to sync' });
    }

    // Process sequentially to avoid hitting github rate limits
    // Note: for very large amounts of problems, this might time out Vercel/NextJS API limits (10s-60s)
    // A robust system would use a background job queue, but this is fine for typical users
    let successCount = 0;
    
    for (const problem of problems) {
      try {
        await pushProblemToGithub({
          token: user.github.accessToken,
          username: user.github.username,
          repo: user.github.repository,
          problemTitle: problem.problemName,
          difficulty: problem.difficulty,
          url: problem.problemLink || '',
          code: problem.codeSnippet || '',
          notes: problem.approachSummary || '',
        });
        successCount++;
        // Small delay to prevent rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err) {
        console.error(`Failed to sync problem ${problem.problemName}:`, err);
      }
    }

    // Update last sync time
    user.github.lastSync = new Date();
    await user.save();

    return NextResponse.json({ success: true, count: successCount });
  } catch (error) {
    console.error('GitHub bulk sync error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
