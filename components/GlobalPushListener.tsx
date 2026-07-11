'use client';

import { useEffect } from 'react';
import { onMessageListener } from '@/lib/firebase';
import toast from 'react-hot-toast';

export default function GlobalPushListener() {
  useEffect(() => {
    onMessageListener((payload: any) => {
      console.log('Foreground Message received. ', payload);
      toast.success(payload.notification?.title || payload.notification?.body || 'New notification', {
        icon: '🔔',
        duration: 5000,
      });
    });
  }, []);

  return null;
}
