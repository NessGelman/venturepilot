self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', async () => {
  const cacheKeys = await caches.keys();
  await Promise.all(cacheKeys.map(k => caches.delete(k)));
  await self.registration.unregister();
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach(c => c.navigate(c.url));
});
