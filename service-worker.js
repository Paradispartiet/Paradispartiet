/* Paradispartiet: kontrollert hurtiglagring for GitHub Pages.
   Versjoneres sammen med svart/gult designforslag. */
const CACHE_VERSION = "2026-10-design2";
const STATIC_CACHE = "paradispartiet-static-" + CACHE_VERSION;
const ASSET_CACHE = "paradispartiet-assets-" + CACHE_VERSION;
const PREFIX = "paradispartiet-";

/* Bruk prosjektets faktiske Pages-undermappe, ikke serverroten. */
const BASE = self.registration.scope;
const STATIC_FILES = [
  "./",
  "index.html",
  "styles.css",
  "theme.css",
  "script.js",
  "assets/logo.svg"
].map(file => new URL(file, BASE).toString());

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_FILES))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys
        .filter(key => key.startsWith(PREFIX) && key !== STATIC_CACHE && key !== ASSET_CACHE)
        .map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const base = new URL(BASE);

  /* Ikke bland Paradispartiets cache med andre prosjekter på samme domene. */
  if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) return;

  /* HTML/CSS/JS: nett først, slik at design og innhold ikke blir hengende igjen. */
  if (["document", "style", "script"].includes(request.destination)) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            event.waitUntil(
              caches.open(STATIC_CACHE).then(cache => cache.put(request, copy))
            );
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  /* Lokale bilder: cache først, oppdater ved første innlasting. */
  if (request.destination === "image") {
    event.respondWith(
      caches.match(request).then(cached => cached || fetch(request).then(response => {
        if (!response.ok) return response;
        const copy = response.clone();
        event.waitUntil(
          caches.open(ASSET_CACHE).then(cache => cache.put(request, copy))
        );
        return response;
      }))
    );
  }
});
