const CACHE_NAME = "vibecoding-deck-v2.0.0";
const APP_SHELL = [
  "./",
  "index.html",
  "wissen.html",
  "style.css",
  "app.js",
  "wissen.js",
  "qrcode.min.js",
  "manifest.json",
  "images/hero-workshop.png",
  "icons/icon-192.svg",
  "icons/icon-512.svg",
  "icons/icon-maskable.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      if (response && response.ok && new URL(event.request.url).origin === location.origin) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      }
      return response;
    }).catch(() => {
      if (event.request.mode !== "navigate") return Response.error();
      const fallback = new URL(event.request.url).pathname.endsWith("/wissen.html") ? "wissen.html" : "index.html";
      return caches.match(fallback);
    }))
  );
});
