import { db, type LibraryItem } from '@/lib/db/schema'
import { enqueueOfflineWrite, pendingWriteCount } from '@/lib/db/sync-queue'

// --- Mocks ---
jest.mock('@/app/actions/library', () => ({
  updateItemStatus: jest.fn(),
  updateItemRating: jest.fn(),
  toggleFavorite: jest.fn(),
}))
jest.mock('@/lib/db/seed', () => ({
  seedLibraryFromSupabase: jest.fn(async () => ({ seeded: 0 })),
}))
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: async () => ({ data: { user: { id: 'user-1' } } }),
    },
  }),
}))

import * as actions from '@/app/actions/library'
import { replaySyncQueue, mergeAfterSync } from '@/lib/sync/sync-engine'

function makeItem(overrides: Partial<LibraryItem> = {}): LibraryItem {
  return {
    id: overrides.id ?? 'item-1',
    user_id: 'user-1',
    media_type: 'movie',
    external_id: 'tt-1',
    title: 'Test',
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
    total_seasons: null,
    episodes_watched: [],
  }
}

describe('replaySyncQueue (PWA-04)', () => {
  beforeEach(async () => {
    await db.library_items.clear()
    await db.sync_queue.clear()
    await db.library_items.put(makeItem({ id: 'item-1' }))
    ;(actions.updateItemStatus as jest.Mock).mockReset().mockResolvedValue({ success: true })
    ;(actions.updateItemRating as jest.Mock).mockReset().mockResolvedValue({ success: true })
    ;(actions.toggleFavorite as jest.Mock).mockReset().mockResolvedValue({ success: true })
  })

  it('dispatches each queued operation to the matching Server Action', async () => {
    await enqueueOfflineWrite('update_status', 'item-1', { status: 'completed' })
    await enqueueOfflineWrite('update_rating', 'item-1', { user_rating: 8 })
    await enqueueOfflineWrite('toggle_favorite', 'item-1', { is_favorite: true })

    const result = await replaySyncQueue()

    expect(actions.updateItemStatus).toHaveBeenCalledWith('item-1', 'completed')
    expect(actions.updateItemRating).toHaveBeenCalledWith('item-1', 8)
    expect(actions.toggleFavorite).toHaveBeenCalledWith('item-1', true)
    expect(result.replayed).toBe(3)
    expect(result.failed).toBe(0)
  })

  it('removes successfully-replayed entries from sync_queue', async () => {
    await enqueueOfflineWrite('update_status', 'item-1', { status: 'completed' })
    expect(await pendingWriteCount()).toBe(1)
    await replaySyncQueue()
    expect(await pendingWriteCount()).toBe(0)
  })

  it('on failure, increments attempts and leaves entry in queue', async () => {
    ;(actions.updateItemStatus as jest.Mock).mockRejectedValueOnce(new Error('network'))
    await enqueueOfflineWrite('update_status', 'item-1', { status: 'completed' })

    const result = await replaySyncQueue()

    expect(result.failed).toBe(1)
    expect(result.replayed).toBe(0)
    const remaining = await db.sync_queue.toArray()
    expect(remaining).toHaveLength(1)
    expect(remaining[0].attempts).toBe(1)
    expect(remaining[0].last_error).toBe('network')
  })

  it('processes entries in queued_at ascending order', async () => {
    const calls: string[] = []
    ;(actions.updateItemStatus as jest.Mock).mockImplementation(async (_id: string, status: string) => {
      calls.push(`status:${status}`)
      return { success: true }
    })
    ;(actions.updateItemRating as jest.Mock).mockImplementation(async (_id: string, rating: number) => {
      calls.push(`rating:${rating}`)
      return { success: true }
    })

    await enqueueOfflineWrite('update_status', 'item-1', { status: 'watching' })
    await new Promise((r) => setTimeout(r, 5))
    await enqueueOfflineWrite('update_rating', 'item-1', { user_rating: 7 })
    await new Promise((r) => setTimeout(r, 5))
    await enqueueOfflineWrite('update_status', 'item-1', { status: 'completed' })

    await replaySyncQueue()

    expect(calls).toEqual(['status:watching', 'rating:7', 'status:completed'])
  })

  it('skips entries past MAX_ATTEMPTS without dispatching', async () => {
    await enqueueOfflineWrite('update_status', 'item-1', { status: 'completed' })
    const queued = await db.sync_queue.toArray()
    await db.sync_queue.update(queued[0].id!, { attempts: 3 })

    const result = await replaySyncQueue()

    expect(actions.updateItemStatus).not.toHaveBeenCalled()
    expect(result.replayed).toBe(0)
    expect(result.failed).toBe(1)
    // Entry remains in queue for manual user action
    expect(await pendingWriteCount()).toBe(1)
  })
})

describe('last-write-wins merge (D-02)', () => {
  beforeEach(async () => {
    await db.library_items.clear()
  })

  it('server item replaces local when server.updated_at > local.updated_at', async () => {
    await db.library_items.put(makeItem({ id: 'item-1', status: 'watchlist', updated_at: '2024-01-01T00:00:00.000Z' }))
    const server = makeItem({ id: 'item-1', status: 'completed', updated_at: '2024-06-01T00:00:00.000Z' })
    await mergeAfterSync(server)
    const merged = await db.library_items.get('item-1')
    expect(merged?.status).toBe('completed')
    expect(merged?.updated_at).toBe('2024-06-01T00:00:00.000Z')
  })

  it('local item is preserved when local.updated_at >= server.updated_at', async () => {
    await db.library_items.put(makeItem({ id: 'item-1', status: 'completed', updated_at: '2024-06-01T00:00:00.000Z' }))
    const server = makeItem({ id: 'item-1', status: 'watchlist', updated_at: '2024-01-01T00:00:00.000Z' })
    await mergeAfterSync(server)
    const merged = await db.library_items.get('item-1')
    expect(merged?.status).toBe('completed')
  })
})
