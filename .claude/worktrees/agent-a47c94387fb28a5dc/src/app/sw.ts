import { defaultCache } from '@serwist/next/worker'
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist'
import { Serwist } from 'serwist'

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: ServiceWorkerGlobalScope

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: ({ url }) =>
        url.hostname === 'm.media-amazon.com' ||
        url.hostname === 'covers.openlibrary.org' ||
        url.hostname === 'image.tmdb.org',
      handler: 'CacheFirst',
      options: {
        cacheName: 'poster-images',
        expiration: {
          maxEntries: 500,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        url: '/~offline',
        matcher({ request }) {
          return request.destination === 'document'
        },
      },
    ],
  },
})

serwist.addEventListeners()

// --- Background Sync (PWA-04) ---------------------------------------------
// Tag matches BG_SYNC_TAG in src/components/layout/SyncEngineMount.tsx. When
// the browser fires this sync event (Chromium only), we relay to all open
// clients via postMessage — they call replaySyncQueue with the live db handle.
// We CANNOT call Dexie or Server Actions directly from the SW: Dexie expects
// a window context and Server Actions require the Next.js runtime.
self.addEventListener('sync', (event: Event) => {
  const syncEvent = event as Event & { tag?: string; waitUntil: (p: Promise<unknown>) => void }
  if (syncEvent.tag !== 'sync-library-queue') return
  syncEvent.waitUntil(
    (async () => {
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      for (const client of clients) {
        client.postMessage({ type: 'replay-sync-queue' })
      }
    })(),
  )
})
