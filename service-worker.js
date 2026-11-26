const CACHE = 'aguiaoficial-v1';
const ARQUIVOS = ['/', '/manifest.json', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARQUIVOS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((chaves) =>
      Promise.all(chaves.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // Não mexe em nada de outros domínios (iframe, anúncios etc.)
  if (url.origin !== location.origin) return;

  // Páginas: tenta a rede primeiro, usa o cache se estiver offline
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).catch(() => caches.match(req).then((r) => r || caches.match('/')))
    );
    return;
  }

  // Demais arquivos do próprio site: cache primeiro
  e.respondWith(caches.match(req).then((r) => r || fetch(req)));
});
