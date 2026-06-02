/* Mandala Color Tap - service worker
   Bump CACHE on every release so updates roll out automatically. */
const CACHE = 'mandala-v1.9.0';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './music.mp3', './b/B1.png', './b/B1.thumb.png', './b/B2.png', './b/B2.thumb.png', './b/B3.png', './b/B3.thumb.png', './b/B4.png', './b/B4.thumb.png', './b/B5.png', './b/B5.thumb.png', './b/B6.png', './b/B6.thumb.png', './b/B7.png', './b/B7.thumb.png', './b/B8.png', './b/B8.thumb.png', './b/B9.png', './b/B9.thumb.png', './b/B10.png', './b/B10.thumb.png'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).catch(() => {}));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const isDoc = req.mode === 'navigate' || req.destination === 'document';
  if (isDoc) {
    // Network-first for the page: always get the newest version when online,
    // fall back to the cached copy when offline. (No reinstall needed for updates.)
    e.respondWith(
      fetch(req)
        .then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put('./index.html', copy)); return res; })
        .catch(() => caches.match('./index.html').then((r) => r || caches.match('./')))
    );
    return;
  }
  // Cache-first for everything else (icons, manifest).
  e.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      if (res && res.status === 200) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }))
  );
});
