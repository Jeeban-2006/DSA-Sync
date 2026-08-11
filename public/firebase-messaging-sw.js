importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

const params = new URL(location).searchParams;

// Initialize the Firebase app in the service worker with the dynamically injected config or fallback
const firebaseConfig = {
  apiKey: params.get("apiKey") || "AIzaSyB3FaXM6tV4QLxgvbkhwqyD5FtqbiM32ho",
  authDomain: params.get("authDomain") || "dsa-sync-2f9db.firebaseapp.com",
  projectId: params.get("projectId") || "dsa-sync-2f9db",
  storageBucket: params.get("storageBucket") || "dsa-sync-2f9db.firebasestorage.app",
  messagingSenderId: params.get("messagingSenderId") || "514467142621",
  appId: params.get("appId") || "1:514467142621:web:9a8305a4f2ea3d9e47f434",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || payload.data?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || '',
    icon: payload.notification?.icon || payload.data?.icon || '/icon-192x192.png',
    badge: '/icon-192x192.png',
    data: payload.data || {}
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
