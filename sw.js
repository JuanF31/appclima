const CACHE_STATIC_NAME = "v1-cache-static-clima-app";
const CACHE_DYNAMIC_NAME = "v1-cache-dynamic-clima-app";
const CACHE_INMUTABLE_NAME = "v1-cache-inmutable-clima-app";


self.addEventListener('install', e => {
    const cacheProm = caches.open(CACHE_STATIC_NAME)
        .then(cache => {
            return cache.addAll([
                './',
                './index.html',
                './css/style.css',
                './icons/clear.svg',
                './js/app.js'
            ]);
        });
    const cacheInmutable = caches.open(CACHE_INMUTABLE_NAME)
        .then(cache => {
            return cache.addAll([
                'https://unpkg.com/boxicons@2.0.9/css/boxicons.min.css',
            ]);
        });
    e.waitUntil(Promise.all([cacheProm, cacheInmutable]));
});

self.addEventListener('fetch', e => {
    const respuesta = caches.match(e.request)
        .then(res => {
            if (res) return res;
            console.log('No existe', e.request.url);
            return fetch(e.request).then(newResp => {
                caches.open(CACHE_DYNAMIC_NAME)
                    .then(cache => {
                        cache.put(e.request, newResp)
                    });
                return newResp.clone();
            });
        });
    e.respondWith(respuesta);
})

self.addEventListener('activate', e => {
    const cacheWhitelist = [CACHE_DYNAMIC_NAME]

    e.waitUntil(
        caches.keys()
        .then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    //Eliminamos lo que ya no se necesita en cache
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName)
                    }
                })
            )
        })
        // Le indica al SW activar el cache actual
        .then(() => self.clients.claim())
    )
})