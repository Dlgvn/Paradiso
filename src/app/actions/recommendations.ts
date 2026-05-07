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

export interface RecommendationsByType {
  movies: RecommendationCandidate[]
  series: RecommendationCandidate[]
  books: RecommendationCandidate[]
}

export type GetRecommendationsResult =
  | { data: RecommendationsByType; error: null }
  | { data: null; error: 'UNAUTHORIZED' | 'NO_DATA' | 'API_ERROR' }

export async function getRecommendations(): Promise<GetRecommendationsResult> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: 'UNAUTHORIZED' }
  }

  const { data: items, error: dbError } = await supabase
    .from('media_items')
    .select('genre, user_rating, status, external_id, media_type')
    .eq('user_id', user.id)
    .limit(1000)

  if (dbError) {
    return { data: null, error: 'API_ERROR' }
  }
  if (!items || items.length === 0) {
    return { data: null, error: 'NO_DATA' }
  }

  const info = topGenreWithReason(items)
  if (!info) {
    return { data: null, error: 'NO_DATA' }
  }

  const existingIds = new Set(items.map(i => i.external_id))

  // Parallel fetch: movies, series, books — all keyed by top genre
  const [movieSearchRes, seriesSearchRes, bookSearchRes] = await Promise.allSettled([
    searchOmdb(info.genre, 'movie'),
    searchOmdb(info.genre, 'series'),
    searchOpenLibrary(info.genre),
  ])

  // Collect up to 3 imdbIDs each for movies and series, then fetch full details
  const movieIds: string[] = []
  if (movieSearchRes.status === 'fulfilled' && !movieSearchRes.value.error) {
    for (const r of movieSearchRes.value.results) {
      if (existingIds.has(r.imdbID)) continue
      movieIds.push(r.imdbID)
      if (movieIds.length >= 3) break
    }
  }

  const seriesIds: string[] = []
  if (seriesSearchRes.status === 'fulfilled' && !seriesSearchRes.value.error) {
    for (const r of seriesSearchRes.value.results) {
      if (existingIds.has(r.imdbID)) continue
      seriesIds.push(r.imdbID)
      if (seriesIds.length >= 3) break
    }
  }

  const [movieDetailsRes, seriesDetailsRes] = await Promise.all([
    Promise.allSettled(movieIds.map(id => getOmdbDetails(id))),
    Promise.allSettled(seriesIds.map(id => getOmdbDetails(id))),
  ])

  function detailToCandidate(d: Awaited<ReturnType<typeof getOmdbDetails>>, reason: string): RecommendationCandidate {
    return {
      externalId: d.imdbId,
      mediaType: d.type,
      title: d.title ?? '',
      year: d.year,
      posterUrl: d.posterUrl,
      reason,
      genre: d.genre,
      director: d.director,
      author: null,
      plot: d.plot,
      externalRating: d.imdbRating,
    }
  }

  const movies: RecommendationCandidate[] = movieDetailsRes
    .filter(r => r.status === 'fulfilled')
    .map(r => detailToCandidate((r as PromiseFulfilledResult<Awaited<ReturnType<typeof getOmdbDetails>>>).value, info.reason))

  const series: RecommendationCandidate[] = seriesDetailsRes
    .filter(r => r.status === 'fulfilled')
    .map(r => detailToCandidate((r as PromiseFulfilledResult<Awaited<ReturnType<typeof getOmdbDetails>>>).value, info.reason))

  const books: RecommendationCandidate[] = []
  if (bookSearchRes.status === 'fulfilled' && !bookSearchRes.value.error) {
    for (const r of bookSearchRes.value.results) {
      if (existingIds.has(r.key)) continue
      books.push({
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
      if (books.length >= 3) break
    }
  }

  if (movies.length === 0 && series.length === 0 && books.length === 0) {
    return { data: null, error: 'API_ERROR' }
  }

  return { data: { movies, series, books }, error: null }
}
