---
phase: 06-pwa-offline
plan: "02"
subsystem: indexeddb-offline-layer
tags: [pwa, dexie, indexeddb, offline-reads, sync-queue, optimistic-updates]
dependency_graph:
  requires: [06-00, 06-01]
  provides:
    - src/lib/db/schema.ts (MediaTrackerDB with library_items + sync_queue)
    - src/lib/db/seed.ts (seedLibraryFromSupabase)
    - src/lib/db/sync-queue.ts (enqueueOfflineWrite, getQueuedWrites, pendingWriteCount)
    - src/lib/db/library-offline.ts (getLibraryItems, updateItemStatusOffline, updateItemRatingOffline, toggleFavoriteOffline)
    - src/lib/hooks/useOnlineStatus.ts
    - src/components/layout/DBSeedGate.tsx
  affects:
    - src/types/media.ts
    - src/components/layout/Providers.tsx
    - src/__tests__/lib/db/schema.test.ts
    - src/__tests__/lib/db/sync-queue.test.ts
    - jest.setup.ts
tech_stack:
  added:
    - "dexie@4.4.2 (dependency)"
    - "fake-indexeddb@^6 (devDependency — re-installed in this worktree)"
    - "recharts (dependency — missing dep from Phase 05 analytics, installed to fix build)"
  patterns:
    - Dexie singleton exported from schema.ts (one instance per browser context)
    - Atomic Dexie transaction for queue append + optimistic apply
    - navigator.onLine check for online/offline routing
    - useRef guard to prevent double-seeding in DBSeedGate
key_files:
  created:
    - src/lib/db/schema.ts
    - src/lib/db/seed.ts
    - src/lib/db/sync-queue.ts
    - src/lib/db/library-offline.ts
    - src/lib/hooks/useOnlineStatus.ts
    - src/components/layout/DBSeedGate.tsx
  modified:
    - src/types/media.ts
    - src/components/layout/Providers.tsx
    - src/__tests__/lib/db/schema.test.ts
    - src/__tests__/lib/db/sync-queue.test.ts
    - jest.setup.ts
    - package.json
    - package-lock.json
decisions:
  - "String() coercion used on Server Action error fields because the actual return union includes { error: string; details: ... } which TypeScript widens to error: string | undefined"
  - "structuredClone polyfill added to jest.setup.ts for jsdom environment compatibility with Dexie 4"
  - "reads always from Dexie (not online/offline branched) — single source of truth simplifies UI"
  - "recharts installed to fix pre-existing analytics build failure (Phase 05 dependency missing in worktree)"
metrics:
  completed_date: "2026-05-07"
  tasks_completed: 3
  files_created: 6
  files_modified: 7
---

# Phase 06 Plan 02: IndexedDB Offline Layer (Dexie + Sync Queue) Summary

Dexie 4.4.2 installed and wired as the offline source of truth: MediaTrackerDB schema with library_items (mirrors Supabase media_items) and sync_queue tables, seedLibraryFromSupabase hydrates Dexie from Supabase on mount, enqueueOfflineWrite atomically appends a sync queue entry and applies optimistic updates to library_items, and an offline-first wrapper routes reads always through Dexie and writes through Server Actions (online) or the queue (offline).

## Tasks Completed

| Task | Description | Commit |
|------|-------------|--------|
| 1 | Install Dexie, extend MediaItem with updated_at, create MediaTrackerDB schema, replace schema test stubs | e4dc4ee |
| 2 | enqueueOfflineWrite, seedLibraryFromSupabase, replace sync-queue test stubs | 6df45eb |
| 3 | library-offline.ts wrapper, useOnlineStatus hook, DBSeedGate mount in Providers | ffb7d70 |

## Dexie Version

**dexie@4.4.2** — pinned to verified research version.

## Final MediaTrackerDB Schema

```typescript
class MediaTrackerDB extends Dexie {
  library_items!: EntityTable<LibraryItem, 'id'>
  sync_queue!: EntityTable<SyncQueueEntry, 'id'>

  // version: 1
  // library_items: 'id, user_id, media_type, status, updated_at'
  // sync_queue: '++id, item_id, queued_at, operation'
}
```

**DB name:** `media-tracker-v3`
**Table mapping:** Supabase `media_items` → Dexie `library_items` (Wave 0 contract; table name frozen by stub tests)

## enqueueOfflineWrite Contract

**Parameters:** `(operation: SyncOperation, item_id: string, payload: Partial<LibraryItem>)`
**Returns:** `Promise<{ queueId: number }>`
**Transaction scope:** `rw` on both `db.sync_queue` and `db.library_items` — atomic: either both succeed or both roll back
**Optimistic apply:** writes `...payload, updated_at: queued_at` to library_items so last-write-wins (D-02) compares correctly on Plan 06-03 replay
**Called by:** library-offline.ts when `navigator.onLine` is false

## seedLibraryFromSupabase Contract

**When it runs:** DBSeedGate calls it once on mount (useRef guard) when navigator.onLine is true and user is authenticated
**Idempotency:** bulkPut upserts by primary key — safe to call repeatedly; does NOT clear local data on error
**Error handling:** throws on Supabase error (caller — DBSeedGate — catches and console.warns; never throws to Providers tree)
**Re-seed trigger:** Plan 06-03 sync engine will call seedLibraryFromSupabase again after successful replay to propagate server-side changes back

## library-offline.ts API Surface

| Function | Online path | Offline path |
|----------|------------|--------------|
| `getLibraryItems(filter)` | Dexie (always) | Dexie (always) |
| `updateItemStatusOffline(id, status)` | Call Server Action → write-through to Dexie | `enqueueOfflineWrite('update_status', ...)` |
| `updateItemRatingOffline(id, rating)` | Call Server Action → write-through to Dexie | `enqueueOfflineWrite('update_rating', ...)` |
| `toggleFavoriteOffline(id, isFavorite)` | Call Server Action → write-through to Dexie | `enqueueOfflineWrite('toggle_favorite', ...)` |

**Intentionally NOT wrapped (online-only):** `addMediaItem`, `deleteMediaItem`, `checkDuplicate` — these require network by design (external API search for add; rare destructive action for delete).

## Verification Results

```
npm test -- schema: 5 passed — EXIT 0
npm test -- sync-queue: 5 passed — EXIT 0
npm test (full suite): 9 suites, 37 passed, 6 todo — EXIT 0
npm run build: compiled successfully — EXIT 0
```

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] TypeScript build error on Server Action error union type**
- **Found during:** Task 3 (npm run build)
- **Issue:** Server Actions return `{ error: string; details: ZodFlattenedError; }` in validation-fail case, making `result.error` typed as `string | undefined` when narrowed through union. library-offline.ts return type `{ error: string }` rejected TypeScript's type system.
- **Fix:** Changed `return { error: result.error }` to `return { error: String(result.error) }` to force the narrowing to string.
- **Files modified:** src/lib/db/library-offline.ts

**2. [Rule 3 - Blocking] Missing fake-indexeddb devDependency in worktree**
- **Found during:** Task 1 (npm test)
- **Issue:** Wave 0 installed fake-indexeddb in the main repo, but this worktree's node_modules was freshly installed from package.json which somehow didn't have it in lockfile. Module not found error blocked tests.
- **Fix:** `npm install fake-indexeddb@^6 --save-dev` — added to devDependencies.

**3. [Rule 3 - Blocking] structuredClone not available in jsdom test environment**
- **Found during:** Task 1 (npx jest schema)
- **Issue:** Dexie 4 uses `structuredClone` internally; jsdom in this Jest config doesn't expose it even though Node 24 has it natively.
- **Fix:** Added polyfill to jest.setup.ts: `if (typeof globalThis.structuredClone === 'undefined') { globalThis.structuredClone = (obj) => JSON.parse(JSON.stringify(obj)) }`
- **Files modified:** jest.setup.ts

**4. [Rule 3 - Blocking] Missing recharts dependency broke npm run build**
- **Found during:** Task 3 (npm run build)
- **Issue:** Phase 05 analytics files import recharts but the package wasn't installed in this worktree's node_modules. Blocked build verification.
- **Fix:** `npm install recharts` — restored missing Phase 05 dependency.
- **Note:** Plan instructions say not to modify analytics files — only installed the missing package, did not change any analytics code.

## Hand-off to Plan 06-03

Plan 06-03 (sync engine) reads from the sync queue using `getQueuedWrites()` (already exported from sync-queue.ts), dispatches each entry through the corresponding Server Action, and on success removes entries from sync_queue. After replay, it should call `seedLibraryFromSupabase(userId)` to pull server-side changes (e.g., date_completed set by updateItemStatus) back into Dexie.

Key hooks for 06-03:
- `getQueuedWrites()` — returns entries ordered by queued_at (FIFO)
- `pendingWriteCount()` — badge count for sync status indicator
- `useOnlineStatus()` — trigger sync replay on transition from offline → online
- `db.sync_queue.delete(id)` — remove successfully replayed entries

## Self-Check: PASSED

- [x] src/lib/db/schema.ts exists, contains `class MediaTrackerDB extends Dexie`, `library_items: 'id, user_id, media_type, status, updated_at'`, `sync_queue: '++id, item_id, queued_at, operation'`, `export const db`
- [x] src/types/media.ts MediaItem contains `updated_at: string`
- [x] src/lib/db/seed.ts exists, `'use client'`, `from('media_items')`, `bulkPut`
- [x] src/lib/db/sync-queue.ts exists, `enqueueOfflineWrite`, `db.transaction(`, `db.sync_queue.add(`, `db.library_items.update(`, `updated_at: queued_at`
- [x] src/lib/db/library-offline.ts exists, `navigator.onLine`, `enqueueOfflineWrite`, imports from `@/app/actions/library`
- [x] src/lib/hooks/useOnlineStatus.ts exists, `navigator.onLine`, `addEventListener('online'`, `addEventListener('offline'`
- [x] src/components/layout/DBSeedGate.tsx exists, `seedLibraryFromSupabase`, useRef guard, navigator.onLine check
- [x] src/components/layout/Providers.tsx imports and renders `<DBSeedGate />`
- [x] src/__tests__/lib/db/schema.test.ts no `it.todo`, contains `MediaTrackerDB (PWA-02)`
- [x] src/__tests__/lib/db/sync-queue.test.ts no `it.todo`, contains `enqueueOfflineWrite (PWA-03)`
- [x] npm test exits 0 (37 passed)
- [x] npm run build exits 0
- [x] Commits e4dc4ee, 6df45eb, ffb7d70 exist
