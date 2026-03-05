// Orvya Service Worker v1
var CACHE_NAME = 'orvya-v2';
var STATIC_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/img/icon-192.png',
  '/img/icon-512.png',
  '/img/logo-nav.png',
  '/audio/beep.mp3'
];

// Install: cache static assets
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(name) { return name !== CACHE_NAME; })
             .map(function(name) { return caches.delete(name); })
      );
    })
  );
  self.clients.claim();
});

// Fetch: network first, fallback to cache
self.addEventListener('fetch', function(event) {
  // Skip non-GET and API calls
  if (event.request.method !== 'GET') return;
  if (event.request.url.indexOf('service2.funifier.com') !== -1) return;
  if (event.request.url.indexOf('api.openai.com') !== -1) return;

  event.respondWith(
    fetch(event.request).then(function(response) {
      // Cache successful responses
      if (response.status === 200) {
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, clone);
        });
      }
      return response;
    }).catch(function() {
      return caches.match(event.request);
    })
  );
});

// Push notification handler
self.addEventListener('push', function(event) {
  var data = {};
  try { data = event.data ? event.data.json() : {}; } catch(e) {}
  var title = data.title || 'Orvya';
  var options = {
    body: data.body || '',
    icon: '/img/icon-192.png',
    badge: '/img/icon-192.png',
    tag: data.tag || 'orvya-push',
    vibrate: [200, 100, 200],
    actions: data.actions || [],
    data: { url: data.url || '/' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click handler
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  var url = (event.notification.data && event.notification.data.url) || '/';

  // Handle action clicks
  if (event.action === 'open') {
    url = event.notification.data.url || '/';
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // Focus existing window if available
      for (var i = 0; i < clientList.length; i++) {
        if (clientList[i].url.indexOf('fitness-funifier.netlify.app') !== -1 ||
            clientList[i].url.indexOf('orvya.app') !== -1 ||
            clientList[i].url.indexOf('localhost') !== -1) {
          clientList[i].focus();
          return clientList[i].navigate(url);
        }
      }
      return clients.openWindow(url);
    })
  );
});
