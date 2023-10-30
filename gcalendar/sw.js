// Installing Service Worker
self.addEventListener('install', function(e) {
  console.log('[Service Worker] Install');
});

// Fetching content using Service Worker
self.addEventListener('fetch', function(e) {
  //  console.log('[Service Worker] Caching new resource: '+e.request.url);
});
