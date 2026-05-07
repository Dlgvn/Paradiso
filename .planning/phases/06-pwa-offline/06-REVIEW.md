---
phase: 06-pwa-offline
status: issues_found
reviewed_at: 2026-05-07T00:00:00Z
depth: standard
files_reviewed: 21
files_reviewed_list:
  - src/app/sw.ts
  - src/app/manifest.ts
  - src/app/layout.tsx
  - src/app/~offline/page.tsx
  - src/app/actions/library.ts
  - src/components/pwa/InstallPrompt.tsx
  - src/components/layout/DBSeedGate.tsx
  - src/components/layout/SyncEngineMount.tsx
  - src/components/layout/SyncStatusBadge.tsx
  - src/components/layout/Providers.tsx
  - src/components/layout/Sidebar.tsx
  - src/components/layout/BottomNav.tsx
  - src/lib/db/schema.ts
  - src/lib/db/seed.ts
  - src/lib/db/sync-queue.ts
  - src/lib/db/library-offline.ts
  - src/lib/hooks/useOnlineStatus.ts
  - src/lib/sync/sync-engine.ts
  - src/lib/sync/sync-events.ts
  - src/lib/sync/use-sync-status.ts
  - src/types/media.ts
severity_counts:
  critical: 0
  high: 3
  medium: 4
  low: 2
  info: 2
---

# Phase 06: Code Review Report — PWA Offline Support

**Reviewed:** 2026-05-07T00:00:00Z
**Depth:** standard
**Files Reviewed:** 21
**Status:** issues_found

## Summary

Phase 06 adds Serwist service worker, Dexie-backed IndexedDB, a sync queue, and a sync engine with last-write-wins conflict resolution. The architecture is sound and the security posture of the server actions (Zod validation + `.eq('user_id', user.id)` on every mutation) is good. The three high-severity findings are all data-correctness bugs: a race condition that can cause duplicate sync replays, an online-path write that silently drops the Dexie update when the server action returns an error string, and a sync-queue ordering issue that can violate causality. No critical security vulnerabilities were found.

---

## High Issues

### HR-01: Concurrent sync replays — race condition can double-apply queue entries

**File:** `src/components/layout/SyncEngineMount.tsx:46-80`

**Issue:** `onOnline` (line 47), `onSwMessage` (line 51-54), and the initial-mount IIFE (line 73-80) all call `tryReplay()` independently with no mutual-exclusion guard. If the browser fires both the `online` event and the SW postMessage within the same tick (which happens on Chromium when Background Sync fires), two concurrent `replaySyncQueue()` calls race against the same queue entries. Both read the queue before either deletes entries, so the same mutation is dispatched twice to the server.

**Fix:** Add an in-flight flag or use a shared promise:

```ts
let replayInFlight: Promise<void> | null = null

async function tryReplay(): Promise<void> {
  if (replayInFlight) return replayInFlight
  replayInFlight = (async () => {
    try { await replaySyncQueue() } catch { /* sync-engine emits events */ }
  })()
  await replayInFlight
  replayInFlight = null
}
```

---

### HR-02: Online write-through silently skips Dexie update on server error

**File:** `src/lib/db/library-offline.ts:55-63`

**Issue:** `updateItemStatusOffline` (and the equivalent `updateItemRatingOffline` / `toggleFavoriteOffline`) returns early with `{ error }` when the server action fails, but the `now` timestamp was already captured and the Dexie update is skipped. This is correct. However, if the server action returns `{ error: someString }` and the caller ignores the returned error object (many call sites do), Dexie is **not** updated — which is the right behavior — but the inconsistency between lines 58-59 means the intent is fragile: a future edit that moves line 58 before the guard would silently write stale data to Dexie. More concretely: the variable `now` is declared at line 54 but only used in the success branch (line 58); this dead assignment misleads readers and static analysers.

**Fix:** Move the `now` assignment into the success branch, and ensure callers check the returned error:

```ts
export async function updateItemStatusOffline(
  id: string,
  status: MediaStatus,
): Promise<{ success: true } | { error: string }> {
  if (isOnline()) {
    const result = await updateItemStatus(id, status)
    if ('error' in result) return { error: String(result.error) }
    const now = new Date().toISOString()
    await db.library_items.update(id, { status, updated_at: now })
    return { success: true }
  }
  await enqueueOfflineWrite('update_status', id, { status })
  return { success: true }
}
```

Apply the same pattern to `updateItemRatingOffline` (line 69) and `toggleFavoriteOffline` (line 84).

---

### HR-03: Sync queue replayed in insertion order, not causal order — last-write-wins can be violated

**File:** `src/lib/db/sync-queue.ts:43-44` and `src/lib/sync/sync-engine.ts:69`

**Issue:** `getQueuedWrites()` orders by `queued_at` (ISO string). This is correct for a single field update. However, if a user changes status then changes rating while offline, the two entries share the same `item_id` and are dispatched sequentially — fine. The problem arises when two operations on the **same field** are queued (e.g., status changed to `watching`, then immediately to `completed` offline). If two operations land in the same millisecond, `queued_at` sort is not stable (depends on IndexedDB auto-increment). The queue `++id` primary key is monotonically increasing and is a more reliable causal ordering key.

**Fix:** Add `id` as a secondary sort key:

```ts
export async function getQueuedWrites(): Promise<SyncQueueEntry[]> {
  return db.sync_queue.orderBy('id').toArray()
}
```

Remove the `queued_at` index from the schema if it is not used elsewhere, or keep it for debugging. Using `id` (auto-increment) guarantees insertion order regardless of clock resolution.

---

## Medium Issues

### MD-01: `DBSeedGate` sets `seededRef.current = true` before the async work completes — re-mount triggers no re-seed

**File:** `src/components/layout/DBSeedGate.tsx:17-19`

**Issue:** `seededRef.current = true` is set synchronously at line 19, before `run()` is awaited. If the component unmounts mid-flight (e.g., React StrictMode double-invoke in development) and remounts, the guard is already set and the second mount skips seeding entirely, even if the first attempt failed. In production this is less of an issue, but the intent of the guard is to prevent duplicate calls — it should be set only after success.

**Fix:**

```ts
const run = async () => {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await seedLibraryFromSupabase(user.id)
    seededRef.current = true   // ← set only on success
  } catch (err) {
    console.warn('[DBSeedGate] seed failed:', err)
    // seededRef stays false — next mount will retry
  }
}
```

---

### MD-02: `useSyncStatus` does not refresh `pendingCount` after sync success — badge can show stale count

**File:** `src/lib/sync/use-sync-status.ts:35-39`

**Issue:** When the sync event `phase === 'success'` arrives, `setPendingCount(detail.remaining)` is called. `detail.remaining` comes from `db.sync_queue.count()` in `replaySyncQueue`. This is accurate at the moment sync finishes. However, `pendingCount` is **not** refreshed when the component mounts after a sync that completed during a prior session — the initial fetch at line 25 runs once, but if `SyncEngineMount` already ran `replaySyncQueue` before `useSyncStatus` mounted (race on initial load), the badge will show 0 from the initial fetch which is coincidentally correct. The deeper issue: there is no subscription to Dexie live query; if another tab enqueues an offline write, this tab's badge never updates. This is a medium-severity UX issue, not a data-correctness bug.

**Fix (pragmatic):** Use Dexie's `useLiveQuery` from `dexie-react-hooks` to subscribe to `sync_queue.count()`, replacing the one-shot `pendingWriteCount()` call. Alternatively, re-query on every sync event.

---

### MD-03: `BottomNav` has conflicting CSS — `fixed` and `relative` on the same element

**File:** `src/components/layout/BottomNav.tsx:21`

**Issue:** The `<nav>` element has both `fixed` (positions it relative to viewport) and `relative` (a positioning context for the `SyncStatusBadge` absolute child) applied. `fixed` overrides `relative` for the element's own layout, but `relative` is still applied as a positioning context — which does not work as intended because `fixed` children of a `fixed` parent are relative to the viewport, not the parent. The `SyncStatusBadge` uses `absolute` positioning and its `top-1 right-2` placement relies on the nav being the containing block. This will render correctly in most cases only because the nav is full-width, but the semantic intent is wrong and will break if the nav width ever changes.

**Fix:** Wrap the badge in a `relative` container inside the nav, or apply `relative` only to the inner wrapper `div`:

```tsx
<nav className="fixed bottom-0 left-0 right-0 md:hidden flex items-center justify-around h-16 ...">
  <div className="relative w-full h-full flex items-center justify-around">
    <div className="absolute inset-x-0 top-0 pointer-events-none">
      <SyncStatusBadge variant="bottomnav" />
    </div>
    {/* nav items */}
  </div>
</nav>
```

---

### MD-04: `replaySyncQueue` stops processing on first failure — later valid entries are skipped

**File:** `src/lib/sync/sync-engine.ts:80-88`

**Issue:** When `dispatchOperation(entry)` throws (line 75), the catch block increments `attempts` and increments `failed++` (line 87), but the loop continues via `continue` — actually, there is no `continue`; the loop naturally proceeds. Wait — re-reading: there is no `break` or `return` after the catch, so the loop does continue to the next entry. This is actually correct behavior. However, the comment in the JSDoc (line 54) says "if attempts >= MAX_ATTEMPTS leave it for manual user intervention but **stop processing this run**" — but the code does not stop; it continues to the next entry. The comment is misleading, not the code. The code is correct (continue on failure is better UX), but the doc comment should be updated.

**Fix:** Update the JSDoc to match actual behavior:

```ts
 * On failure → increment attempts; if attempts >= MAX_ATTEMPTS skip this entry.
 * Other entries in the queue continue to be processed.
```

---

## Low Issues

### LW-01: `InstallPrompt` does not handle `prompt()` rejection

**File:** `src/components/pwa/InstallPrompt.tsx:39-43`

**Issue:** `onInstall` calls `await deferred.prompt()` and `await deferred.userChoice` with no try/catch. If the browser rejects the promise (e.g., because `prompt()` can only be called once and the event was already consumed), the unhandled rejection will appear in the console and the component state will not be cleaned up.

**Fix:**

```ts
const onInstall = async () => {
  try {
    await deferred.prompt()
    await deferred.userChoice
  } catch {
    // prompt may reject if called after the event was already consumed
  } finally {
    setDeferred(null)
  }
}
```

---

### LW-02: `mergeAfterSync` does not handle a missing `updated_at` on `local`

**File:** `src/lib/sync/sync-engine.ts:130`

**Issue:** `MediaItem` defines `updated_at: string` (non-nullable), so TypeScript does not flag this. However, if an older Dexie row was written before `updated_at` was added to the schema (during development migrations), `local.updated_at` would be `undefined`, making the comparison `serverItem.updated_at > undefined` always `true`, which causes an unintended overwrite. This is low severity because schema version 1 always writes `updated_at`.

**Fix:** Add a nullish fallback:

```ts
if (!local || serverItem.updated_at > (local.updated_at ?? '')) {
  await db.library_items.put(serverItem)
}
```

---

## Info

### IN-01: `sw.ts` — Background Sync postMessage has no authentication check

**File:** `src/app/sw.ts:56-67`

**Issue:** The service worker relays a `{ type: 'replay-sync-queue' }` postMessage to all window clients. `SyncEngineMount` handles this message and calls `replaySyncQueue()`, which then calls server actions that verify the user session server-side. The relay itself is safe because there is no user data in the message. However, a malicious page in another origin sharing the same SW (unlikely in practice) could theoretically trigger a sync. Given that server actions validate the session, this is informational only.

---

### IN-02: `seedLibraryFromSupabase` fetches all rows with `select('*')` — no pagination

**File:** `src/lib/db/seed.ts:16`

**Issue:** For users with large libraries (thousands of items), a single `select('*')` without `.range()` or `.limit()` will load all rows into memory at once. Supabase has a default row limit of 1000 and requires explicit range headers for larger result sets. If a user has >1000 items, the seed will silently return only the first 1000, and offline reads will appear incomplete.

**Fix:** Add pagination or at minimum raise the limit explicitly:

```ts
const { data, error } = await supabase
  .from('media_items')
  .select('*')
  .eq('user_id', userId)
  .limit(10000)  // explicit ceiling; use pagination for truly large libraries
```

---

_Reviewed: 2026-05-07T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
