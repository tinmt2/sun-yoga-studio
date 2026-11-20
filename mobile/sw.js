const CACHE_NAME = 'sun-yoga-pwa-v37';
const ASSETS_TO_CACHE = [
  './',
  './styles.css',
  './icons.js',
  './zen-canvas.js',
  './app.js',
  './manifest.json',
  './icons/apple-touch-icon.png',
  './icons/icon-192.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        ASSETS_TO_CACHE.map((url) =>
          fetch(new Request(url, { cache: 'reload' }))
            .then((res) => {
              if (res && res.ok) return cache.put(url, res);
            })
            .catch(() => {})
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Network-first (bypassing stale HTTP disk cache for core app shell), falling back to cache offline
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || !req.url.startsWith('http')) return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const isNavigation = req.mode === 'navigate';
  const isCoreAsset =
    isNavigation ||
    /\.(html|css|js|json)$/i.test(url.pathname) ||
    url.pathname === '/';

  const networkRequest = isCoreAsset
    ? new Request(req, { cache: 'no-cache' })
    : req;

  event.respondWith(
    fetch(networkRequest)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, responseToCache).catch(() => {});
          }).catch(() => {});
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(req, { ignoreSearch: true }).then((cached) => {
          if (cached) return cached;
          if (isNavigation) return caches.match('./');
          return Response.error();
        });
      })
  );
});

// Push notification event listener
self.addEventListener('push', (event) => {
  let data = { title: 'Sun Yoga — Nhắc học phí', body: 'Có học viên sắp đến hạn đóng học phí!' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: './icons/icon-192.png',
    badge: './icons/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow('./');
    })
  );
});
