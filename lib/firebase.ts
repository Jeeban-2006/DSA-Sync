import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only on client side
const app = typeof window !== 'undefined' ? (!getApps().length ? initializeApp(firebaseConfig) : getApp()) : null;

// Messaging setup
let messaging: any = null;

export const initMessaging = async () => {
  if (typeof window !== 'undefined' && app) {
    const supported = await isSupported();
    if (supported) {
      try {
        messaging = getMessaging(app);
        return messaging;
      } catch (error) {
        console.error('Failed to initialize Firebase Messaging:', error);
      }
    }
  }
  return null;
};

export const requestFCMToken = async () => {
  try {
    const msg = await initMessaging();
    if (!msg) return null;

    // Get the existing service worker registration that has the config query params
    let swRegistration = null;
    if ('serviceWorker' in navigator) {
      swRegistration = await navigator.serviceWorker.getRegistration();
    }

    const token = await getToken(msg, {
      vapidKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      serviceWorkerRegistration: swRegistration || undefined,
    });

    if (token) {
      return token;
    } else {
      console.log('No registration token available. Request permission to generate one.');
      return null;
    }
  } catch (error) {
    console.error('An error occurred while retrieving token:', error);
    return null;
  }
};

export const onMessageListener = async (callback: (payload: any) => void) => {
  try {
    const msg = await initMessaging();
    if (!msg) return;
    
    onMessage(msg, (payload) => {
      callback(payload);
    });
  } catch (err) {
    console.error('Failed to setup message listener', err);
  }
};

export { app };
