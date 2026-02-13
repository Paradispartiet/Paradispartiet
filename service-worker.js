/* =========================================
   PARADISPARTIET – SERVICE WORKER
   Stabil utvikling + trygg produksjon
   ========================================= */

const CACHE_VERSION = "v1.1.102";
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const ASSET_CACHE = `assets-${CACHE_VERSION}`;

const STATIC_FILES = [
  "/",
  "/index.html",
  "/styles.css",
  "/script.js"
];

/* ================================
   INSTALL
   ================================ */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      return cache.addAll(STATIC_FILES);
    })
  );
  self.skipWaiting();
});

/* ================================
   ACTIVATE
   ================================ */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => ![STATIC_CACHE, ASSET_CACHE].includes(key))
          .map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

/* ================================
   FETCH STRATEGY
   ================================ */
self.addEventListener("fetch", event => {
  const req = event.request;
  const url = new URL(req.url);

  // HTML og JS = alltid nett først
  if (
    req.destination === "document" ||
    req.destination === "script"
  ) {
    event.respondWith(
      fetch(req)
        .then(res => {
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // CSS og bilder = cache først
  if (
    req.destination === "style" ||
    req.destination === "image"
  ) {
    event.respondWith(
      caches.match(req).then(cached => {
        if (cached) return cached;

        return fetch(req).then(res => {
          return caches.open(ASSET_CACHE).then(cache => {
            cache.put(req, res.clone());
            return res;
          });
        });
      })
    );
    return;
  }

  // Alt annet = bare nett
  event.respondWith(fetch(req));
});
