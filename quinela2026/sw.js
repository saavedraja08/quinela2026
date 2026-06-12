const CACHE = 'quinela2026-v1.0.6';
const STATIC = [
  'manifest.json',
  'icon-192.png',
  'icon-512.png'
];

// Instalar — solo cachear recursos estáticos (NO el index.html)
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(STATIC))
  );
  self.skipWaiting();
});

// Activar — limpiar caches viejos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — index.html siempre desde red, resto desde cache
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('firebaseapp') ||
      e.request.url.includes('googleapis') ||
      e.request.url.includes('gstatic')) return;

  // index.html: siempre red primero
  if (e.request.url.includes('index.html') || e.request.url.endsWith('/')) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }

  // Resto: cache primero, red como fallback
  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).then(res => {
        caches.open(CACHE).then(cache => cache.put(e.request, res.clone()));
        return res;
      });
    })
  );
});
