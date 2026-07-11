import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MasterSheetStep from '@/models/MasterSheetStep';
import MasterSheetProblem from '@/models/MasterSheetProblem';
import UserMasterProgress from '@/models/UserMasterProgress';
import { authenticateRequest } from '@/lib/auth';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest();
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const userId = new mongoose.Types.ObjectId(auth.user.userId);

    // Get all problems across all steps to know which sheet they belong to
    const steps = await MasterSheetStep.find().lean();
    const problems = await MasterSheetProblem.find().lean();
    
    // Map problemId -> sheetId
    const stepToSheet = steps.reduce((acc, step: any) => {
      acc[step._id.toString()] = step.sheetId.toString();
      return acc;
    }, {} as Record<string, string>);

    const problemToSheet = problems.reduce((acc, prob: any) => {
      acc[prob._id.toString()] = stepToSheet[prob.stepId.toString()];
      return acc;
    }, {} as Record<string, string>);

    // Total counts per sheet
    const totalPerSheet = problems.reduce((acc, prob: any) => {
      const sheetId = problemToSheet[prob._id.toString()];
      if (sheetId) {
        acc[sheetId] = (acc[sheetId] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Fetch user progress
    const progress = await UserMasterProgress.find({
      userId,
      done: true,
    }).lean();

    // Done counts per sheet
    const donePerSheet = progress.reduce((acc, prog: any) => {
      const sheetId = problemToSheet[prog.masterProblemId.toString()];
      if (sheetId) {
        acc[sheetId] = (acc[sheetId] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Build response array
    const summary = Object.keys(totalPerSheet).map((sheetId) => ({
      sheetId,
      total: totalPerSheet[sheetId],
      done: donePerSheet[sheetId] || 0,
    }));

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Get Master DSA summary error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
