# Phase 6: PWA + Offline - Research

**Researched:** 2026-05-06
**Domain:** Progressive Web Apps, Service Workers, IndexedDB, Offline Sync
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Claude's discretion — pick the best fit for Next.js 14 App Router. Serwist (modern App Router-native fork of next-pwa, built on Workbox) is the recommended default, but Claude may choose differently if research reveals a better option.
- **D-02:** Conflict resolution is last-write-wins using timestamps. No conflict UI needed.
- **D-03:** Combination approach — subtle offline indicator in navbar/header (small badge or dot, not intrusive) while offline, plus a toast notification when sync completes after reconnect. No inline per-item badges.
- **D-04:** Full cache — app shell (JS/CSS/routes) + library data (synced to IndexedDB on install/update) + poster images (all cached, not just on-demand). Accept the storage tradeoff for full offline fidelity.

### Claude's Discretion

- Exact service worker library (D-01 — Serwist recommended)
- IndexedDB abstraction layer (raw API, Dexie.js, or idb wrapper)
- Storage quota handling if poster cache exceeds device limits
- Background sync API vs. online event listener for reconnect detection
- Visual design of the offline nav indicator (within cinematic dark theme)
- Toast copy for sync completion message

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PWA-01 | App is installable as a PWA on mobile and desktop | Serwist + manifest.json + layout metadata |
| PWA-02 | User can browse their library while offline | IndexedDB (Dexie) seeded on install + SW precache |
| PWA-03 | User can update item status and ratings while offline | Offline write queue stored in IndexedDB |
| PWA-04 | Changes made offline sync automatically when connection is restored | online event + Background Sync API fallback |
</phase_requirements>

---

## Summary

Phase 6 adds PWA installability and full offline read/write to a Next.js 14 App Router application backed by Supabase. The three-plan breakdown maps cleanly: Plan 06-01 installs Serwist, creates the manifest, and establishes asset caching; Plan 06-02 introduces an IndexedDB layer (via Dexie.js) that mirrors the Supabase library schema; Plan 06-03 wires the sync engine that replays queued offline writes through existing Server Actions on reconnect.

The most important architectural decision is treating IndexedDB as the single source of truth for reads when offline and as a write-ahead queue for mutations. This lets the existing Server Actions pattern remain untouched — the offline layer intercepts at the fetch/action call site, not inside Server Action files themselves.

Serwist is the correct choice for this stack. It is App Router-native, actively maintained, and referenced directly in the Next.js official PWA guide. Dexie.js is the correct IndexedDB abstraction — it provides TypeScript-first table definitions, a query API that mirrors the Supabase client's ergonomics, and no deprecated sync add-ons (dexie-syncable is deprecated; manual queue implementation is the right path).

**Primary recommendation:** Install Serwist for service worker + precaching; use Dexie.js for IndexedDB; implement a manual sync queue with `window.online` + Background Sync API dual-trigger; mount the offline indicator in both Sidebar and BottomNav components.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @serwist/next | 9.5.11 | Wraps next.config.mjs, compiles sw.ts, injects precache manifest | App Router-native, cited in Next.js official PWA guide, actively maintained fork of next-pwa |
| serwist (dev) | 9.5.11 | Service worker runtime (precaching, runtime caching, Workbox primitives) | Peer dep of @serwist/next; provides Serwist class and defaultCache |
| dexie | 4.4.2 | IndexedDB wrapper — schema, queries, transactions | TypeScript-first, Promise-based, no deprecated sync addons, widely used in offline-first Next.js apps |

[VERIFIED: npm registry — versions confirmed 2026-05-06]

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| sonner | already installed (^2.0.7) | Toast notifications for sync-complete feedback | Already in project — use for D-03 sync toast |
| lucide-react | already installed | WifiOff icon for offline indicator | Already in project |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Serwist | next-pwa (shadowwalker) | next-pwa is unmaintained as of 2023, no App Router support |
| Serwist | Manual Workbox | More boilerplate, no Next.js integration layer |
| Dexie.js | idb (jakearchibald) | idb is lower-level; Dexie has better TypeScript schema definition and a cleaner query API for this use case |
| Dexie.js | Raw IndexedDB API | Raw API requires significant boilerplate for versioning, transactions, and typed queries |

**Installation:**
```bash
npm install @serwist/next dexie
npm install -D serwist
```

---

## Architecture Patterns

### Recommended Project Structure

```
app/
├── sw.ts                        # Service worker entry point (compiled by Serwist)
├── manifest.json                # PWA manifest (App Router convention)
├── ~offline/
│   └── page.tsx                 # Offline fallback page (required by Serwist fallback config)
public/
├── icons/                       # PWA icons (192x192, 512x512, maskable)
│   └── ...
src/
├── lib/
│   ├── db/
│   │   ├── schema.ts            # Dexie database class + table definitions
│   │   ├── sync-queue.ts        # Offline write queue read/write helpers
│   │   └── seed.ts              # Seed IndexedDB from Supabase on install
│   └── sync/
│       ├── sync-engine.ts       # Replay queue → Server Actions on reconnect
│       └── use-sync-status.ts   # React hook: online state + sync status
├── components/
│   ├── layout/
│   │   ├── OfflineIndicator.tsx  # Small dot badge (mounts in Sidebar + BottomNav)
│   │   └── SyncToast.tsx         # Triggers sonner toast on sync complete
```

### Pattern 1: Dexie Schema Mirroring Supabase

Define the Dexie database to mirror the `library_items` Supabase table. The schema MUST include all fields needed for offline read (display) and offline write (status, rating) operations.

```typescript
// src/lib/db/schema.ts
// Source: Dexie.js official docs — https://dexie.org/docs/Tutorial/TypeScript
import Dexie, { type EntityTable } from 'dexie'

export interface LibraryItem {
  id: string
  user_id: string
  title: string
  media_type: 'movie' | 'book' | 'series'
  status: 'watchlist' | 'watching' | 'completed' | 'dropped'
  rating: number | null
  is_favorite: boolean
  poster_url: string | null
  // ... additional display fields
  updated_at: string  // ISO timestamp — used for last-write-wins
}

export interface SyncQueueEntry {
  id?: number           // auto-increment
  operation: 'update_status' | 'update_rating' | 'toggle_favorite' | 'delete'
  item_id: string
  payload: Record<string, unknown>
  queued_at: string     // ISO timestamp
  attempts: number
}

export class MediaTrackerDB extends Dexie {
  library_items!: EntityTable<LibraryItem, 'id'>
  sync_queue!: EntityTable<SyncQueueEntry, 'id'>

  constructor() {
    super('media-tracker-v3')
    this.version(1).stores({
      library_items: 'id, user_id, media_type, status, updated_at',
      sync_queue: '++id, item_id, queued_at',
    })
  }
}

export const db = new MediaTrackerDB()
```

### Pattern 2: Offline Write Queue

When a write operation is attempted and the device is offline, write the mutation to `sync_queue` and apply it optimistically to `library_items` in IndexedDB. On reconnect, replay the queue.

```typescript
// src/lib/db/sync-queue.ts
// Source: [ASSUMED] — pattern derived from offline-first architecture principles
import { db } from './schema'

export async function enqueueOfflineWrite(
  operation: SyncQueueEntry['operation'],
  item_id: string,
  payload: Record<string, unknown>
) {
  await db.sync_queue.add({
    operation,
    item_id,
    payload,
    queued_at: new Date().toISOString(),
    attempts: 0,
  })
  // Apply optimistically to local IndexedDB
  await db.library_items.update(item_id, payload)
}
```

### Pattern 3: Dual-Trigger Sync (online event + Background Sync API)

```typescript
// src/lib/sync/sync-engine.ts
// Source: MDN Background Sync + [ASSUMED] dual-trigger pattern
export async function registerBackgroundSync() {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    const reg = await navigator.serviceWorker.ready
    await reg.sync.register('sync-library-queue')
  }
}

// Fallback for browsers without Background Sync API (Firefox, Safari)
export function setupOnlineFallback(syncFn: () => Promise<void>) {
  window.addEventListener('online', () => {
    syncFn()
  })
}
```

Background Sync API fires even if the user closes the tab. The `online` event is a reliable fallback when the app is open. Both should be wired — Background Sync for Chromium, `online` event as universal fallback.

### Pattern 4: Serwist Configuration for Full Cache (D-04)

```typescript
// next.config.mjs — Source: serwist.pages.dev/docs/next/getting-started [CITED]
import withSerwistInit from '@serwist/next'

const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  // Disable in development to avoid cache confusion
  disable: process.env.NODE_ENV === 'development',
})

export default withSerwist({
  images: {
    remotePatterns: [ /* existing patterns */ ],
  },
})
```

```typescript
// app/sw.ts — Source: serwist.pages.dev/docs/next/getting-started [CITED]
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
  precacheEntries: self.__SW_MANIFEST,   // app shell auto-injected by @serwist/next
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Poster images: cache-first with storage limit
    {
      matcher: ({ url }) =>
        url.hostname === 'm.media-amazon.com' ||
        url.hostname === 'covers.openlibrary.org' ||
        url.hostname === 'image.tmdb.org',
      handler: 'CacheFirst',
      options: {
        cacheName: 'poster-images',
        expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 30 },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    ...defaultCache,
  ],
  fallbacks: {
    entries: [{ url: '/~offline', matcher({ request }) { return request.destination === 'document' } }],
  },
})

serwist.addEventListeners()
```

### Pattern 5: Offline Indicator Component

Mount in both `Sidebar` and `BottomNav`. Uses a single `useOnlineStatus` hook that listens to `navigator.onLine` + `online`/`offline` events.

```typescript
// src/components/layout/OfflineIndicator.tsx — [ASSUMED] pattern
'use client'
import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'

export function OfflineIndicator() {
  const [online, setOnline] = useState(true)

  useEffect(() => {
    setOnline(navigator.onLine)
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  if (online) return null
  return (
    <span className="flex items-center gap-1 text-xs text-amber-400">
      <WifiOff size={12} />
      Offline
    </span>
  )
}
```

### Anti-Patterns to Avoid

- **Do not use localStorage for the sync queue:** localStorage is synchronous and limited to 5MB. IndexedDB handles binary data, large payloads, and asynchronous access properly. [ASSUMED: general web platform knowledge]
- **Do not use `reloadOnOnline: true` (Serwist default can force page refresh):** Set `reloadOnOnline: false` in Serwist config to prevent forced page refreshes when users go from offline to online. [CITED: Serwist docs]
- **Do not cache Supabase API calls in the service worker's runtime cache:** Supabase JWT tokens are short-lived; caching auth-gated API responses in the SW cache causes stale/403 responses. Instead, read from IndexedDB when offline, never from SW-cached API responses.
- **Do not seed IndexedDB in a Server Component:** IndexedDB is browser-only; all Dexie code must be in `'use client'` components or client-side hooks.
- **Do not ship `public/sw.js` to git:** Serwist generates it at build time; add `public/sw*` and `public/swe-worker*` to `.gitignore`. [CITED: Serwist docs]

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Service worker precaching | Custom SW precache loop | Serwist `__SW_MANIFEST` injection | Cache invalidation, versioning, and update lifecycle are complex — SW cache without proper invalidation serves stale assets indefinitely |
| IndexedDB schema + queries | Raw `indexedDB.open()` / `IDBObjectStore` | Dexie.js | Raw IndexedDB is callback-based, verbose for versioning, and lacks TypeScript ergonomics |
| Image cache with expiry | Custom cache + eviction | Serwist `CacheFirst` with `expiration` options | Workbox expiration handles LRU eviction, max-age, and cross-tab cache cleanup automatically |
| Background sync retry logic | Custom retry loop | Background Sync API + Workbox Queue | Browsers handle retry timing, rate limiting, and offline detection more reliably than JS timers |

**Key insight:** The service worker cache lifecycle (install, activate, update) is extremely easy to get wrong — stale assets, infinite update loops, and cache poisoning are common. Serwist handles all of this correctly out of the box.

---

## Common Pitfalls

### Pitfall 1: Service Worker Not Updating After Code Changes

**What goes wrong:** Users get a stale service worker cached in the browser even after deploying new code. The new SW installs but waits for all tabs to close before activating.

**Why it happens:** SW update lifecycle — new SW installs but cannot activate while the old SW controls any open client.

**How to avoid:** Use `skipWaiting: true` and `clientsClaim: true` in the Serwist config (already in the pattern above). This forces immediate activation on update. Be aware that this means a page in the middle of a navigation may get a new SW mid-flight — acceptable for this app since it's data-driven, not a multi-step transaction.

**Warning signs:** Changes deployed but users still see old UI; `chrome://serviceworker-internals` shows "waiting" state.

### Pitfall 2: IndexedDB Not Available in SSR Context

**What goes wrong:** `TypeError: dexie is not defined` or `ReferenceError: indexedDB is not defined` when Next.js attempts to run Dexie code on the server during SSR.

**Why it happens:** IndexedDB is a browser API; Next.js runs component code on the server during SSR.

**How to avoid:** All Dexie imports and `db` usage must be inside `'use client'` components, `useEffect` hooks, or dynamic imports with `ssr: false`. Never import `db` at the module level in a Server Component.

**Warning signs:** Build errors or runtime errors on first page load; hydration mismatches.

### Pitfall 3: Serwist Caching Development Builds

**What goes wrong:** Development is broken — stale cached responses served, HMR doesn't work, changes require hard refresh.

**Why it happens:** Serwist installs a service worker that caches aggressively; development changes aren't invalidated.

**How to avoid:** Set `disable: process.env.NODE_ENV === 'development'` in `withSerwistInit`. Only enable for production builds or explicit PWA debugging sessions.

**Warning signs:** `npm run dev` shows stale content; console shows "Served from service worker cache."

### Pitfall 4: Sync Queue Replay Fails Silently

**What goes wrong:** User goes offline, makes changes, reconnects — changes are lost. No error shown.

**Why it happens:** Sync engine throws an error (e.g., Supabase 401 after token expiration) but the queue entry is marked as processed and deleted.

**How to avoid:** Track `attempts` on each queue entry. On failure, increment and retry up to a max (e.g., 3). After max attempts, show an error toast and leave the entry in the queue for manual user action. Do NOT delete failed entries silently.

**Warning signs:** `sync_queue` table accumulates entries that never clear; user reports "changes didn't save."

### Pitfall 5: Poster Cache Exceeds Storage Quota

**What goes wrong:** On devices with limited storage (especially iOS), the browser evicts the entire SW cache (including app shell) when the poster cache grows too large, breaking offline entirely.

**Why it happens:** Safari/iOS applies strict storage quotas and evicts entire origins under storage pressure.

**How to avoid:** Set `maxEntries: 500` on the poster cache (configurable) and use `CacheFirst` with expiration. Consider checking `navigator.storage.estimate()` before caching large images and skipping if quota is critically low.

**Warning signs:** App stops working offline on iOS; cache size in DevTools grows unbounded.

---

## Code Examples

### PWA Manifest (app/manifest.json)

```json
{
  "name": "Media Tracker",
  "short_name": "MediaTracker",
  "description": "Your entire media library, beautifully presented.",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ],
  "theme_color": "#0a0a0f",
  "background_color": "#0a0a0f",
  "start_url": "/",
  "display": "standalone",
  "orientation": "any"
}
```

### Root Layout Metadata Update (app/layout.tsx)

```typescript
// Source: Next.js official PWA guide — https://nextjs.org/docs/app/guides/progressive-web-apps [CITED]
export const metadata: Metadata = {
  title: "Media Tracker",
  description: "Your entire media library, beautifully presented.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Media Tracker",
  },
}
```

### Seeding IndexedDB on First Load

```typescript
// src/lib/db/seed.ts — [ASSUMED] pattern
'use client'
import { db } from './schema'
import { createClient } from '@/lib/supabase/client'

export async function seedLibraryFromSupabase(userId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('library_items')
    .select('*')
    .eq('user_id', userId)
  if (data) {
    await db.library_items.bulkPut(data)
  }
}
```

Call `seedLibraryFromSupabase` on app mount (when online) inside a `useEffect` in `Providers.tsx` or a dedicated `<DBProvider>` component.

### Last-Write-Wins Conflict Resolution (D-02)

```typescript
// src/lib/sync/sync-engine.ts — [ASSUMED] implementation
export async function replaySyncQueue() {
  const queue = await db.sync_queue.orderBy('queued_at').toArray()
  for (const entry of queue) {
    try {
      // Each operation calls the appropriate Server Action
      await dispatchOperation(entry)
      await db.sync_queue.delete(entry.id!)
    } catch (err) {
      await db.sync_queue.update(entry.id!, { attempts: entry.attempts + 1 })
    }
  }
}

// Conflict: compare timestamps — server wins if server.updated_at > local.updated_at
async function mergeAfterSync(serverItem: LibraryItem) {
  const local = await db.library_items.get(serverItem.id)
  if (!local || serverItem.updated_at > local.updated_at) {
    await db.library_items.put(serverItem)
  }
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| next-pwa (shadowwalker) | Serwist (@serwist/next) | 2023 | next-pwa unmaintained, no App Router support |
| dexie-syncable / dexie-observable | Manual sync queue + Dexie bulk ops | 2024 | dexie-syncable deprecated, incompatible with Dexie 4 |
| localStorage for offline data | IndexedDB via Dexie | — | Storage limits, sync API, binary data support |

**Deprecated/outdated:**
- `next-pwa` (shadowwalker): Last updated 2022, broken with Next.js 13+ App Router. Do not use.
- `dexie-syncable` / `dexie-observable`: Explicitly deprecated by Dexie team, not compatible with Dexie 4. Use manual sync queue pattern instead.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Offline write interception should occur at the call site (hook/action wrapper), not inside Server Action files | Architecture Patterns | If Server Actions can't be wrapped client-side, interception point moves to a client-side action relay layer — adds complexity |
| A2 | `seedLibraryFromSupabase` should be called from Providers.tsx on mount | Code Examples | If Providers.tsx doesn't have user context at mount time, seeding must move to a post-auth hook |
| A3 | Supabase `library_items` table column names match the Dexie schema field names exactly | Architecture Patterns | If column names differ (e.g., snake_case vs camelCase mismatch), the `bulkPut` in seed.ts needs a field mapper |
| A4 | Dual-trigger (online event + Background Sync API) is sufficient for sync reliability | Architecture Patterns | If Background Sync API fires at unexpected times, race conditions with in-flight Supabase writes are possible |

---

## Open Questions

1. **Exact Supabase `library_items` schema**
   - What we know: Phase 3 implemented library management with status, rating, is_favorite, poster_url fields
   - What's unclear: Exact column names, whether `updated_at` is present on all rows (required for D-02 last-write-wins)
   - Recommendation: Plan 06-02 Wave 0 should run `SELECT column_name FROM information_schema.columns WHERE table_name = 'library_items'` and confirm `updated_at` exists; if not, a migration adding it is a Wave 0 prerequisite

2. **Storage quota on iOS Safari**
   - What we know: iOS Safari applies strict per-origin storage limits (~50MB for PWA home screen install, more for Safari in-browser)
   - What's unclear: Actual poster image count in a typical user library — whether 500 cached posters stays within quota
   - Recommendation: Plan 06-01 should add `navigator.storage.estimate()` logging in dev to measure; set conservative `maxEntries` initially

3. **tsconfig.json `lib` array conflict**
   - What we know: Serwist requires `"webworker"` in the `lib` array and `"@serwist/next/typings"` in `types`
   - What's unclear: Whether adding `"webworker"` to the shared tsconfig.json causes type conflicts with existing React/DOM code
   - Recommendation: Create a separate `tsconfig.sw.json` that extends the base and adds webworker, used only for compiling `app/sw.ts`. This is documented in Serwist's advanced setup.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Serwist build step | ✓ | (project running) | — |
| @serwist/next | Service worker | Not installed | — | Install in Wave 0 |
| dexie | IndexedDB layer | Not installed | — | Install in Wave 0 |
| serwist (dev) | SW runtime | Not installed | — | Install in Wave 0 |
| PWA icons (192, 512) | manifest.json | Not present in public/ | — | Generate in Wave 0 |
| app/~offline/page.tsx | SW offline fallback | Does not exist | — | Create in Wave 0 |

**Missing dependencies with no fallback:**
- PWA icons must be created (can use a simple script or online generator — no blocking issue, just a Wave 0 task)
- `app/~offline/page.tsx` must be created before Serwist is configured

**Missing dependencies with fallback:**
- None that block execution given install steps in Wave 0

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Jest 30 + Testing Library |
| Config file | jest.config.ts (or jest.config.js — check project root) |
| Quick run command | `npm test -- --testPathPattern=pwa --passWithNoTests` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PWA-01 | manifest.json has required fields (name, icons, start_url, display) | unit | `npm test -- --testPathPattern=manifest` | ❌ Wave 0 |
| PWA-02 | Dexie read returns items when Supabase is unavailable | unit | `npm test -- --testPathPattern=db` | ❌ Wave 0 |
| PWA-03 | enqueueOfflineWrite writes to sync_queue + updates library_items | unit | `npm test -- --testPathPattern=sync-queue` | ❌ Wave 0 |
| PWA-04 | replaySyncQueue calls Server Action for each queued entry | unit | `npm test -- --testPathPattern=sync-engine` | ❌ Wave 0 |

Note: Service worker behavior (precaching, offline fallback page) is not unit-testable with Jest — manual smoke test via Chrome DevTools > Application > Service Workers is the gate for PWA-01/02 offline scenarios.

### Sampling Rate

- **Per task commit:** `npm test -- --testPathPattern=pwa --passWithNoTests`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `src/lib/db/__tests__/schema.test.ts` — covers PWA-02 (Dexie read)
- [ ] `src/lib/db/__tests__/sync-queue.test.ts` — covers PWA-03
- [ ] `src/lib/sync/__tests__/sync-engine.test.ts` — covers PWA-04
- [ ] `src/__tests__/manifest.test.ts` — covers PWA-01 (manifest field validation)
- [ ] IndexedDB mock: `npm install -D fake-indexeddb` — required for Jest tests involving Dexie

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes — offline writes must be replayed with valid session | Replay uses Supabase client with persisted session; if session expired, sync fails gracefully and prompts re-login |
| V3 Session Management | yes | Supabase SSR session via cookies; offline context uses client-side session from localStorage/cookie |
| V4 Access Control | yes | Sync queue replay goes through existing Server Actions which enforce user_id RLS on Supabase |
| V5 Input Validation | yes | Queue payloads validated against zod schemas before replay |
| V6 Cryptography | no | No custom crypto; Supabase handles at-rest and in-transit encryption |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Sync queue manipulation (user modifies IndexedDB directly via DevTools) | Tampering | Server Actions enforce Supabase RLS — malicious payloads are rejected server-side; IndexedDB is not trusted as authoritative |
| Stale auth token used during offline sync replay | Elevation of Privilege | Supabase client auto-refreshes tokens; if refresh fails, surface auth error and halt sync |
| Cache poisoning via compromised CDN response | Tampering | CacheFirst only applies to poster images from known hostnames (already in next.config.mjs remotePatterns); SW does not cache API responses |

---

## Sources

### Primary (HIGH confidence)

- [Serwist official docs — Getting Started with @serwist/next](https://serwist.pages.dev/docs/next/getting-started) — setup steps, config options, tsconfig changes
- [Next.js official PWA guide](https://nextjs.org/docs/app/guides/progressive-web-apps) — manifest metadata, App Router integration
- npm registry — verified versions: @serwist/next@9.5.11, serwist@9.5.11, dexie@4.4.2, idb@8.0.3

### Secondary (MEDIUM confidence)

- [MDN — Offline and background operation](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation) — Background Sync API browser support, online event fallback
- [Dexie.js official site](https://dexie.org/) — EntityTable TypeScript pattern, version 4 API, deprecation of dexie-syncable
- [LogRocket — Offline-first frontend apps in 2025](https://blog.logrocket.com/offline-first-frontend-apps-2025-indexeddb-sqlite/) — IndexedDB vs localStorage comparison

### Tertiary (LOW confidence)

- WebSearch results on sync queue patterns — corroborated by multiple sources but specific implementation details are [ASSUMED]

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versions verified from npm registry, Serwist cited in official Next.js docs
- Architecture: MEDIUM — Dexie schema pattern from official Dexie TypeScript docs; sync queue pattern derived from general offline-first principles [ASSUMED]
- Pitfalls: HIGH — SW update lifecycle, SSR/IndexedDB conflict, and poster cache quota are well-documented browser platform issues

**Research date:** 2026-05-06
**Valid until:** 2026-06-06 (Serwist is actively maintained; check for minor version bumps before installing)
