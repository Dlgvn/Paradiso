import { db, type SyncOperation, type SyncQueueEntry } from './schema'
import type { LibraryItem } from './schema'

/**
 * enqueueOfflineWrite — appends a pending mutation to sync_queue AND applies it
 * optimistically to library_items in a single atomic Dexie transaction. Used by
 * the offline-first wrapper (src/lib/db/library-offline.ts) when navigator.onLine
 * is false. Plan 06-03 reads from sync_queue and replays the entries through
 * Server Actions on reconnect.
 */
export async function enqueueOfflineWrite(
  operation: SyncOperation,
  item_id: string,
  payload: Partial<LibraryItem>,
): Promise<{ queueId: number }> {
  const queued_at = new Date().toISOString()
  const entry: Omit<SyncQueueEntry, 'id'> = {
    operation,
    item_id,
    payload: payload as Record<string, unknown>,
    queued_at,
    attempts: 0,
  }

  const queueId = await db.transaction(
    'rw',
    db.sync_queue,
    db.library_items,
    async () => {
      const newId = await db.sync_queue.add(entry)
      // Bump updated_at locally so last-write-wins (D-02) compares correctly when sync replays.
      await db.library_items.update(item_id, {
        ...payload,
        updated_at: queued_at,
      } as Partial<LibraryItem>)
      return newId as number
    },
  )

  return { queueId }
}

export async function getQueuedWrites(): Promise<SyncQueueEntry[]> {
  return db.sync_queue.orderBy('queued_at').toArray()
}

export async function pendingWriteCount(): Promise<number> {
  return db.sync_queue.count()
}
