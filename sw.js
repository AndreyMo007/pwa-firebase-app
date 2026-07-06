const CACHE_NAME = 'mas-v5';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// НЕ кэшируем Firebase и API запросы
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  
  // Пропускаем Firebase, EmailJS и другие API
  if (url.includes('firestore') || 
      url.includes('googleapis') || 
      url.includes('emailjs') ||
      url.includes('gstatic') ||
      url.includes('firebase') ||
      url.includes('identitytoolkit')) {
    return; // Не перехватываем — идёт напрямую в сеть
  }
  
  // Для остального — сеть сначала
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Кэшируем только успешные ответы
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
