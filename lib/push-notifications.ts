'use client';

import { useEffect } from 'react';

export function registerPushNotifications() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push notifications not supported');
    return;
  }

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  navigator.serviceWorker
    .register('/push-sw.js')
    .then((registration) => {
      console.log('Service Worker registered:', registration);

      // Subscribe to push notifications
      return registration.pushManager.getSubscription().then((subscription) => {
        if (subscription) {
          return subscription;
        }

        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) {
          console.error('VAPID public key not configured');
          return null;
        }

        const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

        return registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey,
        });
      });
    })
    .then((subscription) => {
      if (subscription) {
        // Send subscription to server
        return fetch('/api/notifications/preferences/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription }),
        });
      }
    })
    .catch((error) => {
      console.error('Service Worker registration failed:', error);
    });
}

export function usePushNotifications() {
  useEffect(() => {
    if (localStorage.getItem('auth-token')) {
      registerPushNotifications();
    }
  }, []);
}
