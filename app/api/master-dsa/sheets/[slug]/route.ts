import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MasterSheet from '@/models/MasterSheet';
import MasterSheetStep from '@/models/MasterSheetStep';
import MasterSheetProblem from '@/models/MasterSheetProblem';
import UserMasterProgress from '@/models/UserMasterProgress';
import { authenticateRequest } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const auth = await authenticateRequest();
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // 1. Find the Sheet
    const sheet = await MasterSheet.findOne({ slug }).lean() as any;
    if (!sheet) {
      return NextResponse.json({ error: 'Sheet not found' }, { status: 404 });
    }

    // 2. Fetch steps and problems
    const steps = await MasterSheetStep.find({ sheetId: sheet._id }).sort({ order: 1 }).lean();
    const problems = await MasterSheetProblem.find({
      stepId: { $in: steps.map((s: any) => s._id) },
    }).sort({ order: 1 }).lean();

    // 3. Fetch user progress for these problems
    const progress = await UserMasterProgress.find({
      userId: auth.user.userId,
      masterProblemId: { $in: problems.map((p: any) => p._id) },
    }).lean();

    // 4. Merge progress into problems
    const progressMap = progress.reduce((acc, p) => {
      acc[p.masterProblemId.toString()] = p;
      return acc;
    }, {} as Record<string, any>);

    const mergedProblems = problems.map((p: any) => {
      const pIdStr = p._id.toString();
      const userProg = progressMap[pIdStr];
      return {
        ...p,
        done: userProg?.done || false,
        note: userProg?.note || '',
        flaggedForRevision: userProg?.flaggedForRevision || false,
        completedAt: userProg?.completedAt || null,
        linkedProblemId: userProg?.linkedProblemId || null,
      };
    });

    // 5. Build structured payload
    const data = {
      ...sheet,
      steps: steps.map((step: any) => ({
        ...step,
        problems: mergedProblems.filter(
          (p: any) => p.stepId.toString() === step._id.toString()
        ),
      })),
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('Get Master DSA sheet by slug error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
