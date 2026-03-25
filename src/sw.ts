/// <reference lib="webworker" />

// Required placeholder for injectManifest strategy (not used for caching)
declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: any[] };
void self.__WB_MANIFEST;

// Take control immediately — no caching, just header injection
self.addEventListener('install', () => (self as any).skipWaiting());
self.addEventListener('activate', (e: any) =>
  e.waitUntil(
    // Wipe ALL caches on every activation so stale assets never block updates
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => (self as any).clients.claim())
  )
);

// Inject Cross-Origin Isolation headers into every response.
// This enables SharedArrayBuffer (required by WebLLM) on GitHub Pages
// which cannot set these HTTP headers natively.
self.addEventListener('fetch', (event: FetchEvent) => {
  if (
    event.request.method !== 'GET' ||
    event.request.url.startsWith('chrome-extension://')
  ) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (!response || response.type === 'opaque' || response.status === 0) {
          return response;
        }
        const headers = new Headers(response.headers);
        headers.set('Cross-Origin-Opener-Policy', 'same-origin');
        headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
        headers.set('Cross-Origin-Resource-Policy', 'cross-origin');
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      })
      .catch(() => fetch(event.request))
  );
});
