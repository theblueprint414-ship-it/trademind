const CACHE_VERSION = 'v5';
const CACHE_NAME = `trademind-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';

// ─── Install: cache only the offline fallback page ───────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add(OFFLINE_URL))
  );
  self.skipWaiting();
});

// ─── Activate: delete every old cache, claim all clients immediately ──────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) =>
        Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
      )
      .then(() => self.clients.claim())
  );
});

// ─── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and API calls entirely — let them go straight to network
  if (request.method !== 'GET' || url.pathname.startsWith('/api/')) return;

  // Navigation (page loads): ALWAYS network-first.
  // Only fall back to the offline page if the network is completely unreachable.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // Next.js content-hashed static chunks: safe to cache forever.
  // These filenames change with every build, so cache-first is correct here.
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Everything else (icons, manifest, fonts): network-first with cache fallback.
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// ─── Push Notifications ───────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title ?? 'TradeMind';
  const body = data.body ?? 'Time for your daily mental check-in.';
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

// ─── Daily reminder scheduling ────────────────────────────────────────────────
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
    let body = 'Morning. Your mental edge check-in is ready.';
    if (yesterdayScore !== undefined && yesterdayScore !== null) {
      if (yesterdayScore >= 70)
        body = `Yesterday: ${yesterdayScore} — GO. Let's see where today lands.`;
      else if (yesterdayScore >= 45)
        body = `Yesterday: ${yesterdayScore} — CAUTION. Check yourself before you trade.`;
      else
        body = `Yesterday was a NO-TRADE day (${yesterdayScore}). Take 60 seconds before you touch anything.`;
    }
    self.registration.showNotification('TradeMind — Daily Check-in', {
      body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: 'trademind-checkin',
      data: { url: '/checkin' },
      actions: [{ action: 'checkin', title: 'Check in now' }],
    });
    scheduleDaily(hour, minute, null);
  }, delay);
}