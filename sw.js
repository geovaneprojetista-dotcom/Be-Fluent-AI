// A basic service worker for offline functionality

const CACHE_NAME = 'be-fluent-ai-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx',
  // Note: Add other static assets like images or CSS files here if they are not loaded from a CDN.
];

// Install event: opens a cache and adds the core assets to it.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event: serves assets from cache first (cache-first strategy).
// This allows the app to work offline.
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // Not in cache - fetch from network
        return fetch(event.request);
      })
  );
});
