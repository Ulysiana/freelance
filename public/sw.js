const CACHE_NAME = 'creahub-shell-v2'
const APP_SHELL = ['/', '/offline', '/manifest.webmanifest', '/api/pwa-icon?size=192', '/api/pwa-icon?size=512']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone))
          return response
        })
        .catch(async () => (await caches.match(request)) || (await caches.match('/offline')) || (await caches.match('/')) || Response.error())
    )
    return
  }

  if (url.pathname.startsWith('/_next/static/') || url.pathname === '/manifest.webmanifest' || url.pathname === '/offline' || url.pathname === '/api/pwa-icon') {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone))
          return response
        })
      })
    )
  }
})
