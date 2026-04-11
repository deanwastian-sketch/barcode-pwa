// Ime cache-a z verzijo
const CACHE_NAME = "barcode-pwa-v2";

// Datoteke, ki jih želimo cache-ati
const urlsToCache = [
  "index.html",
  "app.js",
  "quagga.min.js",
  "manifest.json",
  "icon.png"
];

// Ob namestitvi: cache-amo vse datoteke
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting(); // prisili takojšnjo aktivacijo
});

// Ob aktivaciji: odstrani stare cache-e
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim(); // takoj prevzame kontrolu nad stranjo
});

// Fetch: vedno poskuša naložiti najnovejše datoteke
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return fetch(event.request)
        .then(response => {
          // osveži cache s svežo datoteko
          if(event.request.method === "GET") {
            cache.put(event.request, response.clone());
          }
          return response;
        })
        .catch(() => {
          // če ni interneta, vzame iz cache-a
          return cache.match(event.request);
        });
    })
  );
});
