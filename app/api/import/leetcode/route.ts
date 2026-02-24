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

interface LeetCodeProblem {
  titleSlug: string;
  title: string;
  difficulty: string;
  topicTags: string[];
  timestamp: number;
}

async function fetchLeetCodeSubmissions(username: string): Promise<LeetCodeProblem[]> {
  try {
    // Strategy 1: Try to fetch from submissions API (may require auth)
    // Strategy 2: Use GraphQL with maximum possible limit
    // Strategy 3: Parse submission calendar
    
    const graphqlQuery = `
      query getUserData($username: String!) {
        matchedUser(username: $username) {
          submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
            }
          }
          submissionCalendar
        }
        recentAcSubmissionList(username: $username, limit: 100) {
          id
          title
          titleSlug
          timestamp
        }
      }
    `;

    const response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      body: JSON.stringify({
        query: graphqlQuery,
        variables: { username },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch from LeetCode');
    }

    const data = await response.json();

    if (data.errors) {
      throw new Error(data.errors[0]?.message || 'LeetCode API error');
    }

    if (!data.data?.matchedUser) {
      throw new Error('User not found or profile is private');
    }

    // Get recent submissions (this gives us the most recent ~100)
    let submissions = data.data.recentAcSubmissionList || [];
    
    // Log total vs fetched
    const statsGlobal = data.data.matchedUser.submitStatsGlobal.acSubmissionNum;
    const totalSolved = statsGlobal.reduce((sum: number, item: any) => sum + item.count, 0);
    
    console.log(`User has ${totalSolved} total solved, fetched ${submissions.length} recent submissions`);

    // Try to get more problems from submission calendar
    const submissionCalendar = data.data.matchedUser.submissionCalendar;
    if (submissionCalendar && submissions.length < totalSolved) {
      try {
        const calendar = JSON.parse(submissionCalendar);
        const submissionDates = Object.keys(calendar).filter(key => calendar[key] > 0);
        
        console.log(`Found ${submissionDates.length} days with submissions in calendar`);
        
        // Note: We can't get individual problems from calendar alone
        // Calendar only has counts per day, not problem details
        // This is a limitation of LeetCode's public API
      } catch (err) {
        console.error('Failed to parse submission calendar');
      }
    }

    if (submissions.length === 0) {
      throw new Error('No accepted submissions found. Make sure your profile is public.');
    }

    // Remove duplicates
    const seenProblems = new Set<string>();
    submissions = submissions.filter((sub: any) => {
      if (seenProblems.has(sub.titleSlug)) {
        return false;
      }
      seenProblems.add(sub.titleSlug);
      return true;
    });

    // Get problem details for each submission
    const problems: LeetCodeProblem[] = [];

    for (let i = 0; i < submissions.length; i++) {
      const submission = submissions[i];
      
      // Fetch problem details
      const problemQuery = `
        query questionData($titleSlug: String!) {
          question(titleSlug: $titleSlug) {
            difficulty
            topicTags {
              name
            }
          }
        }
      `;

      try {
        const problemResponse = await fetch('https://leetcode.com/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Referer': 'https://leetcode.com',
          },
          body: JSON.stringify({
            query: problemQuery,
            variables: { titleSlug: submission.titleSlug },
          }),
        });

        if (problemResponse.ok) {
          const problemData = await problemResponse.json();
          if (problemData.data?.question) {
            problems.push({
              titleSlug: submission.titleSlug,
              title: submission.title,
              difficulty: problemData.data.question.difficulty,
              topicTags: problemData.data.question.topicTags.map((tag: any) => tag.name),
              timestamp: parseInt(submission.timestamp),
            });
          }
        }

        // Add delay to avoid rate limiting (every 10 requests, wait longer)
        if ((i + 1) % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 500));
        } else {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (err) {
        console.error(`Failed to fetch details for ${submission.titleSlug}:`, err);
      }
    }

    // Log warning if we couldn't fetch all problems
    if (problems.length < totalSolved) {
      console.log(`⚠️ Warning: Fetched ${problems.length} out of ${totalSolved} total problems due to API limitations`);
    }

    return problems;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch LeetCode data');
  }
}

function mapTopicFromTags(tags: string[]): string {
  const topicMap: { [key: string]: string } = {
    'Array': 'Array',
    'String': 'String',
    'Hash Table': 'Hashing',
    'Dynamic Programming': 'Dynamic Programming',
    'Math': 'Math',
    'Sorting': 'Sorting',
    'Greedy': 'Greedy',
    'Depth-First Search': 'Graph',
    'Binary Search': 'Binary Search',
    'Database': 'Database',
    'Breadth-First Search': 'Graph',
    'Tree': 'Tree',
    'Matrix': 'Array',
    'Two Pointers': 'Two Pointers',
    'Bit Manipulation': 'Bit Manipulation',
    'Stack': 'Stack',
    'Design': 'Design',
    'Heap (Priority Queue)': 'Heap',
    'Graph': 'Graph',
    'Simulation': 'Array',
    'Prefix Sum': 'Array',
    'Counting': 'Hashing',
    'Sliding Window': 'Sliding Window',
    'Backtracking': 'Backtracking',
    'Linked List': 'Linked List',
    'Queue': 'Queue',
  };

  for (const tag of tags) {
    if (topicMap[tag]) {
      return topicMap[tag];
    }
  }

  return 'Array'; // Default
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
      return NextResponse.json({ error: 'LeetCode username is required' }, { status: 400 });
    }

    // Basic validation
    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
      return NextResponse.json({ error: 'Username must be 3-30 characters' }, { status: 400 });
    }

    await dbConnect();

    // Fetch submissions from LeetCode
    let lcProblems: LeetCodeProblem[];
    try {
      lcProblems = await fetchLeetCodeSubmissions(trimmedUsername);
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || 'Failed to fetch LeetCode data' },
        { status: 400 }
      );
    }

    const batchId = randomUUID();
    const validProblems: any[] = [];
    let duplicatesSkipped = 0;
    const nowDate = new Date();

    // Process each problem
    for (const lcProblem of lcProblems) {
      const externalId = `lc-${lcProblem.titleSlug}`;
      
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

      const topic = mapTopicFromTags(lcProblem.topicTags);
      const solvedDate = new Date(lcProblem.timestamp * 1000);

      const problemData = {
        userId,
        problemName: lcProblem.title,
        platform: 'LeetCode',
        problemLink: `https://leetcode.com/problems/${lcProblem.titleSlug}/`,
        difficulty: lcProblem.difficulty,
        topic,
        subtopic: topic,
        timeTaken: 30, // Default time
        dateSolved: solvedDate,
        status: 'Solved',
        approachSummary: `Imported from LeetCode. Tags: ${lcProblem.topicTags.join(', ')}`,
        mistakesFaced: '',
        keyLearning: '',
        codeSnippet: '',
        markedForRevision: false,
        revisionDates: [],
        revisionCount: 0,
        timesAttempted: 1,
        imported: true,
        importSource: 'LeetCode',
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
      source: 'LeetCode',
      totalRows: lcProblems.length,
      imported: insertedCount,
      duplicatesSkipped,
      invalidRows: 0,
      errorList: [],
      metadata: {
        leetcodeUsername: trimmedUsername,
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
          source: 'LeetCode',
          username: trimmedUsername,
          importBatchId: batchId,
        },
      });
    }

    // Return summary
    let message = isSync 
      ? `Synced ${insertedCount} new problems from LeetCode` 
      : `Imported ${insertedCount} problems from LeetCode`;
    
    // Add note about API limitation if we suspect there are more problems
    if (lcProblems.length >= 90 && !isSync) {
      message += '. Note: LeetCode\'s API returns recent submissions. Use "Sync" to capture more problems.';
    }

    return NextResponse.json({
      success: true,
      batchId,
      username: trimmedUsername,
      totalProblems: lcProblems.length,
      imported: insertedCount,
      duplicatesSkipped,
      message,
    });

  } catch (error) {
    console.error('LeetCode import error:', error);
    return NextResponse.json(
      { error: 'Failed to import from LeetCode' },
      { status: 500 }
    );
  }
}
