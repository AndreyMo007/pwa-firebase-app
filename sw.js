const CACHE_NAME = 'mas-v6';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Пропускаем запросы к Firebase и API
  if (event.request.url.includes('firestore') || 
      event.request.url.includes('googleapis') || 
      event.request.url.includes('emailjs') ||
      event.request.url.includes('gstatic') ||
      event.request.url.includes('identitytoolkit')) {
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
