const CACHE_NAME = 'soop-live-v3';
const STATIC_ASSETS = [
  './home.html',
  './live.html',
  './manifest.json',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/profile_bj.jpg',
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

  // 네트워크 우선 — 새 파일이 항상 먼저 반영되고, 오프라인일 때만 캐시로 대체
  e.respondWith(
    fetch(e.request).then((res) => {
      if (res && res.status === 200 && res.type !== 'opaque') {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
      }
      return res;
    }).catch(() => caches.match(e.request))
  );
});
