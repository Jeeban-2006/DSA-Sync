import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

// Initialize Firebase Admin App lazily
export const getAdminMessaging = () => {
  if (!getApps().length) {
    try {
      if (!process.env.FIREBASE_PRIVATE_KEY) {
        console.warn('Firebase Admin credentials not found. Admin messaging will not be available.');
        return null;
      }
      initializeApp({
        credential: cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // Handle newline characters in private key when loaded from environment variable
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    } catch (error) {
      console.error('Firebase Admin initialization error', error);
      return null;
    }
  }
  return getMessaging();
};
