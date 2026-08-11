import { app } from './firebase';
import { getMessaging, getToken, isSupported } from 'firebase/messaging';

/**
 * Check if notifications are supported
 */
export const isNotificationSupported = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'Notification' in window &&
    'PushManager' in window
  );
};

/**
 * Request browser notification permission
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!isNotificationSupported()) {
    return 'default';
  }

  return await Notification.requestPermission();
};

/**
 * Register Firebase Messaging Service Worker
 */
export const registerMessagingServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!isNotificationSupported()) return null;

  try {
    const configParams = new URLSearchParams({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
    }).toString();

    const swUrl = `/firebase-messaging-sw.js?${configParams}`;

    // Get all registrations to find existing one
    const registrations = await navigator.serviceWorker.getRegistrations();
    const existing = registrations.find(
      (reg) => reg.active && reg.active.scriptURL.includes('/firebase-messaging-sw.js')
    );

    if (existing) {
      console.log('✅ Existing Service Worker found');
      // If the configuration params match, return existing
      if (existing.active && existing.active.scriptURL.includes(configParams)) {
        return existing;
      }
      console.log('Updating Service Worker configuration...');
    }

    console.log('Registering Firebase Messaging Service Worker...');

    const registration = await navigator.serviceWorker.register(swUrl, {
      scope: '/',
    });

    await navigator.serviceWorker.ready;

    console.log('✅ Service Worker Registered');
    return registration;
  } catch (error) {
    console.error('❌ Service Worker registration failed');
    console.error(error);
    return null;
  }
};

/**
 * Generate FCM Token
 */
export const getFCMToken = async (): Promise<string | null> => {
  if (!isNotificationSupported() || !app) {
    console.error('Notifications are not supported.');
    return null;
  }

  try {
    console.log('========== FCM DEBUG ==========');

    console.log('Notification Permission:', Notification.permission);

    const supported = await isSupported();
    console.log('Messaging Supported:', supported);

    if (!supported) {
      return null;
    }

    const registration = await registerMessagingServiceWorker();

    if (!registration) {
      console.error('No Service Worker registration.');
      return null;
    }

    const vapidKey =
      process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ||
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

    console.log('Firebase Config:', {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      senderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    });

    console.log('VAPID Key:', vapidKey);

    if (!vapidKey) {
      console.error('Missing VAPID Key.');
      return null;
    }

    const messaging = getMessaging(app);

    console.log('Messaging Instance:', messaging);
    console.log('Service Worker:', registration);

    try {
      const token = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: registration,
      });

      console.log('Generated Token:', token);

      if (!token) {
        console.warn('Firebase returned an empty token.');
        return null;
      }

      return token;
    } catch (err: any) {
      console.error('========== FIREBASE ERROR ==========');
      console.error('Name:', err?.name);
      console.error('Code:', err?.code);
      console.error('Message:', err?.message);
      console.error('Stack:', err?.stack);
      console.dir(err);
      return null;
    }
  } catch (error: any) {
    console.error('========== OUTER ERROR ==========');
    console.error(error);
    console.error('Name:', error?.name);
    console.error('Code:', error?.code);
    console.error('Message:', error?.message);
    return null;
  }
};