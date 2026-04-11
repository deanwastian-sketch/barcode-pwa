// Ime cache-a
const CACHE_NAME = "barcode-pwa-v37";

// Datoteke, ki jih želimo cache-ati
const urlsToCache = [
  "index.html",
  "app.js",
  "quagga.min.js",
  "manifest.json",
  "icon.png"
];

// Namestitev SW: cache-amo osnovne datoteke
self.addEventListener("install", event => {
  self.skipWaiting(); // takoj aktivira SW
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Aktivacija SW: odstrani stare cache-e
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim(); // takoj prevzame kontrolu nad stranjo
});

// Fetch: vedno poskuša naložiti najnovejšo verzijo iz mreže
self.addEventListener("fetch", event => {
  if(event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // osveži cache s svežo datoteko
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
      .catch(() => {
        // če ni interneta, vzame iz cache-a
        return caches.match(event.request);
      })
  );
});
