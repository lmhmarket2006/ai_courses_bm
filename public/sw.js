/* Minimal service worker — يفعّل معيار PWA للتثبيت دون كاش عدواني */
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
