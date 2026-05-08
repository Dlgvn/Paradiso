---
phase: 06-pwa-offline
plan: 03
subsystem: sync-engine
tags: [pwa, sync-engine, last-write-wins, background-sync, online-fallback, ui-status]
requirements: [PWA-03, PWA-04]
dependency_graph:
  requires: [06-01, 06-02]
  provides: [sync-engine, sync-events-bus, sync-status-hook, sync-status-badge, sync-engine-mount]
  affects: [Sidebar, BottomNav, Providers, sw.ts]
tech_stack:
  added: []
  patterns: [EventTarget-event-bus, dual-trigger-sync, last-write-wins, Background-Sync-API]
key_files:
  created:
    - src/lib/sync/sync-events.ts
    - src/lib/sync/sync-engine.ts
    - src/lib/sync/use-sync-status.ts
    - src/components/layout/SyncStatusBadge.tsx
    - src/components/layout/SyncEngineMount.tsx
  modified:
    - src/__tests__/lib/sync/sync-engine.test.ts
    - src/components/layout/Sidebar.tsx
    - src/components/layout/BottomNav.tsx
    - src/components/layout/Providers.tsx
    - src/app/sw.ts
decisions:
  - "D-02: Last-write-wins implemented via post-replay re-seed; mergeAfterSync provides explicit per-row comparison for future external-edit reconciliation"
  - "D-03: Subtle amber dot in Sidebar + BottomNav while offline, sonner toast on sync completion, no inline per-item badges"
  - "MAX_ATTEMPTS = 3: failed entries stay in queue with last_error surfaced via pending count"
  - "Dual-trigger: Background Sync API (Chromium) + window 'online' (universal fallback)"
metrics:
  duration: ~20min
  completed: "2026-05-07"
  tasks: 3
  files: 10
---

# Phase 6 Plan 03: Sync Engine + Offline UX Summary

**One-liner:** Dual-trigger sync engine (Background Sync API + window online) with last-write-wins conflict resolution, EventTarget event bus, amber offline dot badge in Sidebar/BottomNav, and post-sync sonner toast.

## What Was Built

Plan 06-03 closes the offline write loop. Plan 06-02 enqueues writes to sync_queue when offline; this plan empties that queue when the network returns and surfaces the sync state to the user.

### replaySyncQueue Contract

- **Parameters:** none (reads from Dexie sync_queue via getQueuedWrites)
- **Returns:** `{ replayed: number, remaining: number, failed: number }`
- **MAX_ATTEMPTS:** 3 — entries past this cap are skipped (counted as failed) and remain in queue for manual review
- **Re-seed behavior:** After replayed > 0, calls seedLibraryFromSupabase to overwrite Dexie with server state; re-seed failure is non-fatal

### Sync Event Flow

```
User goes offline
  → mutation triggers enqueueOfflineWrite (06-02)
    → sync_queue grows; SyncStatusBadge shows amber dot + pending count

Network returns
  → window 'online' fires → SyncEngineMount.onOnline → tryReplay → replaySyncQueue
  OR Background Sync API fires in sw.ts
    → sw.ts 'sync' event → self.clients.matchAll → client.postMessage({ type: 'replay-sync-queue' })
    → SyncEngineMount.onSwMessage → tryReplay → replaySyncQueue

replaySyncQueue (FIFO order via queued_at):
  → for each entry: dispatchOperation → Server Action (updateItemStatus / updateItemRating / toggleFavorite)
  → success: db.sync_queue.delete(entry.id), replayed++
  → failure: db.sync_queue.update(attempts+1, last_error), failed++
  → if replayed > 0: seedLibraryFromSupabase (re-seed from server)
  → syncBus.emit({ phase: 'success'|'error', replayed, remaining })

SyncEngineMount.onSync:
  → phase=success && replayed > 0: toast.success('Synced N change(s)')
  → phase=error: toast.error('Sync incomplete — ...')

useSyncStatus + SyncStatusBadge:
  → syncBus listener updates syncing/pendingCount state
  → badge disappears when online && !syncing && pendingCount === 0
```

### D-02 Last-Write-Wins

The Wave 0 migration adds a PostgreSQL trigger that auto-bumps `updated_at` on every UPDATE to `media_items`. After replaySyncQueue dispatches all writes, the re-seed via seedLibraryFromSupabase overwrites every local row with the server version — server timestamps are guaranteed >= local timestamps because of the trigger. This naturally implements last-write-wins without explicit per-row comparisons in the sync flow.

`mergeAfterSync(serverItem)` is provided for future external-edit reconciliation (e.g., a second device posting a realtime event). It compares ISO timestamps lexicographically and only writes if `serverItem.updated_at > local.updated_at`.

### D-03 Sync UX

- **Sidebar:** `SyncStatusBadge variant="sidebar"` — amber dot with WifiOff icon + pending count above sign-out button. Spinner (Loader2) while syncing. Null when idle online.
- **BottomNav:** `SyncStatusBadge variant="bottomnav"` — same logic, positioned in a `pointer-events-none` absolute wrapper at top of nav so it doesn't intercept taps.
- **Toast copy:** "Synced N change" (singular) / "Synced N changes" (plural) on success. "Sync incomplete — N change(s) failed to sync" on error.
- **Colors:** `text-amber-300`, `bg-amber-500/20` for offline dot; `text-accent` for syncing spinner. Cinematic, not alarming.

### Background Sync API Support Matrix

| Browser | Background Sync | Fallback (window online) |
|---------|----------------|--------------------------|
| Chrome/Edge/Android | Supported — fires even after tab closes | Also fires |
| Firefox | Not supported | Only mechanism |
| Safari/iOS | Not supported | Only mechanism |

### Service Worker Message Channel

```
sw.ts 'sync' event (tag: 'sync-library-queue')
  → self.clients.matchAll({ type: 'window', includeUncontrolled: true })
  → client.postMessage({ type: 'replay-sync-queue' })
  → SyncEngineMount navigator.serviceWorker.addEventListener('message', ...)
  → tryReplay() → replaySyncQueue()
```

This relay pattern is necessary because Dexie requires a window context and Server Actions require the Next.js runtime — neither is available inside the service worker.

## Tests

All 7 stubs in `sync-engine.test.ts` replaced with passing assertions:

- `replaySyncQueue (PWA-04)` — 5 tests: dispatch routing, queue removal on success, attempts increment on failure, FIFO order, MAX_ATTEMPTS skip
- `last-write-wins merge (D-02)` — 2 tests: server wins when newer, local preserved when newer or equal

**Full suite:** 44 tests across 9 suites — all green.

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED

- src/lib/sync/sync-events.ts: FOUND
- src/lib/sync/sync-engine.ts: FOUND
- src/lib/sync/use-sync-status.ts: FOUND
- src/components/layout/SyncStatusBadge.tsx: FOUND
- src/components/layout/SyncEngineMount.tsx: FOUND
- Commits: 03078b1, dc3c753, d42bb40 — all present
- npm run build: exits 0
- npm test: 44/44 passing

## Hand-off

Phase 6 complete. PWA-01 (manifest + installability), PWA-02 (service worker + offline shell), PWA-03 (offline writes via sync_queue), and PWA-04 (automatic sync on reconnect) are all implemented and tested. Ready for `/gsd-verify-work`.
