const CACHE_NAME = "stickbee-pwa-v1";
const APP_SHELL = [
  "/Druck.Kalkulator/",
  "/Druck.Kalkulator/index.html",
  "/Druck.Kalkulator/manifest.json",
  "/Druck.Kalkulator/icons/icon-192.png",
  "/Druck.Kalkulator/icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
