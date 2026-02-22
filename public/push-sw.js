self.addEventListener('push', function (event) {
  if (!event.data) return;

  const data = event.data.json();
  const title = data.title || 'DSA Sync';
  const options = {
    body: data.body || data.message,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    data: {
      url: data.url || data.actionUrl || '/',
    },
    actions: data.actions || [
      { action: 'open', title: 'View' },
      { action: 'close', title: 'Dismiss' },
    ],
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
  event.waitUntil(
    fetch('/api/notifications/preferences/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: event.newSubscription,
      }),
    })
  );
});
