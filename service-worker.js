/* GitHub Pages: only cache Paradispartiet's own essential shell files.
 * Illustrations are individually authored and must not linger in a second,
 * potentially stale service-worker image cache after new releases.
 */
const CACHE_NAME = "paradispartiet-v3-illustrasjoner-20261120";
const CACHE_PREFIX = "paradispartiet-";
const CORE = [
  "./", "./index.html", "./styles.css", "./script.js",
  "./assets/logo.svg", "./assets/logo-full.svg", "./assets/favicon.svg"
];
const SCOPE = new URL(self.registration.scope);

function belongsToSite(url) {
  return url.origin === SCOPE.origin && url.pathname.startsWith(SCOPE.pathname);
}

function shouldCache(url) {
  if (url.pathname.endsWith("/")) return true;
  return /\.(?:html|css|js|svg)$/i.test(url.pathname)
    && !url.pathname.includes("/assets/illustrasjoner/");
}

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll(CORE.map(path => new Request(path, { cache: "reload" })))
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
        .map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (!belongsToSite(url)) return;
  // Let the browser's normal HTTP cache handle WEBP and other media, without
  // keeping old versions in the service worker's separate long-lived cache.
  if (!shouldCache(url)) return;
  event.respondWith(
    fetch(request).then(response => {
      if (response.ok) {
        const copy = response.clone();
        event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(request, copy)));
      }
      return response;
    }).catch(() => caches.match(request))
  );
});
