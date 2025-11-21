// Service Worker für PWA Installation
const CACHE_NAME = 'stickbee-calc-v2';
// Liste der Dateien, die im Browser-Cache gespeichert werden sollen,
// um die App offline verfügbar zu machen.
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// Event: 'install'
// Wird ausgelöst, wenn der Service Worker zum ersten Mal installiert wird.
self.addEventListener('install', (event) => {
  // Stellt sicher, dass der neue Service Worker sofort aktiviert wird und nicht auf das Schließen 
  // aller Tabs warten muss, die die alte Version nutzen.
  self.skipWaiting(); 
  
  event.waitUntil(
    // Öffnet den Cache mit dem definierten Namen
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache geöffnet und alle Ressourcen hinzugefügt');
        // Speichert alle definierten URLs im Cache
        return cache.addAll(urlsToCache);
      })
  );
});

// Event: 'activate'
// Wird ausgelöst, nachdem der Service Worker erfolgreich installiert wurde.
self.addEventListener('activate', (event) => {
  // Übernimmt sofort die Kontrolle über alle Seiten im Scope des Service Workers.
  event.waitUntil(self.clients.claim());
  
  // Löscht alte Caches, um Speicherplatz freizugeben und Konsistenz zu gewährleisten.
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Alten Cache löschen:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Event: 'fetch'
// Wird für jede Netzwerkanforderung der Seite ausgelöst.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    // Zuerst versuchen wir, die Ressource aus dem Cache abzurufen.
    caches.match(event.request)
      .then((response) => {
        // Wenn die Ressource im Cache gefunden wird, wird sie zurückgegeben.
        if (response) {
          return response;
        }
        
        // Wenn nicht im Cache, wird die Netzwerkanforderung durchgeführt.
        return fetch(event.request)
          .then((networkResponse) => {
            // Wir speichern die neue Antwort (falls erfolgreich), um sie später zu verwenden (Cache-Strategie: Cache-First).
            // WICHTIG: Man sollte keine nicht-GET-Anfragen cachen.
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          })
          .catch((error) => {
             // Optional: Fallback-Verhalten, wenn die Netzwerkanfrage fehlschlägt.
             console.error('Fetch fehlgeschlagen oder keine Cache-Übereinstimmung:', error);
          });
      })
  );
});
