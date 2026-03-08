/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core';
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

declare let self: ServiceWorkerGlobalScope;

// Claim clients immediately
self.skipWaiting();
clientsClaim();

// Precache static assets
precacheAndRoute(self.__WB_MANIFEST);

// Background Sync for Tasks and Pomodoro POST requests
const bgSyncPlugin = new BackgroundSyncPlugin('studyPlannerQueue', {
  maxRetentionTime: 24 * 60, // Retry for max of 24 Hours (specified in minutes)
});

// Cache API GET requests for offline read access
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/') && url.pathname !== '/api/auth/login',
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      {
        cacheWillUpdate: async ({ response }) => {
          if (response && response.status === 200) {
            return response;
          }
           return null;
        }
      }
    ]
  }),
  'GET'
);

// Enable background sync for POST/PUT requests
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    plugins: [bgSyncPlugin]
  }),
  'POST'
);

registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    plugins: [bgSyncPlugin]
  }),
  'PUT'
);

// Push notifications listener
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? { title: 'Study Reminder', body: 'Time to review your subjects!' };
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/pwa-192x192.png',
      badge: '/mask-icon.svg',
    })
  );
});
