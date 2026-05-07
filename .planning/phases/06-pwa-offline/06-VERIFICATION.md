---
phase: 06-pwa-offline
status: human_needed
verified_at: 2026-05-07T00:00:00Z
score: 12/12 automated must-haves verified
human_verification:
  - test: "Install the app to home screen on iOS (Safari → Share → Add to Home Screen) and Android (Chrome → Install App)"
    expected: "App launches in standalone mode with cinematic dark theme (#0a0a0f background), no browser chrome visible"
    why_human: "Cannot test beforeinstallprompt or native install dialog without a real browser and device"
  - test: "Load /movies while online, then go offline (DevTools → Network → Offline), then reload the page"
    expected: "Page renders from the service worker precache without a network error — app shell is visible"
    why_human: "Service worker caching behavior requires a real browser; public/sw.js is a gitignored build artifact not present in the tree"
  - test: "Navigate to a route that was not precached while offline"
    expected: "The /~offline fallback page renders: 'You're offline' heading with 'Back to library' link"
    why_human: "Serwist navigation fallback routing requires a running service worker in a real browser"
  - test: "Go offline in DevTools, toggle favorite on an item, change one item's status — then check IndexedDB in DevTools (Application → IndexedDB → media-tracker-v3 → sync_queue)"
    expected: "Exactly two entries appear in sync_queue with operation, item_id, payload, queued_at, attempts:0"
    why_human: "Requires a live Dexie database in a real browser; cannot simulate navigator.onLine=false in Jest"
  - test: "While offline, verify the Sidebar shows a subtle amber offline dot. If pending writes exist, the dot should show the pending count."
    expected: "SyncStatusBadge renders WifiOff icon + amber styling in the sidebar's mt-auto section above the sign-out button"
    why_human: "Visual rendering requires a real browser; useOnlineStatus responds to actual window offline events"
  - test: "Reconnect (DevTools → Network → Online) after accumulating 3 offline mutations"
    expected: "Within ~1–2 seconds a sonner toast appears: 'Synced 3 changes'. The sync_queue empties. The offline dot disappears. Supabase Studio shows the updated rows."
    why_human: "Requires real network, real Supabase connection, and real service worker message relay from sw.ts to SyncEngineMount"
  - test: "Apply the Supabase migration before live testing: run `supabase db push` (or paste supabase/migrations/002_media_items_updated_at.sql into the Supabase SQL editor)"
    expected: "The media_items table gains an updated_at timestamptz column with an auto-update trigger and an index on (user_id, updated_at desc)"
    why_human: "Migration must be applied by the developer; the verifier cannot push to a live Supabase project"
---

# Phase 6: PWA + Offline Verification Report

**Phase Goal:** Add full PWA offline support — installable, works offline, syncs when reconnected
**Verified:** 2026-05-07T00:00:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

**Note on source root:** All source files reside at `/Users/dlgvnbyr/Documents/Hicheel/Deep Learning/` (the git root), not inside `media-tracker-v3/`. The `media-tracker-v3/` subdirectory contains only `.next/`, `.planning/`, `.vercel/`, and a few config files.

---

## Goal Achievement

### Observable Truths (from ROADMAP.md Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | User can install the app to their home screen on mobile and desktop | ? HUMAN | InstallPrompt.tsx exists, listens to beforeinstallprompt, calls deferred.prompt(), mounts in Providers — behavior requires real browser |
| 2 | User can navigate their library with no internet connection | ? HUMAN | sw.ts precaches __SW_MANIFEST, /~offline fallback configured; offline page exists — requires real SW in browser |
| 3 | User can update an item's status or rating while offline and see the change immediately | ? HUMAN | library-offline.ts calls enqueueOfflineWrite when offline, which atomically updates library_items — requires live browser with Dexie |
| 4 | When internet is restored, all offline changes sync to Supabase without user intervention | ? HUMAN | SyncEngineMount listens to window 'online', calls replaySyncQueue; sync-engine dispatches to Server Actions — requires real network |

All four truths pass automated checks. Human verification is needed because the behavior depends on browser APIs (beforeinstallprompt, service worker, navigator.onLine, IndexedDB) and a live Supabase connection.

**Additional plan-level truths verified:**

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 5 | Failed sync entries increment attempts and stay in queue | ✓ VERIFIED | sync-engine.ts: db.sync_queue.update({ attempts: entry.attempts + 1, last_error }); test passes |
| 6 | After replay, Dexie re-seeds from Supabase (last-write-wins) | ✓ VERIFIED | replaySyncQueue calls seedLibraryFromSupabase after replayed > 0; mergeAfterSync exported |
| 7 | Sidebar and BottomNav show offline dot when offline | ✓ VERIFIED | SyncStatusBadge wired in Sidebar.tsx (variant="sidebar") and BottomNav.tsx (variant="bottomnav") |
| 8 | Post-sync toast "Synced N change(s)" appears | ✓ VERIFIED | SyncEngineMount subscribes to syncBus, calls toast.success on success phase |
| 9 | Background Sync API registered; window 'online' is universal fallback | ✓ VERIFIED | SyncEngineMount.tsx: registerBackgroundSync() + window.addEventListener('online') |
| 10 | Sync_queue populates with one entry per offline write | ✓ VERIFIED | enqueueOfflineWrite Dexie transaction: db.sync_queue.add(entry) — 5 tests passing |
| 11 | IndexedDB seeded from Supabase on app mount when online | ✓ VERIFIED | DBSeedGate mounted in Providers, checks navigator.onLine, calls seedLibraryFromSupabase |
| 12 | updated_at column migration exists for last-write-wins support | ✓ VERIFIED | 002_media_items_updated_at.sql exists with column + trigger + index (user must apply via supabase db push) |

**Score:** 12/12 automated must-haves verified

---

### Required Artifacts

| Artifact | Status | Details |
|----------|--------|---------|
| `supabase/migrations/002_media_items_updated_at.sql` | ✓ VERIFIED | Contains alter table, trigger trg_media_items_updated_at, index media_items_user_id_updated_at_idx |
| `src/app/~offline/page.tsx` | ✓ VERIFIED | Renders "You're offline" with bg-base text-white, Back to library link |
| `public/icons/icon-192.png` | ✓ VERIFIED | Valid PNG image |
| `public/icons/icon-512.png` | ✓ VERIFIED | Valid PNG image |
| `public/icons/icon-192-maskable.png` | ✓ VERIFIED | Exists |
| `public/icons/icon-512-maskable.png` | ✓ VERIFIED | Exists |
| `jest.setup.ts` | ✓ VERIFIED | Imports fake-indexeddb/auto and @testing-library/jest-dom |
| `src/__tests__/manifest.test.ts` | ✓ VERIFIED | Real assertions (10 expects), no it.todo, imports from @/app/manifest |
| `src/__tests__/lib/db/schema.test.ts` | ✓ VERIFIED | Real assertions (10 expects), no it.todo |
| `src/__tests__/lib/db/sync-queue.test.ts` | ✓ VERIFIED | Real assertions (13 expects), no it.todo |
| `src/__tests__/lib/sync/sync-engine.test.ts` | ✓ VERIFIED | Real assertions (20 expects), no it.todo |
| `next.config.mjs` | ✓ VERIFIED | withSerwistInit, swSrc: src/app/sw.ts, reloadOnOnline: false, 3 image hostnames preserved |
| `src/app/sw.ts` | ✓ VERIFIED | new Serwist, skipWaiting, clientsClaim, poster-images CacheFirst, /~offline fallback, sync-library-queue handler, postMessage |
| `src/app/manifest.ts` | ✓ VERIFIED | MetadataRoute.Manifest, display: standalone, theme_color: #0a0a0f, 4 icons with maskable purpose |
| `tsconfig.sw.json` | ✓ VERIFIED | webworker in lib array |
| `src/components/pwa/InstallPrompt.tsx` | ✓ VERIFIED | beforeinstallprompt listener, BeforeInstallPromptEvent, mt-install-prompt-dismissed, bg-accent/20 |
| `src/types/media.ts` | ✓ VERIFIED | updated_at: string field present |
| `src/lib/db/schema.ts` | ✓ VERIFIED | class MediaTrackerDB extends Dexie, library_items + sync_queue tables, indices, singleton db export |
| `src/lib/db/seed.ts` | ✓ VERIFIED | seedLibraryFromSupabase, .from('media_items'), bulkPut |
| `src/lib/db/sync-queue.ts` | ✓ VERIFIED | enqueueOfflineWrite, db.transaction, db.sync_queue.add, db.library_items.update, updated_at: queued_at |
| `src/lib/db/library-offline.ts` | ✓ VERIFIED | navigator.onLine branching, enqueueOfflineWrite for offline path, Server Actions for online path |
| `src/lib/hooks/useOnlineStatus.ts` | ✓ VERIFIED | navigator.onLine, online + offline event listeners |
| `src/components/layout/DBSeedGate.tsx` | ✓ VERIFIED | seedLibraryFromSupabase, navigator.onLine guard, useRef guard |
| `src/lib/sync/sync-engine.ts` | ✓ VERIFIED | replaySyncQueue, mergeAfterSync, MAX_ATTEMPTS=3, Server Actions import, seedLibraryFromSupabase, syncBus.emit |
| `src/lib/sync/sync-events.ts` | ✓ VERIFIED | EventTarget subclass, syncBus singleton, SyncEventDetail discriminated union |
| `src/lib/sync/use-sync-status.ts` | ✓ VERIFIED | useOnlineStatus, pendingWriteCount, syncBus.addEventListener |
| `src/components/layout/SyncStatusBadge.tsx` | ✓ VERIFIED | WifiOff, Loader2, useSyncStatus, role="status", aria-live, sidebar+bottomnav variants |
| `src/components/layout/SyncEngineMount.tsx` | ✓ VERIFIED | 'use client', addEventListener('online'), replaySyncQueue, BG_SYNC_TAG, toast.success, serviceWorker.addEventListener('message') |
| `src/components/layout/Providers.tsx` | ✓ VERIFIED | DBSeedGate, SyncEngineMount, InstallPrompt all mounted in TooltipProvider tree |
| `src/components/layout/Sidebar.tsx` | ✓ VERIFIED | SyncStatusBadge imported and rendered (variant="sidebar") |
| `src/components/layout/BottomNav.tsx` | ✓ VERIFIED | SyncStatusBadge imported and rendered (variant="bottomnav") with pointer-events-none wrapper |

---

### Key Link Verification

| From | To | Via | Status |
|------|----|-----|--------|
| next.config.mjs | src/app/sw.ts | withSerwistInit({ swSrc }) | ✓ WIRED |
| src/app/layout.tsx | src/app/manifest.ts | manifest: "/manifest.webmanifest" + appleWebApp | ✓ WIRED |
| src/components/layout/Providers.tsx | src/components/pwa/InstallPrompt.tsx | JSX mount | ✓ WIRED |
| src/app/sw.ts | /~offline | Serwist fallbacks.entries url=/~offline | ✓ WIRED |
| src/lib/db/schema.ts | dexie | import Dexie, EntityTable from 'dexie' | ✓ WIRED |
| src/lib/db/sync-queue.ts | src/lib/db/schema.ts | db.sync_queue.add + db.library_items.update | ✓ WIRED |
| src/lib/db/library-offline.ts | src/lib/db/sync-queue.ts | enqueueOfflineWrite | ✓ WIRED |
| src/components/layout/Providers.tsx | src/components/layout/DBSeedGate.tsx | JSX mount | ✓ WIRED |
| src/lib/sync/sync-engine.ts | src/lib/db/sync-queue.ts | getQueuedWrites + db.sync_queue.delete/update | ✓ WIRED |
| src/lib/sync/sync-engine.ts | src/app/actions/library.ts | updateItemStatus, updateItemRating, toggleFavorite | ✓ WIRED |
| src/lib/sync/sync-engine.ts | src/lib/db/seed.ts | seedLibraryFromSupabase after replay | ✓ WIRED |
| src/components/layout/SyncEngineMount.tsx | src/lib/sync/sync-engine.ts | replaySyncQueue() on online event | ✓ WIRED |
| src/components/layout/Sidebar.tsx | src/components/layout/SyncStatusBadge.tsx | JSX import + render | ✓ WIRED |
| src/components/layout/BottomNav.tsx | src/components/layout/SyncStatusBadge.tsx | JSX import + render | ✓ WIRED |
| src/app/sw.ts | client message channel | self.clients.matchAll → client.postMessage | ✓ WIRED |

---

### Requirements Coverage

| Requirement | Plans | Status |
|-------------|-------|--------|
| PWA-01: Installable PWA with manifest + install prompt | 06-00, 06-01 | ✓ Code verified; browser install requires human test |
| PWA-02: Browse library offline via IndexedDB | 06-00, 06-02 | ✓ Dexie schema + seed + offline reads verified; live browser requires human test |
| PWA-03: Update status/rating while offline with optimistic UI | 06-02, 06-03 | ✓ enqueueOfflineWrite + library-offline.ts verified; live browser requires human test |
| PWA-04: Auto-sync on reconnect without user intervention | 06-03 | ✓ sync-engine + SyncEngineMount verified; real network requires human test |

---

### Anti-Patterns Found

No blockers found. All files have real implementations. Key notes from context:

| Finding | Severity | Impact |
|---------|----------|--------|
| Sync race condition: no mutex on replaySyncQueue — concurrent online events could trigger two replays | Warning | Unlikely in practice (each replay is awaited and online events are rare), but possible on flapping connections |
| sort by queued_at (string ISO comparison) — works correctly since all timestamps are UTC ISO 8601 | Info | Not a bug; ISO strings sort lexicographically = chronologically |
| Dead assignment noted in code review — specific location not identified in these plans | Info | Minor code quality; does not affect correctness |
| Supabase migration 002_media_items_updated_at.sql must be applied manually by user | Warning | Data layer will fail at runtime if migration not applied |

---

### Human Verification Required

#### 1. PWA Install Prompt (PWA-01)

**Test:** On a Chrome or Edge desktop, run `npm run build && npm run start`, visit the app, then check the address bar for an Install icon or trigger it via DevTools → Application → "Add to home screen". On Android, Chrome should surface an Install banner.
**Expected:** Native browser install dialog appears. App launches in standalone mode on next open.
**Why human:** beforeinstallprompt is browser-controlled and cannot be triggered in Jest.

#### 2. Offline App Shell (PWA-01)

**Test:** Visit /movies while online, then in DevTools → Network set throttling to "Offline", then reload the page.
**Expected:** Page renders from precache — the app shell appears without a network error. No blank screen.
**Why human:** Service worker precaching requires a production build and real browser SW registration. public/sw.js is gitignored and not present in the repo.

#### 3. Offline Navigation Fallback (PWA-01)

**Test:** While offline (DevTools), navigate to a URL not in the precache (e.g., a deep link you have never visited).
**Expected:** The /~offline page renders: heading "You're offline", body text, "Back to library" link.
**Why human:** Serwist navigation fallback behavior requires a real registered SW.

#### 4. Offline Writes to sync_queue (PWA-03)

**Test:** Go online, load the library (DBSeedGate seeds Dexie). Go offline. Toggle favorite on one item, change status on another. Open DevTools → Application → IndexedDB → media-tracker-v3 → sync_queue.
**Expected:** Two entries, each with operation, item_id, payload, queued_at, attempts: 0. The UI shows the updated values immediately (optimistic apply).
**Why human:** Requires live browser with real Dexie + navigator.onLine = false.

#### 5. Sync on Reconnect (PWA-04)

**Test:** With 2–3 items in sync_queue (from step 4), switch DevTools to "Online".
**Expected:** Within ~1 second, sonner toast "Synced 3 changes" appears. The sync_queue empties. The offline amber dot in Sidebar/BottomNav disappears. Supabase media_items shows the updated rows.
**Why human:** Requires real network connection, live Supabase project, and the migration applied.

#### 6. iOS Offline + Install (PWA-01)

**Test:** On iOS Safari, visit the production URL, Share → Add to Home Screen. Open from home screen. Go offline (Airplane Mode). Navigate to /movies.
**Expected:** App opens in standalone mode (no Safari UI). Library renders from precache.
**Why human:** iOS Safari has different PWA behavior (no beforeinstallprompt — relies on appleWebApp metadata + user-initiated Add to Home Screen).

#### 7. Apply Supabase Migration (prerequisite)

**Action required:** Run `supabase db push` or paste `supabase/migrations/002_media_items_updated_at.sql` into the Supabase SQL editor before any live testing.
**Expected:** media_items table gains updated_at column, trigger, and index.
**Why human:** Cannot automate Supabase schema changes.

---

### Gaps Summary

No gaps. All automated must-haves are verified. The phase goal cannot be confirmed PASSED until the human verification steps above are completed — specifically:

1. The Supabase migration must be applied (required for any live offline sync to work)
2. Install prompt behavior must be tested in a real browser
3. Offline read/write/sync flow must be tested end-to-end with DevTools network throttling

The code is fully implemented and wired. All 205 tests pass per context (plus the new Phase 6 tests: 5 manifest + 5 schema + 5 sync-queue + 7 sync-engine = 22 new tests).

---

_Verified: 2026-05-07T00:00:00Z_
_Verifier: Claude (gsd-verifier)_
