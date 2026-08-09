import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getGithubUser } from '@/lib/github';
import { verifyToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/+$/, '');
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!state) {
      return NextResponse.redirect(`${baseUrl}/auth/login`);
    }

    const userPayload = verifyToken(state);
    if (!userPayload) {
      return NextResponse.redirect(`${baseUrl}/auth/login`);
    }

    if (!code) {
      return NextResponse.redirect(`${baseUrl}/profile?error=No+code+provided`);
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(`${baseUrl}/profile?error=GitHub+App+not+configured`);
    }

    // Exchange code for access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      console.error('GitHub token error:', tokenData);
      return NextResponse.redirect(`${baseUrl}/profile?error=GitHub+Auth+Failed`);
    }

    const accessToken = tokenData.access_token;

    // Fetch user details from github
    const githubUser = await getGithubUser(accessToken);

    // Save to DB
    await connectDB();
    await User.findByIdAndUpdate(userPayload.userId, {
      $set: {
        'github.accessToken': accessToken,
        'github.username': githubUser.login,
        'github.autoCommit': true,
        'github.repository': 'dsa-sync-submissions',
      }
    });

    return NextResponse.redirect(`${baseUrl}/profile?github_success=true`);
  } catch (error) {
    console.error('GitHub callback error:', error);
    return NextResponse.redirect(`${baseUrl}/profile?error=Internal+server+error`);
  }
}
