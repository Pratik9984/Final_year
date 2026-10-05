/**
 * MahaGov-Pulse Service Worker (Offline Resilience & PWA Support)
 * Enables offline certificate verification during intermittent rural connectivity.
 */

const CACHE_NAME = "mahagov-pulse-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/styles.css",
  "/app.js",
  "/manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[MahaGov-Pulse SW] Pre-caching offline sovereign assets");
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) {
            return caches.delete(k);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  // Pass-through for API calls, network first with cache fallback for static
  if (event.request.url.includes("/api/v1/")) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({
            status: "OFFLINE_MODE",
            message: "Offline Mode: Active network connection unavailable. Cached sovereign public keys in use."
          }),
          { headers: { "Content-Type": "application/json" } }
        );
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const resClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        }
        return networkResponse;
      });
    }).catch(() => caches.match("/"))
  );
});
