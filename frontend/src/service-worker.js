/* eslint-disable no-restricted-globals */
import { clientsClaim } from 'workbox-core';
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';

clientsClaim();
// Only versioned app assets are cached. API responses and account data stay on the network.
const assets = self.__WB_MANIFEST;
const shellRevision = assets.find(asset => asset.url.endsWith('index.html'))?.revision || null;
precacheAndRoute([...assets, ...[
  '/favicon.svg', '/icons/app-192.png', '/icons/app-512.png', '/icons/app-maskable-512.png',
  '/apple-touch-icon.png', '/manifest.webmanifest', '/Globe.lottie', '/GlobeAnimation.lottie', '/tree.lottie',
].map(url => ({ url: `${process.env.PUBLIC_URL || ''}${url}`, revision: shellRevision }))]);
cleanupOutdatedCaches();
registerRoute(new NavigationRoute(createHandlerBoundToURL(`${process.env.PUBLIC_URL || ''}/index.html`), {
  denylist: [/\/api\//, /\.[a-z0-9]+$/i],
}));
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
