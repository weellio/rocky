/* ROCKY SAVES THE UNIVERSE — service worker.
 * three.js is VENDORED, not fetched, so this game works on a plane. */
const CACHE = 'rocky-v71';
const FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'icon.svg',
  'js/config.js',
  'js/acts/act0_workshop.js',
  'js/acts/act1_erid.js',
  'js/acts/act2_ship.js',
  'js/acts/act3_voyage.js',
  'js/acts/act6_home.js',
  'js/chapters.js',
  'js/model.js',
  'js/decode.js',
  'js/sim.js',
  'js/app.js',
  'js/audio.js',
  'js/analytics.js',
  'vendor/three.module.min.js',
  'vendor/three.core.min.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
      if (res && res.status === 200 && res.type === 'basic') {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match('index.html')))
  );
});
