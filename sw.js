// Ein minimaler Service Worker, damit die App installierbar wird
self.addEventListener('install', (e) => {
  console.log('Service Worker: Installiert');
  self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  // Einfach alles durchlassen (Network first)
  // Hier könnte man Caching einbauen, aber für die Installierbarkeit reicht das.
  e.respondWith(fetch(e.request));
});
