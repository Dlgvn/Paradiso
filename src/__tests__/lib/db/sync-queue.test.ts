import { db } from '@/lib/db/schema'
import { enqueueOfflineWrite, getQueuedWrites, pendingWriteCount } from '@/lib/db/sync-queue'
import type { LibraryItem } from '@/lib/db/schema'

function makeItem(overrides: Partial<LibraryItem> = {}): LibraryItem {
  return {
    id: overrides.id ?? 'item-1',
    user_id: overrides.user_id ?? 'user-1',
    media_type: overrides.media_type ?? 'movie',
    external_id: overrides.external_id ?? 'tt-1',
    title: overrides.title ?? 'Test',
    year: null,
    genre: null,
    director: null,
    author: null,
    plot: null,
    poster_url: null,
    external_rating: null,
    status: overrides.status ?? 'watchlist',
    user_rating: overrides.user_rating ?? null,
    is_favorite: overrides.is_favorite ?? false,
    date_added: '2024-01-01T00:00:00.000Z',
    date_completed: null,
    notes: null,
    updated_at: overrides.updated_at ?? '2024-01-01T00:00:00.000Z',
    current_season: null,
    current_episode: null,
  }
}

describe('enqueueOfflineWrite (PWA-03)', () => {
  beforeEach(async () => {
    await db.library_items.clear()
    await db.sync_queue.clear()
    await db.library_items.put(makeItem({ id: 'item-1' }))
  })

  it('appends an entry to sync_queue with operation, item_id, payload, queued_at, attempts:0', async () => {
    await enqueueOfflineWrite('update_status', 'item-1', { status: 'completed' })
    const queue = await getQueuedWrites()
    expect(queue).toHaveLength(1)
    expect(queue[0].operation).toBe('update_status')
    expect(queue[0].item_id).toBe('item-1')
    expect(queue[0].payload).toEqual({ status: 'completed' })
    expect(typeof queue[0].queued_at).toBe('string')
    expect(queue[0].attempts).toBe(0)
  })

  it('applies the payload optimistically to library_items', async () => {
    await enqueueOfflineWrite('update_rating', 'item-1', { user_rating: 9 })
    const item = await db.library_items.get('item-1')
    expect(item?.user_rating).toBe(9)
  })

  it('updates library_items.updated_at on optimistic apply (so last-write-wins works on sync)', async () => {
    const before = await db.library_items.get('item-1')
    const beforeTs = before!.updated_at
    // small delay to guarantee a strictly later ISO timestamp
    await new Promise((r) => setTimeout(r, 5))
    await enqueueOfflineWrite('toggle_favorite', 'item-1', { is_favorite: true })
    const after = await db.library_items.get('item-1')
    expect(after?.is_favorite).toBe(true)
    expect(after!.updated_at > beforeTs).toBe(true)
  })

  it('preserves earlier queue entries (FIFO order by queued_at)', async () => {
    await enqueueOfflineWrite('update_status', 'item-1', { status: 'watching' })
    await new Promise((r) => setTimeout(r, 5))
    await enqueueOfflineWrite('update_rating', 'item-1', { user_rating: 7 })
    await new Promise((r) => setTimeout(r, 5))
    await enqueueOfflineWrite('toggle_favorite', 'item-1', { is_favorite: true })
    const queue = await getQueuedWrites()
    expect(queue.map((e) => e.operation)).toEqual([
      'update_status',
      'update_rating',
      'toggle_favorite',
    ])
    expect(await pendingWriteCount()).toBe(3)
  })

  it('returns the inserted queue id', async () => {
    const { queueId } = await enqueueOfflineWrite('update_status', 'item-1', { status: 'dropped' })
    expect(typeof queueId).toBe('number')
    expect(queueId).toBeGreaterThan(0)
  })
})
