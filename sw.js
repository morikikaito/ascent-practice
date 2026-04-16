// Service Worker は廃止。既存登録を即時解除するのみ。
self.addEventListener('install', function() { self.skipWaiting(); });
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(ks) {
      return Promise.all(ks.map(function(k) { return caches.delete(k); }));
    }).then(function() {
      return self.registration.unregister();
    })
  );
});
self.addEventListener('fetch', function() {});
