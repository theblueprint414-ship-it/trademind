const CACHE_NAME = 'trademind-v3';
const STATIC_ASSETS = ['/', '/checkin', '/dashboard', '/manifest.json', '/offline.html'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.pathname.startsWith('/api/')) return;

  const isNavigation = request.mode === 'navigate';

  if (isNavigation) {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(request).then((cached) => cached || caches.match('/offline.html'))
      )
    );
    return;
  }

  // Cache first for static assets
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request).then((response) => {
        if (response.ok) {
          caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
        }
        return response;
      });
      return cached || fetchPromise;
    })
  );
});

// ─── Push Notifications ───────────────────────────────────────────────────

self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title ?? 'TradeMind';
  const body = data.body ?? "Time for your daily mental check-in.";
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: 'trademind-checkin',
      data: { url: '/checkin' },
      actions: [{ action: 'checkin', title: 'Start Check-in' }],
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? '/checkin';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});

// ─── Daily reminder alarm ─────────────────────────────────────────────────

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SCHEDULE_REMINDER') {
    const { hour, minute } = event.data;
    scheduleDaily(hour, minute, null);
  }
  if (event.data?.type === 'SCHEDULE_REMINDER_WITH_SCORE') {
    const { hour, minute, yesterdayScore } = event.data;
    scheduleDaily(hour, minute, yesterdayScore);
  }
});

function scheduleDaily(hour, minute, yesterdayScore) {
  const now = new Date();
  const next = new Date();
  next.setHours(hour, minute, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  const delay = next.getTime() - now.getTime();
  setTimeout(() => {
    let body = "Morning. Your mental edge check-in is ready.";
    if (yesterdayScore !== undefined && yesterdayScore !== null) {
      if (yesterdayScore >= 70) body = `Yesterday: ${yesterdayScore} — GO. Let's see where today lands.`;
      else if (yesterdayScore >= 45) body = `Yesterday: ${yesterdayScore} — CAUTION. Check yourself before you trade.`;
      else body = `Yesterday was a NO-TRADE day (${yesterdayScore}). Take 60 seconds before you touch anything.`;
    }
    self.registration.showNotification('TradeMind — Daily Check-in', {
      body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: 'trademind-checkin',
      data: { url: '/checkin' },
      actions: [{ action: 'checkin', title: 'Check in now' }],
    });
    scheduleDaily(hour, minute, null); // reschedule for tomorrow without score
  }, delay);
}

