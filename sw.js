// Service worker: rende l'app installabile e la apre anche senza rete
// (i dati arrivano da Google; senza rete si vedono le ultime attività salvate).
const VERSION = 'tasks-gtd-1.0.7';
const SHELL = [
  './', './index.html', './app.css', './app.js', './config.js', './manifest.webmanifest',
  './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png',
  './fonts/atkinson-400.woff2', './fonts/atkinson-700.woff2',
];

self.addEventListener('install', (e) => {
  // cache: 'reload' = scarica sempre dalla rete, mai dalla memoria temporanea del browser
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL.map((u) => new Request(u, { cache: 'reload' })))));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('message', (e) => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return; // Google: sempre dalla rete
  // Pagine: prima la rete (per avere sempre l'ultima versione), poi la copia salvata
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request.url, { cache: 'no-cache', credentials: 'same-origin' }).catch(() => caches.match('./index.html')));
    return;
  }
  // File dell'app: copia salvata, aggiornata in background
  e.respondWith(caches.match(e.request).then((hit) => {
    const net = fetch(e.request, { cache: 'no-cache' }).then((res) => {
      if (res.ok) caches.open(VERSION).then((c) => c.put(e.request, res.clone()));
      return res;
    }).catch(() => hit);
    return hit || net;
  }));
});
