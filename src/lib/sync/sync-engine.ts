'use client'

import { db, type LibraryItem, type SyncQueueEntry } from '@/lib/db/schema'
import { getQueuedWrites } from '@/lib/db/sync-queue'
import { seedLibraryFromSupabase } from '@/lib/db/seed'
import { createClient } from '@/lib/supabase/client'
import {
  updateItemStatus,
  updateItemRating,
  toggleFavorite,
} from '@/app/actions/library'
import type { MediaStatus } from '@/types/media'
import { syncBus } from './sync-events'

export const MAX_ATTEMPTS = 3

/**
 * dispatchOperation — sends a single queue entry to the matching Server Action.
 * Throws on error so replaySyncQueue can branch on success/failure.
 */
async function dispatchOperation(entry: SyncQueueEntry): Promise<void> {
  switch (entry.operation) {
    case 'update_status': {
      const status = entry.payload.status as MediaStatus
      const result = await updateItemStatus(entry.item_id, status)
      if ('error' in result) throw new Error(result.error)
      return
    }
    case 'update_rating': {
      const rating = entry.payload.user_rating as number | null
      const result = await updateItemRating(entry.item_id, rating)
      if ('error' in result) throw new Error(result.error)
      return
    }
    case 'toggle_favorite': {
      const isFavorite = entry.payload.is_favorite as boolean
      const result = await toggleFavorite(entry.item_id, isFavorite)
      if ('error' in result) throw new Error(result.error)
      return
    }
    default: {
      const _never: never = entry.operation
      throw new Error(`Unknown sync operation: ${String(_never)}`)
    }
  }
}

/**
 * replaySyncQueue — drains the sync queue. For each entry in queued_at order:
 *   - Try to dispatch the matching Server Action
 *   - On success → delete the queue entry
 *   - On failure → increment attempts; if attempts >= MAX_ATTEMPTS leave it
 *     for manual user intervention but stop processing this run.
 * Returns counts so the caller can render a toast like "Synced 4 changes".
 * After a non-empty successful replay, re-seeds Dexie from Supabase so server
 * timestamps + any concurrent server-side edits propagate back (D-02).
 */
export async function replaySyncQueue(): Promise<{
  replayed: number
  remaining: number
  failed: number
}> {
  const queue = await getQueuedWrites()
  syncBus.emit({ phase: 'start', pending: queue.length })

  let replayed = 0
  let failed = 0

  for (const entry of queue) {
    if (entry.attempts >= MAX_ATTEMPTS) {
      failed++
      continue
    }
    try {
      await dispatchOperation(entry)
      if (entry.id !== undefined) {
        await db.sync_queue.delete(entry.id)
      }
      replayed++
    } catch (err) {
      if (entry.id !== undefined) {
        await db.sync_queue.update(entry.id, {
          attempts: entry.attempts + 1,
          last_error: err instanceof Error ? err.message : String(err),
        })
      }
      failed++
    }
  }

  const remaining = await db.sync_queue.count()

  // Re-seed Dexie if anything actually replayed — server is now authoritative
  // (last-write-wins via the trigger that auto-bumps updated_at on UPDATE).
  if (replayed > 0) {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await seedLibraryFromSupabase(user.id)
      }
    } catch {
      // Re-seed failure is non-fatal: queue entries already cleared, UI will
      // hydrate next time DBSeedGate runs.
    }
  }

  if (failed > 0) {
    syncBus.emit({
      phase: 'error',
      replayed,
      remaining,
      error: `${failed} change(s) failed to sync`,
    })
  } else {
    syncBus.emit({ phase: 'success', replayed, remaining })
  }

  return { replayed, remaining, failed }
}

/**
 * mergeAfterSync — explicit last-write-wins merge for a single row. Used when
 * a server row arrives via an out-of-band channel (e.g., realtime in a future
 * phase, or manual refresh). Compares ISO timestamps lexicographically — valid
 * because all timestamps are produced by `new Date().toISOString()` in UTC.
 */
export async function mergeAfterSync(serverItem: LibraryItem): Promise<void> {
  const local = await db.library_items.get(serverItem.id)
  if (!local || serverItem.updated_at > local.updated_at) {
    await db.library_items.put(serverItem)
  }
}
