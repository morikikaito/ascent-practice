/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ASCENT PRACTICE — SERVICE WORKER
   オフライン対応 + キャッシュ戦略
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const CACHE_NAME = 'ascent-practice-v5';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/trial.html',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Noto+Serif+JP:wght@300;400;500;700&display=swap'
];

// ━━━ INSTALL ━━━
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// ━━━ ACTIVATE ━━━
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ━━━ FETCH — Network First, Cache Fallback ━━━
self.addEventListener('fetch', event => {
  const request = event.request;

  // POST等は無視
  if (request.method !== 'GET') return;

  // Google Fonts: Cache First（変更頻度が低い）
  if (request.url.includes('fonts.googleapis.com') || request.url.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return response;
        });
      })
    );
    return;
  }

  // その他: Network First → Cache Fallback
  event.respondWith(
    fetch(request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        return response;
      })
      .catch(() => caches.match(request).then(cached => {
        if (cached) return cached;
        // オフラインでキャッシュもない場合、メインページを返す
        if (request.mode === 'navigate') {
          return caches.match('/');
        }
      }))
  );
});
