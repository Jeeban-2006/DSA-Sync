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

    const body = await request.json();
    const { repository, autoCommit } = body;

    const updates: any = {};
    if (repository !== undefined) updates['github.repository'] = repository;
    if (autoCommit !== undefined) updates['github.autoCommit'] = autoCommit;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ message: 'No changes' });
    }

    await connectDB();
    await User.findByIdAndUpdate(auth.user.userId, { $set: updates });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('GitHub settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
