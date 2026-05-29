// Nuxio Service Worker — Push Notifications + Offline Cache
const CACHE = 'nuxio-v2';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

// Manejar notificaciones push entrantes
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  const title = data.title || 'Nuxio';
  const options = {
    body: data.body || 'Tenés una notificación',
    icon: data.icon || '/icon-192.png',
    badge: '/badge-72.png',
    tag: data.tag || 'nuxio-notif',
    data: data.url || '/',
    actions: data.actions || [],
    vibrate: [100, 50, 100],
    requireInteraction: data.requireInteraction || false,
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

// Click en notificación — abrir la app
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = e.notification.data || '/';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

// Background sync para recordatorios de turno
self.addEventListener('sync', e => {
  if (e.tag === 'check-appointments') {
    e.waitUntil(checkUpcomingAppointments());
  }
});

async function checkUpcomingAppointments() {
  // Este sync se dispara cuando hay conexión
  // El servidor (Supabase Edge Function) maneja el envío real
  console.log('[SW] Checking upcoming appointments...');
}
