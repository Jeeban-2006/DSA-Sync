import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { createNotification } from '@/lib/notification-service';

// POST /api/notifications/test - Send test notification
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest();
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type = 'streak' } = body;

    let testNotification: any;
    
    switch (type) {
      case 'streak':
        testNotification = {
          userId: auth.user.userId,
          type: 'streak' as const,
          title: '🔥 Streak Reminder - Test',
          message: 'This is a test notification. Your streak is safe!',
          actionUrl: '/dashboard',
        };
        break;
      
      case 'revision':
        testNotification = {
          userId: auth.user.userId,
          type: 'revision' as const,
          title: '📚 Revision Reminder - Test',
          message: 'Test notification: 3 problems are due for revision',
          actionUrl: '/revisions',
        };
        break;
      
      case 'achievement':
        testNotification = {
          userId: auth.user.userId,
          type: 'achievement' as const,
          title: '🎉 Achievement Test',
          message: 'Test notification for achievement unlocked!',
          actionUrl: '/profile?tab=achievements',
        };
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid notification type' },
          { status: 400 }
        );
    }

    await createNotification(testNotification);

    return NextResponse.json({
      success: true,
      message: 'Test notification sent successfully',
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    return NextResponse.json(
      { error: 'Failed to send test notification' },
      { status: 500 }
    );
  }
}
