importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker with the public config
firebase.initializeApp({
  apiKey: "AIzaSyA8tjuanMPmV2nc7vBH8hV9ToK_4kRcglU",
  authDomain: "dsa-sync-4bd38.firebaseapp.com",
  projectId: "dsa-sync-4bd38",
  storageBucket: "dsa-sync-4bd38.firebasestorage.app",
  messagingSenderId: "39530913530",
  appId: "1:39530913530:web:502b3b0ab11a88940af343",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body,
    icon: '/icon-192x192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
