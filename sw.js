const CACHE_NAME = 'soop-live-v1';
const STATIC_ASSETS = [
  '/soop-live-player/',
  '/soop-live-player/index.html',
  '/soop-live-player/manifest.json',
  '/soop-live-player/assets/icon-192.png',
  '/soop-live-player/assets/icon-512.png',
  '/soop-live-player/assets/profile_bj.jpg',
  '/soop-live-player/assets/ad_thumb.jpg',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // 동영상은 캐싱 제외 (용량 과다)
  if (e.request.url.includes('.mp4')) return;

  e.respondWith(
    caches.match(e.request).then((cached) => {
      return cached || fetch(e.request).then((res) => {
        if (!res || res.status !== 200 || res.type === 'opaque') return res;
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        return res;
      });
    })
  );
});
