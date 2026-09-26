/* QuickBizs Progressive Web App Service Worker */
const CACHE_NAME = "quickbizs-pwa-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.jpg",
  "/pwa-icon.svg",
  "/pwa-192.png",
  "/pwa-512.png"
];

// 1. Install event: Cache critical shell assets & skip waiting
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

// 2. Activate event: Clean up previous version caches & claim clients
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch event: Stale-while-revalidate for assets, Network-first for APIs
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Skip non-GET requests or chrome-extension URLs
  if (request.method !== "GET" || !request.url.startsWith("http")) {
    return;
  }

  const url = new URL(request.url);

  // Network-first for dynamic API calls
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match(request);
      })
    );
    return;
  }

  // Stale-while-revalidate for static application assets
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
        // If both cache and network fail for HTML navigation, return cached root
        if (request.mode === "navigate") {
          return caches.match("/");
        }
      });

      return cachedResponse || fetchPromise;
    })
  );
});
