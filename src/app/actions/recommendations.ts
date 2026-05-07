'use server'

import { createClient } from '@/lib/supabase/server'
import { searchOmdb, getOmdbDetails } from '@/lib/api/omdb'
import { searchOpenLibrary, getOlCoverUrl } from '@/lib/api/open-library'
import { topGenreWithReason } from '@/lib/analytics'
import type { MediaType } from '@/types/media'

export interface RecommendationCandidate {
  externalId: string         // imdbID for movies/series, work key for books
  mediaType: MediaType
  title: string
  year: string | null
  posterUrl: string | null
  reason: string
  genre: string | null
  director: string | null
  author: string | null
  plot: string | null
  externalRating: string | null
}

export type GetRecommendationsResult =
  | { recommendations: RecommendationCandidate[]; error: null }
  | { recommendations: []; error: 'UNAUTHORIZED' | 'NO_DATA' | 'API_ERROR' }

export async function getRecommendations(): Promise<GetRecommendationsResult> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { recommendations: [], error: 'UNAUTHORIZED' }
  }

  const { data: items, error: dbError } = await supabase
    .from('media_items')
    .select('genre, user_rating, status, external_id, media_type')
    .eq('user_id', user.id)
    .limit(1000)

  if (dbError) {
    return { recommendations: [], error: 'API_ERROR' }
  }
  if (!items || items.length === 0) {
    return { recommendations: [], error: 'NO_DATA' }
  }

  const info = topGenreWithReason(items)
  if (!info) {
    return { recommendations: [], error: 'NO_DATA' }
  }

  const existingIds = new Set(items.map(i => i.external_id))

  // Parallel fetch: OMDB movies + Open Library books, both keyed by top genre
  const [movieResults, bookResults] = await Promise.allSettled([
    searchOmdb(info.genre, 'movie'),
    searchOpenLibrary(info.genre),
  ])

  const candidates: RecommendationCandidate[] = []

  // Up to 3 movie candidates — collect imdbIDs first, then fetch details in parallel
  const movieImdbIds: string[] = []
  if (movieResults.status === 'fulfilled' && !movieResults.value.error) {
    for (const r of movieResults.value.results) {
      if (existingIds.has(r.imdbID)) continue
      movieImdbIds.push(r.imdbID)
      if (movieImdbIds.length >= 3) break
    }
  }

  const movieDetails = await Promise.allSettled(movieImdbIds.map(id => getOmdbDetails(id)))

  for (const result of movieDetails) {
    if (result.status !== 'fulfilled') continue
    const d = result.value
    candidates.push({
      externalId: d.imdbId,
      mediaType: d.type,
      title: d.title ?? '',
      year: d.year,
      posterUrl: d.posterUrl,
      reason: info.reason,
      genre: d.genre,
      director: d.director,
      author: null,
      plot: d.plot,
      externalRating: d.imdbRating,
    })
  }

  // Up to 2 book candidates
  if (bookResults.status === 'fulfilled' && !bookResults.value.error) {
    for (const r of bookResults.value.results) {
      if (existingIds.has(r.key)) continue
      candidates.push({
        externalId: r.key,
        mediaType: 'book',
        title: r.title,
        year: r.first_publish_year ? String(r.first_publish_year) : null,
        posterUrl: r.cover_i ? getOlCoverUrl(r.cover_i, 'M') : null,
        reason: info.reason,
        genre: null,
        director: null,
        author: r.author_name?.[0] ?? null,
        plot: null,
        externalRating: null,
      })
      if (candidates.filter(c => c.mediaType === 'book').length >= 2) break
    }
  }

  // Hard cap: 5 total per D-06 ("3-5 recommendation cards")
  const finalCandidates = candidates.slice(0, 5)

  // If both API calls failed entirely → API_ERROR
  if (
    finalCandidates.length === 0 &&
    movieResults.status === 'rejected' &&
    bookResults.status === 'rejected'
  ) {
    return { recommendations: [], error: 'API_ERROR' }
  }

  return { recommendations: finalCandidates, error: null }
}
