import { db, type LibraryItem } from '@/lib/db/schema'

function makeItem(overrides: Partial<LibraryItem> = {}): LibraryItem {
  return {
    id: overrides.id ?? 'item-1',
    user_id: overrides.user_id ?? 'user-1',
    media_type: overrides.media_type ?? 'movie',
    external_id: overrides.external_id ?? 'tt-1',
    title: overrides.title ?? 'Test Title',
    year: overrides.year ?? '2024',
    genre: overrides.genre ?? null,
    director: overrides.director ?? null,
    author: overrides.author ?? null,
    plot: overrides.plot ?? null,
    poster_url: overrides.poster_url ?? null,
    external_rating: overrides.external_rating ?? null,
    status: overrides.status ?? 'watchlist',
    user_rating: overrides.user_rating ?? null,
    is_favorite: overrides.is_favorite ?? false,
    date_added: overrides.date_added ?? '2024-01-01T00:00:00.000Z',
    date_completed: overrides.date_completed ?? null,
    notes: overrides.notes ?? null,
    updated_at: overrides.updated_at ?? '2024-01-01T00:00:00.000Z',
  }
}

describe('MediaTrackerDB (PWA-02)', () => {
  beforeEach(async () => {
    await db.library_items.clear()
    await db.sync_queue.clear()
  })

  it('opens with version 1 and tables [library_items, sync_queue]', () => {
    expect(db.verno).toBe(1)
    const tableNames = db.tables.map((t) => t.name).sort()
    expect(tableNames).toEqual(['library_items', 'sync_queue'])
  })

  it('library_items.bulkPut + .toArray() round-trips MediaItem records', async () => {
    const items = [makeItem({ id: 'a', title: 'A' }), makeItem({ id: 'b', title: 'B' })]
    await db.library_items.bulkPut(items)
    const result = await db.library_items.orderBy('id').toArray()
    expect(result).toHaveLength(2)
    expect(result[0].title).toBe('A')
    expect(result[1].title).toBe('B')
  })

  it('library_items can be queried by user_id index', async () => {
    await db.library_items.bulkPut([
      makeItem({ id: 'x', user_id: 'u1' }),
      makeItem({ id: 'y', user_id: 'u2' }),
      makeItem({ id: 'z', user_id: 'u1' }),
    ])
    const u1 = await db.library_items.where('user_id').equals('u1').toArray()
    expect(u1.map((i) => i.id).sort()).toEqual(['x', 'z'])
  })

  it('library_items can be queried by status index', async () => {
    await db.library_items.bulkPut([
      makeItem({ id: 'q', status: 'watchlist' }),
      makeItem({ id: 'r', status: 'completed' }),
    ])
    const completed = await db.library_items.where('status').equals('completed').toArray()
    expect(completed.map((i) => i.id)).toEqual(['r'])
  })

  it('sync_queue auto-increments id on add', async () => {
    const id1 = await db.sync_queue.add({
      operation: 'update_status',
      item_id: 'a',
      payload: { status: 'completed' },
      queued_at: '2024-01-01T00:00:00.000Z',
      attempts: 0,
    })
    const id2 = await db.sync_queue.add({
      operation: 'update_rating',
      item_id: 'a',
      payload: { rating: 8 },
      queued_at: '2024-01-01T00:00:01.000Z',
      attempts: 0,
    })
    expect(typeof id1).toBe('number')
    expect(typeof id2).toBe('number')
    expect(id2).toBeGreaterThan(id1 as number)
  })
})
