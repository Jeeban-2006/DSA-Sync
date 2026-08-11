import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Problem from '@/models/Problem';

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

    const { username, repository: repo, accessToken: token } = user.github;

    if (!repo) {
      return NextResponse.json({ error: 'No GitHub repository configured' }, { status: 400 });
    }

    // 1. Fetch repository tree
    const treeRes = await fetch(`https://api.github.com/repos/${username}/${repo}/git/trees/main?recursive=1`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!treeRes.ok) {
      const err = await treeRes.json().catch(() => null);
      throw new Error(`Failed to fetch repository tree: ${err?.message || treeRes.statusText}`);
    }

    const treeData = await treeRes.json();
    if (!treeData.tree || !Array.isArray(treeData.tree)) {
      throw new Error('Invalid tree data from GitHub');
    }

    // Regex to match LeetHub folder structure: 0001-two-sum/two-sum.cpp
    // We ignore README.md and only look for code files.
    const leethubRegex = /^\d+-([^/]+)\/([^/]+\.(cpp|py|java|js|ts|c|cs|go|rs|rb|swift|kt|php))$/i;

    const matchedFiles = treeData.tree
      .filter((item: any) => item.type === 'blob' && leethubRegex.test(item.path))
      .map((item: any) => {
        const match = item.path.match(leethubRegex);
        return {
          path: item.path,
          slug: match![1].toLowerCase(),
          url: `https://raw.githubusercontent.com/${username}/${repo}/main/${item.path}`,
        };
      });

    if (matchedFiles.length === 0) {
      return NextResponse.json({ count: 0, message: 'No LeetHub code files found in repository' });
    }

    // 2. Fetch all user problems and build a slug map
    const problems = await Problem.find({ userId: auth.user.userId, platform: 'LeetCode' });
    const problemSlugMap = new Map();

    for (const problem of problems) {
      if (!problem.problemLink) continue;
      // Extract slug from URL: https://leetcode.com/problems/two-sum/ -> two-sum
      const match = problem.problemLink.match(/leetcode\.com\/problems\/([^/]+)/i);
      if (match && match[1]) {
        problemSlugMap.set(match[1].toLowerCase(), problem);
      }
    }

    let successCount = 0;

    // 3. Process each matched file
    for (const file of matchedFiles) {
      const problem = problemSlugMap.get(file.slug);
      
      // If we found a corresponding problem in DSA Sync that doesn't have code yet (or we just overwrite it)
      if (problem) {
        try {
          const codeRes = await fetch(file.url, {
            headers: {
              Authorization: `token ${token}`,
            },
          });

          if (codeRes.ok) {
            const codeText = await codeRes.text();
            
            // Update problem in database
            problem.codeSnippet = codeText;
            problem.imported = true;
            if (problem.status === "Couldn't Solve" || problem.status === 'Attempted') {
               problem.status = 'Solved'; // If we have code, it's solved!
            }
            
            await problem.save();
            successCount++;
          }
          
          // Small delay to prevent rate limiting from raw.githubusercontent
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (err) {
          console.error(`Failed to fetch code for ${file.slug}:`, err);
        }
      }
    }

    return NextResponse.json({ success: true, count: successCount, totalFilesFound: matchedFiles.length });
  } catch (error: any) {
    console.error('GitHub pull error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
