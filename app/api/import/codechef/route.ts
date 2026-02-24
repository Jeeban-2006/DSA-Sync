import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import Problem from '@/models/Problem';
import ImportHistory from '@/models/ImportHistory';
import ActivityLog from '@/models/ActivityLog';
import { randomUUID } from 'crypto';

// Rate limiting
const importAttempts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

interface CodeChefProblem {
  problemCode: string;
  problemName: string;
  contestCode: string;
  result: string;
  submittedAt: string;
}

function mapDifficultyFromRating(rating: string): 'Easy' | 'Medium' | 'Hard' {
  const stars = parseFloat(rating);
  if (stars <= 1) return 'Easy';
  if (stars <= 2) return 'Medium';
  return 'Hard';
}

function inferTopicFromCode(problemCode: string): string {
  const code = problemCode.toLowerCase();
  
  // Simple heuristics based on problem code patterns
  if (code.includes('tree') || code.includes('graph')) return 'Tree';
  if (code.includes('dp') || code.includes('dyn')) return 'Dynamic Programming';
  if (code.includes('sort')) return 'Sorting';
  if (code.includes('arr') || code.includes('array')) return 'Array';
  if (code.includes('str') || code.includes('string')) return 'String';
  if (code.includes('math')) return 'Math';
  if (code.includes('greedy')) return 'Greedy';
  if (code.includes('binary')) return 'Binary Search';
  
  return 'Array'; // Default
}

async function fetchCodeChefSubmissions(username: string): Promise<CodeChefProblem[]> {
  try {
    // CodeChef API endpoint - Note: This is a simplified version
    // In production, you might need to use their official API with authentication
    const url = `https://www.codechef.com/recent/user?page=0&user_handle=${username}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'DSA-Tracker-App',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('CodeChef user not found');
      }
      throw new Error('Failed to fetch from CodeChef');
    }

    const data = await response.json();

    if (!data.content || !Array.isArray(data.content)) {
      throw new Error('No submissions found');
    }

    // Filter only accepted submissions
    const acceptedSubmissions = data.content.filter(
      (sub: any) => sub.result === 'AC' // Accepted
    );

    // Remove duplicates by problem code
    const uniqueProblems = new Map<string, CodeChefProblem>();
    
    for (const sub of acceptedSubmissions) {
      const problemCode = sub.problemCode;
      
      if (!uniqueProblems.has(problemCode)) {
        uniqueProblems.set(problemCode, {
          problemCode: sub.problemCode,
          problemName: sub.problemName || sub.problemCode,
          contestCode: sub.contestCode || 'PRACTICE',
          result: sub.result,
          submittedAt: sub.submittedAt,
        });
      }
    }

    return Array.from(uniqueProblems.values());
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch CodeChef data');
  }
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
    const { username, isSync = false } = body;

    if (!username || typeof username !== 'string') {
      return NextResponse.json({ error: 'CodeChef username is required' }, { status: 400 });
    }

    // Basic validation
    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
      return NextResponse.json({ error: 'Username must be 3-30 characters' }, { status: 400 });
    }

    await dbConnect();

    // Fetch submissions from CodeChef
    let ccProblems: CodeChefProblem[];
    try {
      ccProblems = await fetchCodeChefSubmissions(trimmedUsername);
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || 'Failed to fetch CodeChef data' },
        { status: 400 }
      );
    }

    const batchId = randomUUID();
    const validProblems: any[] = [];
    let duplicatesSkipped = 0;
    const nowDate = new Date();

    // Process each problem
    for (const ccProblem of ccProblems) {
      const externalId = `cc-${ccProblem.problemCode}`;
      
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

      const topic = inferTopicFromCode(ccProblem.problemCode);
      // Default to Medium difficulty for CodeChef problems
      const difficulty = 'Medium';
      const solvedDate = ccProblem.submittedAt 
        ? new Date(ccProblem.submittedAt) 
        : nowDate;

      const problemData = {
        userId,
        problemName: ccProblem.problemName,
        platform: 'CodeChef',
        problemLink: `https://www.codechef.com/problems/${ccProblem.problemCode}`,
        difficulty,
        topic,
        subtopic: topic,
        timeTaken: 45, // Default time
        dateSolved: solvedDate,
        status: 'Solved',
        approachSummary: `Imported from CodeChef. Contest: ${ccProblem.contestCode}`,
        mistakesFaced: '',
        keyLearning: '',
        codeSnippet: '',
        markedForRevision: false,
        revisionDates: [],
        revisionCount: 0,
        timesAttempted: 1,
        imported: true,
        importSource: 'CodeChef',
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
      source: 'CodeChef',
      totalRows: ccProblems.length,
      imported: insertedCount,
      duplicatesSkipped,
      invalidRows: 0,
      errorList: [],
      metadata: {
        codechefUsername: trimmedUsername,
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
          source: 'CodeChef',
          username: trimmedUsername,
          importBatchId: batchId,
        },
      });
    }

    // Return summary
    return NextResponse.json({
      success: true,
      batchId,
      username: trimmedUsername,
      totalProblems: ccProblems.length,
      imported: insertedCount,
      duplicatesSkipped,
      message: isSync 
        ? `Synced ${insertedCount} new problems from CodeChef` 
        : `Imported ${insertedCount} problems from CodeChef`,
    });

  } catch (error) {
    console.error('CodeChef import error:', error);
    return NextResponse.json(
      { error: 'Failed to import from CodeChef' },
      { status: 500 }
    );
  }
}
