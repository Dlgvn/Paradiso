import { groupByMonth, countGenres, ratingDistribution, topGenreWithReason } from '@/lib/analytics'
import type { MediaItem } from '@/types/media'

describe('groupByMonth', () => {
  it('returns empty array for empty input', () => {
    const result = groupByMonth([])
    expect(result).toEqual([])
  })

  it('returns empty array when all items have date_completed === null', () => {
    const items: Pick<MediaItem, 'date_completed'>[] = [
      { date_completed: null },
      { date_completed: null },
    ]
    expect(groupByMonth(items)).toEqual([])
  })

  it('groups items by YYYY-MM correctly', () => {
    const items: Pick<MediaItem, 'date_completed'>[] = [
      { date_completed: '2025-03-15' },
      { date_completed: '2025-03-22' },
      { date_completed: '2025-04-01' },
    ]
    expect(groupByMonth(items)).toEqual([
      { month: '2025-03', count: 2 },
      { month: '2025-04', count: 1 },
    ])
  })

  it('sorts results ascending by month', () => {
    const items: Pick<MediaItem, 'date_completed'>[] = [
      { date_completed: '2025-04-01' },
      { date_completed: '2025-01-15' },
      { date_completed: '2025-03-22' },
    ]
    const result = groupByMonth(items)
    expect(result.map((r) => r.month)).toEqual(['2025-01', '2025-03', '2025-04'])
  })
})

describe('countGenres', () => {
  it('returns empty array for empty input', () => {
    expect(countGenres([])).toEqual([])
  })

  it('returns empty array when all items have genre === null', () => {
    const items: Pick<MediaItem, 'genre'>[] = [{ genre: null }, { genre: null }]
    expect(countGenres(items)).toEqual([])
  })

  it('parses comma-separated and trims whitespace', () => {
    const items: Pick<MediaItem, 'genre'>[] = [
      { genre: 'Action, Drama' },
      { genre: 'Action,Comedy' },
    ]
    const result = countGenres(items)
    const actionEntry = result.find((r) => r.genre === 'Action')
    const dramaEntry = result.find((r) => r.genre === 'Drama')
    const comedyEntry = result.find((r) => r.genre === 'Comedy')
    expect(actionEntry?.count).toBe(2)
    expect(dramaEntry?.count).toBe(1)
    expect(comedyEntry?.count).toBe(1)
    // sorted desc by count
    expect(result[0].genre).toBe('Action')
  })

  it('skips N/A and empty segments', () => {
    const items: Pick<MediaItem, 'genre'>[] = [
      { genre: 'N/A' },
      { genre: 'Action,' },
      { genre: '  ,Drama' },
    ]
    const result = countGenres(items)
    expect(result.find((r) => r.genre === 'N/A')).toBeUndefined()
    expect(result.find((r) => r.genre === '')).toBeUndefined()
    const actionEntry = result.find((r) => r.genre === 'Action')
    const dramaEntry = result.find((r) => r.genre === 'Drama')
    expect(actionEntry?.count).toBe(1)
    expect(dramaEntry?.count).toBe(1)
  })

  it('limits result to top 10 genres when more exist', () => {
    const genres = ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9', 'G10', 'G11', 'G12']
    const items: Pick<MediaItem, 'genre'>[] = genres.map((g) => ({ genre: g }))
    const result = countGenres(items)
    expect(result.length).toBe(10)
  })
})

describe('ratingDistribution', () => {
  it('returns 10 buckets even for empty input', () => {
    const result = ratingDistribution([])
    expect(result.length).toBe(10)
    result.forEach((bucket) => expect(bucket.count).toBe(0))
  })

  it('excludes items with user_rating === null', () => {
    const items: Pick<MediaItem, 'user_rating'>[] = [{ user_rating: null }, { user_rating: null }]
    const result = ratingDistribution(items)
    result.forEach((bucket) => expect(bucket.count).toBe(0))
  })

  it('counts correctly for various ratings', () => {
    const items: Pick<MediaItem, 'user_rating'>[] = [
      { user_rating: 1 },
      { user_rating: 1 },
      { user_rating: 5 },
      { user_rating: 10 },
    ]
    const result = ratingDistribution(items)
    expect(result.find((r) => r.rating === 1)?.count).toBe(2)
    expect(result.find((r) => r.rating === 5)?.count).toBe(1)
    expect(result.find((r) => r.rating === 10)?.count).toBe(1)
    expect(result.find((r) => r.rating === 3)?.count).toBe(0)
  })

  it('bucket order is ascending 1..10', () => {
    const result = ratingDistribution([])
    expect(result.map((r) => r.rating)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })
})

describe('topGenreWithReason', () => {
  it('returns null for empty input', () => {
    expect(topGenreWithReason([])).toBeNull()
  })

  it('returns null when all items have genre === null', () => {
    const items: Pick<MediaItem, 'genre' | 'user_rating' | 'status'>[] = [
      { genre: null, user_rating: 8, status: 'completed' },
    ]
    expect(topGenreWithReason(items)).toBeNull()
  })

  it('weights completed items by user_rating', () => {
    const items: Pick<MediaItem, 'genre' | 'user_rating' | 'status'>[] = [
      { status: 'completed', user_rating: 10, genre: 'Action' },
      { status: 'completed', user_rating: 6, genre: 'Drama' },
    ]
    const result = topGenreWithReason(items)
    expect(result?.genre).toBe('Action')
  })

  it('reason string format must equal "Because you love {Genre}"', () => {
    const items: Pick<MediaItem, 'genre' | 'user_rating' | 'status'>[] = [
      { status: 'completed', user_rating: 10, genre: 'Action' },
    ]
    const result = topGenreWithReason(items)
    expect(result?.reason).toBe('Because you love Action')
  })

  it('non-completed items get weight 3', () => {
    const items: Pick<MediaItem, 'genre' | 'user_rating' | 'status'>[] = [
      { status: 'watchlist', user_rating: null, genre: 'Comedy' },
    ]
    const result = topGenreWithReason(items)
    expect(result).toEqual({ genre: 'Comedy', reason: 'Because you love Comedy' })
  })
})
