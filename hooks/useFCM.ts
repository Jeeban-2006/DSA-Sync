import { useState, useEffect, useCallback } from 'react';
import { getFCMToken, requestNotificationPermission, isNotificationSupported } from '@/lib/notifications';
import { onMessageListener } from '@/lib/firebase';

export interface UseFCMReturn {
  token: string | null;
  permission: NotificationPermission;
  loading: boolean;
  error: Error | null;
  requestPermission: () => Promise<string | null>;
}

export function useFCM(): UseFCMReturn {
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Initialize and check current status
  useEffect(() => {
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    if (!isNotificationSupported()) {
      setLoading(false);
      setError(new Error('Push notifications not supported in this browser.'));
      return;
    }

    const currentPermission = Notification.permission;
    setPermission(currentPermission);

    const initFCM = async () => {
      try {
        setLoading(true);
        if (currentPermission === 'granted') {
          const fcmToken = await getFCMToken();
          setToken(fcmToken);
        }
      } catch (err: any) {
        console.error('Error during FCM initialization:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    initFCM();

    // Listen for foreground notifications
    let unsubscribeForeground: (() => void) | undefined;
    
    const setupListener = async () => {
      try {
        const unsub = await onMessageListener((payload: any) => {
          console.log('Foreground message received in useFCM hook:', payload);
          // Dispatch a custom event to allow components to listen globally if needed
          if (typeof window !== 'undefined') {
            const event = new CustomEvent('fcm-message-received', { detail: payload });
            window.dispatchEvent(event);
          }
        });
        unsubscribeForeground = unsub;
      } catch (err) {
        console.error('Error setting up foreground message listener:', err);
      }
    };

    setupListener();

    return () => {
      if (unsubscribeForeground) {
        unsubscribeForeground();
      }
    };
  }, []);

  // Request permission and retrieve token
  const requestPermission = useCallback(async (): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const permResult = await requestNotificationPermission();
      setPermission(permResult);

      if (permResult === 'granted') {
        const fcmToken = await getFCMToken();
        setToken(fcmToken);
        return fcmToken;
      } else {
        throw new Error('Notification permission denied');
      }
    } catch (err: any) {
      const formattedError = err instanceof Error ? err : new Error(String(err));
      setError(formattedError);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    token,
    permission,
    loading,
    error,
    requestPermission,
  };
}
