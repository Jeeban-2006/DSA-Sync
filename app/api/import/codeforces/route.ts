import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import Problem from '@/models/Problem';
import ImportHistory from '@/models/ImportHistory';
import ActivityLog from '@/models/ActivityLog';
import { randomUUID } from 'crypto';

// Rate limiting
const importAttempts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // Max 10 requests per hour
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

interface CodeforcesProblem {
  problemName: string;
  contestId: number;
  index: string;
  rating?: number;
  tags: string[];
  submissionId: number;
  creationTimeSeconds: number;
}

function mapDifficulty(rating?: number): 'Easy' | 'Medium' | 'Hard' {
  if (!rating) return 'Medium';
  if (rating < 1200) return 'Easy';
  if (rating < 1600) return 'Medium';
  return 'Hard';
}

function inferTopic(tags: string[]): string {
  const topicMap: { [key: string]: string } = {
    'dp': 'Dynamic Programming',
    'greedy': 'Greedy',
    'graphs': 'Graph',
    'trees': 'Tree',
    'math': 'Math',
    'strings': 'String',
    'data structures': 'Array',
    'brute force': 'Array',
    'binary search': 'Binary Search',
    'two pointers': 'Two Pointers',
    'dfs and similar': 'Graph',
    'bfs': 'Graph',
    'implementation': 'Array',
    'sortings': 'Sorting',
    'number theory': 'Math',
    'combinatorics': 'Math',
    'geometry': 'Math',
    'bitmasks': 'Bit Manipulation',
    'divide and conquer': 'Recursion',
  };

  for (const tag of tags) {
    const normalized = tag.toLowerCase();
    if (topicMap[normalized]) {
      return topicMap[normalized];
    }
  }

  return 'Array'; // Default
}

async function fetchCodeforcesSubmissions(handle: string): Promise<CodeforcesProblem[]> {
  const url = `https://codeforces.com/api/user.status?handle=${handle}`;
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'DSA-Tracker-App',
    },
  });

  if (!response.ok) {
    if (response.status === 400) {
      throw new Error('Invalid Codeforces handle');
    }
    throw new Error('Failed to fetch from Codeforces API');
  }

  const data = await response.json();

  if (data.status !== 'OK') {
    throw new Error(data.comment || 'Codeforces API error');
  }

  // Filter accepted submissions
  const acceptedSubmissions = data.result.filter((sub: any) => sub.verdict === 'OK');

  // Remove duplicates (keep only first accepted submission per problem)
  const uniqueProblems = new Map<string, any>();
  
  for (const sub of acceptedSubmissions) {
    const problemKey = `${sub.problem.contestId}-${sub.problem.index}`;
    
    if (!uniqueProblems.has(problemKey)) {
      uniqueProblems.set(problemKey, {
        problemName: sub.problem.name,
        contestId: sub.problem.contestId,
        index: sub.problem.index,
        rating: sub.problem.rating,
        tags: sub.problem.tags || [],
        submissionId: sub.id,
        creationTimeSeconds: sub.creationTimeSeconds,
      });
    }
  }

  return Array.from(uniqueProblems.values());
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.userId;

    // Rate limiting check
    const nowTimestamp = Date.now();
    const userAttempts = importAttempts.get(userId);
    
    if (userAttempts) {
      if (nowTimestamp < userAttempts.resetTime) {
        if (userAttempts.count >= RATE_LIMIT) {
          return NextResponse.json(
            { error: 'Rate limit exceeded. Please try again in an hour.' },
            { status: 429 }
          );
        }
        userAttempts.count++;
      } else {
        importAttempts.set(userId, { count: 1, resetTime: nowTimestamp + RATE_WINDOW });
      }
    } else {
      importAttempts.set(userId, { count: 1, resetTime: nowTimestamp + RATE_WINDOW });
    }

    // Get request body
    const body = await request.json();
    const { handle, isSync = false } = body;

    if (!handle || typeof handle !== 'string') {
      return NextResponse.json({ error: 'Codeforces handle is required' }, { status: 400 });
    }

    // Basic validation: trim and check length
    const trimmedHandle = handle.trim();
    if (trimmedHandle.length < 3 || trimmedHandle.length > 24) {
      return NextResponse.json({ error: 'Handle must be 3-24 characters' }, { status: 400 });
    }

    await dbConnect();

    // Fetch submissions from Codeforces
    let cfProblems: CodeforcesProblem[];
    try {
      cfProblems = await fetchCodeforcesSubmissions(trimmedHandle);
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || 'Failed to fetch Codeforces data' },
        { status: 400 }
      );
    }

    const batchId = randomUUID();
    const validProblems: any[] = [];
    let duplicatesSkipped = 0;
    const nowDate = new Date();

    // Process each problem
    for (const cfProblem of cfProblems) {
      const externalId = `cf-${cfProblem.contestId}-${cfProblem.index}`;
      
      // Check for duplicates
      const existing = await Problem.findOne({
        userId,
        externalId,
      });

      if (existing) {
        duplicatesSkipped++;
        
        // Update lastSyncedAt for existing problems if it's a sync
        if (isSync) {
          await Problem.updateOne(
            { _id: existing._id },
            { $set: { lastSyncedAt: nowDate } }
          );
        }
        continue;
      }

      const topic = inferTopic(cfProblem.tags);
      const difficulty = mapDifficulty(cfProblem.rating);
      const solvedDate = new Date(cfProblem.creationTimeSeconds * 1000);

      const problemData = {
        userId,
        problemName: cfProblem.problemName,
        platform: 'Codeforces',
        problemLink: `https://codeforces.com/problemset/problem/${cfProblem.contestId}/${cfProblem.index}`,
        difficulty,
        topic,
        subtopic: topic,
        timeTaken: 45, // Default time
        dateSolved: solvedDate,
        status: 'Solved',
        approachSummary: `Imported from Codeforces. Rating: ${cfProblem.rating || 'N/A'}`,
        mistakesFaced: '',
        keyLearning: '',
        codeSnippet: '',
        markedForRevision: false,
        revisionDates: [],
        revisionCount: 0,
        timesAttempted: 1,
        imported: true,
        importSource: 'Codeforces',
        externalId,
        importBatchId: batchId,
        importedAt: nowDate,
        originalSolvedDate: solvedDate,
        lastSyncedAt: nowDate,
      };

      validProblems.push(problemData);
    }

    // Bulk insert new problems
    let insertedCount = 0;
    if (validProblems.length > 0) {
      const result = await Problem.insertMany(validProblems, { ordered: false });
      insertedCount = result.length;
    }

    // Save import history
    const importHistory = new ImportHistory({
      userId,
      batchId,
      source: 'Codeforces',
      totalRows: cfProblems.length,
      imported: insertedCount,
      duplicatesSkipped,
      invalidRows: 0,
      errorList: [],
      metadata: {
        codeforcesHandle: trimmedHandle,
        isSync,
      },
    });
    await importHistory.save();

    // Log activity
    if (insertedCount > 0) {
      await ActivityLog.create({
        userId,
        type: isSync ? 'import_synced' : 'import_completed',
        metadata: {
          count: insertedCount,
          source: 'Codeforces',
          handle: trimmedHandle,
          importBatchId: batchId,
        },
      });
    }

    // Return summary
    return NextResponse.json({
      success: true,
      batchId,
      handle: trimmedHandle,
      totalProblems: cfProblems.length,
      imported: insertedCount,
      duplicatesSkipped,
      message: isSync 
        ? `Synced ${insertedCount} new problems from Codeforces` 
        : `Imported ${insertedCount} problems from Codeforces`,
    });

  } catch (error) {
    console.error('Codeforces import error:', error);
    return NextResponse.json(
      { error: 'Failed to import from Codeforces' },
      { status: 500 }
    );
  }
}
