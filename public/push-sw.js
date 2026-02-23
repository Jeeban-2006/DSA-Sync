self.addEventListener('push', function (event) {
  console.log('Push notification received:', event);

  if (!event.data) {
    console.log('No push data');
    return;
  }

  const data = event.data.json();
  const title = data.title || 'DSA Sync';
  const options = {
    body: data.body || data.message,
    icon: data.icon || '/icons/icon-512x512.svg',
    badge: data.badge || '/icons/icon-512x512.svg',
    data: {
      url: data.url || data.actionUrl || '/',
      timestamp: data.timestamp || Date.now(),
    },
    actions: data.actions || [],
    tag: data.tag || 'dsa-sync-notification',
    requireInteraction: false,
    vibrate: [200, 100, 200],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(function (clientList) {
        // Check if there's already a window open with our app
        for (let client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // If not, open a new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

self.addEventListener('pushsubscriptionchange', function (event) {
  console.log('Push subscription changed');
  
  event.waitUntil(
    fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: event.newSubscription.endpoint,
        keys: {
          p256dh: event.newSubscription.keys.p256dh,
          auth: event.newSubscription.keys.auth,
        },
      }),
    })
  );
});
