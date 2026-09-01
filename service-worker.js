const CACHE_NAME = "vibecoding-deck-v4.2.3";
const APP_SHELL = [
  "./",
  "index.html",
  "wissen.html",
  "mediathek.html",
  "style.css?v=4.2.3",
  "app.js?v=4.2.3",
  "wissen.js?v=4.2.3",
  "mediathek.js?v=4.2.3",
  "manifest.json?v=4.2.3",
  "images/hero-workshop.png",
  "images/bild-der-woche-story.png",
  "images/bild-der-woche-story-tobias.png",
  "images/gbs-logo-lime.jpg",
  "images/gbs-logo-black.png",
  "images/platform-01-tagesprogramm.png",
  "images/platform-02-editor.png",
  "images/platform-03-hausaufgaben-editor.png",
  "images/platform-03-hausaufgaben-ansicht.png",
  "images/platform-04-qr-upload.png",
  "images/platform-05-webapp-home.jpeg",
  "images/platform-05-webapp-view.jpeg",
  "images/platform-06-praxisauftraege.png",
  "images/vibecoding-info-qr.svg?v=4.2.3",
  "images/videos/vibecoding-cursor.jpg",
  "images/videos/vibecoding-erste-app.jpg",
  "images/videos/github-anfaenger.jpg",
  "images/videos/github-pages.jpg",
  "icons/icon-192.svg",
  "icons/icon-180.png",
  "icons/icon-192.png",
  "icons/icon-512.svg",
  "icons/icon-512.png",
  "icons/icon-maskable.svg",
  "icons/icon-maskable.png"
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
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      }).catch(() => {
        const path = new URL(event.request.url).pathname;
        const fallback = path.endsWith("/mediathek.html") ? "mediathek.html" : path.endsWith("/wissen.html") ? "wissen.html" : "index.html";
        return caches.match(event.request).then((cached) => cached || caches.match(fallback));
      })
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      if (response && response.ok && new URL(event.request.url).origin === location.origin) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      }
      return response;
    }).catch(() => Response.error()))
  );
});
