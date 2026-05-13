import type { MediaItem } from '@/types/media'

export function groupByMonth(
  items: Pick<MediaItem, 'date_completed'>[]
): { month: string; count: number }[] {
  const counts: Record<string, number> = {}
  for (const item of items) {
    if (item.date_completed == null) continue
    const month = item.date_completed.slice(0, 7)
    counts[month] = (counts[month] ?? 0) + 1
  }
  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }))
}

export function countGenres(
  items: Pick<MediaItem, 'genre'>[]
): { genre: string; count: number }[] {
  const counts: Record<string, number> = {}
  for (const item of items) {
    if (item.genre == null) continue
    for (const segment of item.genre.split(',')) {
      const genre = segment.trim()
      if (genre === '' || genre === 'N/A') continue
      counts[genre] = (counts[genre] ?? 0) + 1
    }
  }
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([genre, count]) => ({ genre, count }))
}

export function ratingDistribution(
  items: Pick<MediaItem, 'user_rating'>[]
): { rating: number; count: number }[] {
  const dist = Array.from({ length: 10 }, (_, i) => ({ rating: i + 1, count: 0 }))
  for (const item of items) {
    if (item.user_rating == null) continue
    if (item.user_rating >= 1 && item.user_rating <= 10) {
      dist[item.user_rating - 1].count++
    }
  }
  return dist
}

export interface GenreScore {
  genre: string
  score: number
  reason: string
}

export function topGenresWithScores(
  items: Pick<MediaItem, 'genre' | 'user_rating' | 'status'>[],
  limit = 3
): GenreScore[] {
  const scores: Record<string, number> = {}
  for (const item of items) {
    if (item.genre == null) continue
    const rating = item.user_rating ?? 6
    // rating² ÷ 10 amplifies high ratings; in-progress items get a flat 3
    const weight = item.status === 'completed' ? (rating * rating) / 10 : 3
    for (const segment of item.genre.split(',')) {
      const genre = segment.trim()
      if (genre === '' || genre === 'N/A') continue
      scores[genre] = (scores[genre] ?? 0) + weight
    }
  }
  const entries = Object.entries(scores)
  if (entries.length === 0) return []
  entries.sort(([, a], [, b]) => b - a)
  return entries.slice(0, limit).map(([genre]) => ({
    genre,
    score: scores[genre],
    reason: `Because you love ${genre}`,
  }))
}

/** @deprecated use topGenresWithScores */
export function topGenreWithReason(
  items: Pick<MediaItem, 'genre' | 'user_rating' | 'status'>[]
): { genre: string; reason: string } | null {
  const results = topGenresWithScores(items, 1)
  if (results.length === 0) return null
  return { genre: results[0].genre, reason: results[0].reason }
}
