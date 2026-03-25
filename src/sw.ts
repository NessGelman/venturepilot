/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';

declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: any[] };

// Take control immediately on install/activate
self.addEventListener('install', () => (self as any).skipWaiting());
self.addEventListener('activate', (e: any) =>
  e.waitUntil((self as any).clients.claim())
);

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// Inject Cross-Origin Isolation headers into every response.
// This enables SharedArrayBuffer (required by WebLLM) on any host,
// including GitHub Pages which cannot set HTTP headers natively.
self.addEventListener('fetch', (event: FetchEvent) => {
  // Skip non-GET and chrome-extension requests
  if (
    event.request.method !== 'GET' ||
    event.request.url.startsWith('chrome-extension://')
  ) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Don't touch opaque/error responses (cross-origin no-cors)
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
