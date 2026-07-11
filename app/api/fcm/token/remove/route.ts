import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    const userId = payload.userId;

    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectDB();
    
    // Clear all FCM tokens to unsubscribe the user from all devices (or we could specify one token)
    await User.findByIdAndUpdate(userId, {
      $set: { fcmTokens: [] }
    });

    return NextResponse.json({ success: true, message: 'FCM tokens cleared' });
  } catch (error) {
    console.error('Clear FCM tokens error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
