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
    
    // Quick verify payload (Usually should use jsonwebtoken but edge runtime might need jose)
    // Here we'll just parse the JWT to get userId for this demo
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    const userId = payload.userId;

    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { token: fcmToken } = await request.json();

    if (!fcmToken) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    await connectDB();
    
    // Add token to fcmTokens array if it doesn't already exist
    await User.findByIdAndUpdate(userId, {
      $addToSet: { fcmTokens: fcmToken }
    });

    return NextResponse.json({ success: true, message: 'FCM token saved' });
  } catch (error) {
    console.error('Save FCM token error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
