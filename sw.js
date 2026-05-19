const CACHE_VERSION = 'mini-games-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/arrow-game.html',
  '/brick-breaker.html',
  '/catch-ball.html',
  '/color-match.html',
  '/cookie-clicker.html',
  '/flappy-square.html',
  '/memory-match.html',
  '/Simple-Game.html',
  '/snake.html',
  '/space-shooter.html',
  '/stick-hero.html',
  '/whack-a-mole.html',
  '/fonts/Outfit-Variable.woff2',
  '/lib/gsap.min.js',
  '/icons/arrow-game.png',
  '/icons/brick-breaker.png',
  '/icons/catch-ball.png',
  '/icons/color-match.png',
  '/icons/cookie-clicker.png',
  '/icons/flappy-square.png',
  '/icons/memory-match.png',
  '/icons/simple-game.png',
  '/icons/snake.png',
  '/icons/space-shooter.png',
  '/icons/stick-hero.png',
  '/icons/whack-a-mole.png',
  '/manifest.json'
];

// Install: pre-cache all assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first, fallback to network
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Serve from cache, but also update cache in background
        event.waitUntil(
          fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_VERSION).then((cache) => {
                  cache.put(event.request, networkResponse);
                });
              }
            })
            .catch(() => { /* offline — ignore network failure */ })
        );
        return cachedResponse;
      }

      // Not in cache — try network, then cache the response
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_VERSION).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      });
    })
  );
});
