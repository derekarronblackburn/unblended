/* Unblended service worker.
   Cache-first for the shell so the app opens with no network at all. There is
   nothing to sync: every entry lives in localStorage on the device. Bump CACHE
   on any shell change, or the old files keep being served. */

const CACHE = 'unblended-v13';
const SHELL = [
  './',
  'index.html',
  'privacy.html',
  'styles.css',
  'app.js',
  'icon.svg',
  'icon-192.png',
  'apple-touch-icon.png',
  'manifest.webmanifest',
  'fonts/newsreader-latin.woff2',
  'fonts/newsreader-latin-italic.woff2'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      // Only cache same-origin successes; there are no third parties here anyway.
      if (res.ok && new URL(e.request.url).origin === location.origin) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match('index.html')))
  );
});
