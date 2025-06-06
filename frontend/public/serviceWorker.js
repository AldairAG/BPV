// Service Worker para La Burbuja Feliz
const CACHE_NAME = 'burbuja-feliz-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/logo.png',
  '/assets/react.svg'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caché abierta');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activación y limpieza de cachés antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptar solicitudes y servir desde caché si es posible
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Si la respuesta está en caché, la devolvemos
        if (response) {
          return response;
        }

        // Si no está en caché, intentamos hacer la solicitud a la red
        return fetch(event.request)
          .then((response) => {
            // Si la respuesta no es válida, simplemente la devolvemos
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Si la respuesta es válida, la clonamos para guardarla en caché
            let responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                // Solo guardamos en caché solicitudes GET
                if (event.request.method === 'GET') {
                  cache.put(event.request, responseToCache);
                }
              });

            return response;
          })
          .catch(() => {
            // Si hay un error al hacer la solicitud, devolvemos una página offline
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
            
            // Si es una imagen, devolvemos una imagen offline
            if (event.request.destination === 'image') {
              return caches.match('/offline-image.png');
            }
          });
      })
  );
});

// Escuchar mensajes del cliente (para sincronización)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYNC_REQUIRED') {
    console.log('Sincronización requerida');
    // Aquí podríamos implementar sincronización background
  }
});
