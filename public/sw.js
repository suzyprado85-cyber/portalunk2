// Service Worker for Portal UNK PWA (Vite friendly)
const CACHE_NAME = 'portal-unk-v2';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(CORE_ASSETS);
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : undefined)));
      await self.clients.claim();
    })()
  );
});

// Navigation requests -> SPA fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const preload = await event.preloadResponse;
          if (preload) return preload;
          const network = await fetch(request);
          return network;
        } catch (_) {
          const cache = await caches.open(CACHE_NAME);
          return (await cache.match('/index.html')) || (await cache.match('/'));
        }
      })()
    );
    return;
  }

  // Static assets: cache-first with network fallback
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);
      if (cached) return cached;
      try {
        const resp = await fetch(request);
        if (resp && resp.status === 200 && resp.type === 'basic') {
          cache.put(request, resp.clone());
        }
        return resp;
      } catch (_) {
        return cached || Response.error();
      }
    })()
  );
});
