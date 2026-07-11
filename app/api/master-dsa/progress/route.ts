import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MasterSheetProblem from '@/models/MasterSheetProblem';
import MasterSheetStep from '@/models/MasterSheetStep';
import UserMasterProgress from '@/models/UserMasterProgress';
import Problem from '@/models/Problem';
import User from '@/models/User';
import { authenticateRequest } from '@/lib/auth';
import { calculateXP, calculateLevel } from '@/lib/utils';
import { pushProblemToGithub } from '@/lib/github';

async function recomputeUserStats(userId: string) {
  const problems = await Problem.find({ userId });
  let totalXP = 0;
  for (const p of problems) {
    totalXP += calculateXP(p.difficulty, p.timeTaken || 30);
  }
  const newLevel = calculateLevel(totalXP);
  
  await User.findByIdAndUpdate(userId, {
    $set: {
      totalProblemsSolved: problems.length,
      xp: totalXP,
      level: newLevel,
      lastActiveDate: new Date(),
    }
  });
}

function inferPlatform(links: any): string {
  if (!links) return 'Master DSA';
  if (links.lc) return 'LeetCode';
  if (links.gfg) return 'GeeksForGeeks';
  if (links.cn) return 'CodeNinja';
  if (links.tuf) return 'takeUforward';
  return 'Master DSA';
}

function extractProblemLink(links: any): string {
  if (!links) return '';
  if (links.lc) return links.lc;
  if (links.gfg) return links.gfg;
  if (links.cn) return links.cn;
  if (links.tuf) return links.tuf;
  if (links.yt) return links.yt;
  if (links.blog) return links.blog;
  return '';
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest();
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { masterProblemId, done, note, flaggedForRevision } = await request.json();

    if (!masterProblemId) {
      return NextResponse.json({ error: 'masterProblemId is required' }, { status: 400 });
    }

    await connectDB();
    const userId = auth.user.userId;

    const masterProblem: any = await MasterSheetProblem.findById(masterProblemId).populate('stepId').lean();
    if (!masterProblem) {
      return NextResponse.json({ error: 'Master Problem not found' }, { status: 404 });
    }

    let progress = await UserMasterProgress.findOne({ userId, masterProblemId });

    if (!progress) {
      progress = new UserMasterProgress({
        userId,
        masterProblemId,
      });
    }

    // Handle Note and Flag updates
    if (note !== undefined) progress.note = note;
    if (flaggedForRevision !== undefined) progress.flaggedForRevision = flaggedForRevision;

    // Handle Done state changes
    if (done !== undefined && progress.done !== done) {
      progress.done = done;

      if (done) {
        // User marked as done -> Deduplicate or Create
        progress.completedAt = new Date();
        const platform = inferPlatform(masterProblem.links);

        // Dedup Check
        const existingProblem = await Problem.findOne({
          userId,
          problemName: masterProblem.topic.trim(),
          platform,
        });

        if (existingProblem) {
          progress.linkedProblemId = existingProblem._id;
        } else {
          // Create new Problem
          // Extract broad topic from step title
          let broadTopic = 'General';
          if (masterProblem.stepId && masterProblem.stepId.title) {
            broadTopic = masterProblem.stepId.title.replace(/^Step\s+[\d\.]+\s*:\s*/i, '').trim();
          }

          const newProblem = new Problem({
            userId,
            problemName: masterProblem.topic.trim(),
            platform,
            problemLink: extractProblemLink(masterProblem.links),
            difficulty: masterProblem.difficulty,
            topic: broadTopic,
            subtopic: broadTopic,
            timeTaken: 30, // default
            dateSolved: new Date(),
            status: 'Solved',
            approachSummary: progress.note || 'Imported from Master DSA',
            mistakesFaced: '',
            keyLearning: '',
            codeSnippet: '',
            markedForRevision: progress.flaggedForRevision || false,
            imported: true,
            importSource: 'Master DSA',
            importedAt: new Date(),
            originalSolvedDate: new Date(),
          });
          await newProblem.save();
          progress.linkedProblemId = newProblem._id;

          // Auto-commit to GitHub if configured
          const userObj = await User.findById(userId);
          if (userObj?.github?.accessToken && userObj?.github?.autoCommit) {
            pushProblemToGithub({
              token: userObj.github.accessToken,
              username: userObj.github.username,
              repo: userObj.github.repository,
              problemTitle: newProblem.problemName,
              difficulty: newProblem.difficulty,
              url: newProblem.problemLink,
              notes: newProblem.approachSummary,
            }).catch(err => console.error('Background GitHub sync failed:', err));
          }
        }
      } else {
        // User unchecked -> Delete linked problem if imported, otherwise just unlink
        if (progress.linkedProblemId) {
          const linkedProb = await Problem.findById(progress.linkedProblemId);
          if (linkedProb && linkedProb.importSource === 'Master DSA') {
            await Problem.findByIdAndDelete(progress.linkedProblemId);
          }
        }
        progress.linkedProblemId = null;
        progress.completedAt = undefined;
      }
    } else if (done === true && progress.linkedProblemId && note !== undefined) {
       // if they update the note, optionally sync it to the linked Problem approachSummary?
       // The plan says "If note updates only: Update UserMasterProgress without touching Problem".
       // So we do nothing here.
    }

    await progress.save();

    // If done state changed, we trigger a full recomputation of stats
    if (done !== undefined) {
      await recomputeUserStats(userId);
    }

    return NextResponse.json({ success: true, progress });
  } catch (error) {
    console.error('Master DSA progress update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
