import { NextRequest, NextResponse } from 'next/server';
import { getAdminMessaging } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const jwtToken = authHeader.split(' ')[1];
    
    // Quick decode of JWT payload
    const payload = JSON.parse(Buffer.from(jwtToken.split('.')[1], 'base64').toString());
    const userId = payload.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { fcmToken, title, body } = await request.json();
    if (!fcmToken) {
      return NextResponse.json({ error: 'FCM Token is required' }, { status: 400 });
    }

    const adminMessaging = getAdminMessaging();
    if (!adminMessaging) {
      return NextResponse.json(
        { error: 'Firebase Admin messaging is not available. Please verify FIREBASE_PRIVATE_KEY is configured.' },
        { status: 500 }
      );
    }

    const message = {
      notification: {
        title: title || '🔥 Test Notification',
        body: body || 'FCM integration is working successfully!',
      },
      token: fcmToken,
    };

    console.log('Sending FCM message:', message);
    const response = await adminMessaging.send(message);
    console.log('FCM message sent successfully, response:', response);

    return NextResponse.json({ success: true, messageId: response });
  } catch (error: any) {
    console.error('Send FCM test error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
