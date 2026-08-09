import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest();

    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    
    if (!clientId) {
      return NextResponse.json({ error: 'GitHub Integration not configured' }, { status: 500 });
    }

    // Get token from header to pass as state
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1] || '';

    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/+$/, '');
    const redirectUri = `${baseUrl}/api/auth/github/callback`;
    const scope = 'repo,user';

    const githubUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${token}`;

    return NextResponse.json({ url: githubUrl });
  } catch (error) {
    console.error('GitHub auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
