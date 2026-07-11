import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest();

    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(auth.user.userId);

    if (!user || !user.github?.accessToken) {
      return NextResponse.json({ error: 'GitHub not connected. Please connect your GitHub account in Profile.' }, { status: 400 });
    }

    // Call GitHub API to star the repo
    const response = await fetch('https://api.github.com/user/starred/Jeeban-2006/DSA-Sync', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${user.github.accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (response.status === 204) {
      return NextResponse.json({ success: true, message: 'Successfully starred the repository!' });
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to star repository');
    }
  } catch (error: any) {
    console.error('Error starring repo:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
