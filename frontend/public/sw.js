/* QuickBizs Progressive Web App Service Worker */
const CACHE_NAME = "quickbizs-pwa-v2";
const STATIC_ASSETS = [
  "/manifest.json",
  "/favicon.jpg",
  "/pwa-icon.svg",
  "/pwa-192.png",
  "/pwa-512.png"
];

// 1. Install event: Cache essential assets & force activation
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("[PWA SW] Pre-caching warning:", err);
      });
    })
  );
  self.skipWaiting();
});

// 2. Activate event: Clean up previous version caches & claim all open client tabs
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[PWA SW] Purging obsolete cache:", key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch event
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Skip non-GET requests or browser extension URLs
  if (request.method !== "GET" || !request.url.startsWith("http")) {
    return;
  }

  const url = new URL(request.url);

  // Network-First for dynamic API calls
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match(request);
      })
    );
    return;
  }

  // Network-First for HTML navigation (ensures browsers ALWAYS load latest deployed build on Render)
  if (request.mode === "navigate" || request.destination === "document") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(() => {
          // Offline fallback
          return caches.match(request) || caches.match("/");
        })
    );
    return;
  }

  // Stale-while-revalidate for hashed static assets
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        return cachedResponse;
      });

      return cachedResponse || fetchPromise;
    })
  );
});
