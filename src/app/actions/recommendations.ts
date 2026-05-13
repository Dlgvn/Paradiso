'use server'

import { createClient } from '@/lib/supabase/server'
import { searchOmdb, getOmdbDetails } from '@/lib/api/omdb'
import { searchOpenLibrary, getOlCoverUrl } from '@/lib/api/open-library'
import { topGenresWithScores } from '@/lib/analytics'
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

  const topGenres = topGenresWithScores(items)
  if (topGenres.length === 0) {
    return { data: null, error: 'NO_DATA' }
  }

  const existingIds = new Set(items.map(i => i.external_id))

  // Pick up to 2 watchlist movies to drive the director bonus lane
  const watchlistMovieIds = items
    .filter(i => i.status === 'watchlist' && i.media_type === 'movie' && i.external_id)
    .slice(0, 2)
    .map(i => i.external_id)

  // Assign genres to media types in a round-robin interleave so each type
  // draws from different genres. With 3 genres [g0, g1, g2]:
  //   movies  → g0, g1
  //   series  → g1, g2
  //   books   → g0, g2  (or g2 if only 1 genre)
  const g = (idx: number) => topGenres[idx % topGenres.length]
  const movieGenres  = [g(0), g(1)].filter((v, i, a) => a.indexOf(v) === i)
  const seriesGenres = [g(1), g(2)].filter((v, i, a) => a.indexOf(v) === i)
  const bookGenres   = [g(0), g(2)].filter((v, i, a) => a.indexOf(v) === i)

  // Search all genre×type combos + fetch watchlist movie details in parallel
  const movieSearches  = movieGenres.map(g  => searchOmdb(g.genre, 'movie'))
  const seriesSearches = seriesGenres.map(g => searchOmdb(g.genre, 'series'))
  const bookSearches   = bookGenres.map(g   => searchOpenLibrary(g.genre))

  const [movieResults, seriesResults, bookResults, watchlistDetailsRes] = await Promise.all([
    Promise.allSettled(movieSearches),
    Promise.allSettled(seriesSearches),
    Promise.allSettled(bookSearches),
    Promise.allSettled(watchlistMovieIds.map(id => getOmdbDetails(id))),
  ])

  // Extract directors from watchlist movies, then search for more by those directors
  const directors = watchlistDetailsRes
    .filter(r => r.status === 'fulfilled')
    .map(r => (r as PromiseFulfilledResult<Awaited<ReturnType<typeof getOmdbDetails>>>).value.director)
    .filter((d): d is string => !!d)

  const directorSearchRes = await Promise.allSettled(
    directors.map(d => searchOmdb(d, 'movie'))
  )

  // Collect IDs interleaved across genres, deduplicating seen IDs
  function collectIds(
    results: PromiseSettledResult<Awaited<ReturnType<typeof searchOmdb>>>[],
    limit: number
  ): string[] {
    const seen = new Set<string>()
    const ids: string[] = []
    let round = 0
    while (ids.length < limit) {
      let added = false
      for (const res of results) {
        if (res.status !== 'fulfilled' || res.value.error) continue
        const item = res.value.results[round]
        if (!item) continue
        if (!existingIds.has(item.imdbID) && !seen.has(item.imdbID)) {
          seen.add(item.imdbID)
          ids.push(item.imdbID)
          added = true
          if (ids.length >= limit) break
        }
      }
      round++
      if (!added) break
    }
    return ids
  }

  const movieIds  = collectIds(movieResults, 4)
  const seriesIds = collectIds(seriesResults, 4)

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

  // Map each detail result back to its genre's reason
  const movieIdToReason = new Map(
    movieIds.map((id, i) => [id, movieGenres[i % movieGenres.length].reason])
  )
  const seriesIdToReason = new Map(
    seriesIds.map((id, i) => [id, seriesGenres[i % seriesGenres.length].reason])
  )

  // Collect director bonus IDs (1 per director, not already in genre results or library)
  const genreMovieIdSet = new Set(movieIds)
  const directorBonusIds: { id: string; director: string }[] = []
  for (let di = 0; di < directorSearchRes.length; di++) {
    const res = directorSearchRes[di]
    if (res.status !== 'fulfilled' || res.value.error) continue
    for (const r of res.value.results) {
      if (!existingIds.has(r.imdbID) && !genreMovieIdSet.has(r.imdbID)) {
        directorBonusIds.push({ id: r.imdbID, director: directors[di] })
        break
      }
    }
  }

  const directorBonusDetailsRes = await Promise.allSettled(
    directorBonusIds.map(b => getOmdbDetails(b.id))
  )

  const movies: RecommendationCandidate[] = movieDetailsRes
    .filter(r => r.status === 'fulfilled')
    .map(r => {
      const detail = (r as PromiseFulfilledResult<Awaited<ReturnType<typeof getOmdbDetails>>>).value
      return detailToCandidate(detail, movieIdToReason.get(detail.imdbId) ?? topGenres[0].reason)
    })

  // Append director bonus results (up to 2 extra slots)
  for (let di = 0; di < directorBonusDetailsRes.length; di++) {
    const res = directorBonusDetailsRes[di]
    if (res.status !== 'fulfilled') continue
    const detail = res.value
    if (movies.some(m => m.externalId === detail.imdbId)) continue
    movies.push(detailToCandidate(detail, `Because you want to watch films by ${directorBonusIds[di].director}`))
  }

  const series: RecommendationCandidate[] = seriesDetailsRes
    .filter(r => r.status === 'fulfilled')
    .map(r => {
      const detail = (r as PromiseFulfilledResult<Awaited<ReturnType<typeof getOmdbDetails>>>).value
      return detailToCandidate(detail, seriesIdToReason.get(detail.imdbId) ?? topGenres[0].reason)
    })

  // Collect books interleaved across book genres
  const books: RecommendationCandidate[] = []
  const seenBookKeys = new Set<string>()
  let round = 0
  while (books.length < 4) {
    let added = false
    for (let gi = 0; gi < bookResults.length; gi++) {
      const res = bookResults[gi]
      if (res.status !== 'fulfilled' || res.value.error) continue
      const item = res.value.results[round]
      if (!item) continue
      if (!existingIds.has(item.key) && !seenBookKeys.has(item.key)) {
        seenBookKeys.add(item.key)
        books.push({
          externalId: item.key,
          mediaType: 'book',
          title: item.title,
          year: item.first_publish_year ? String(item.first_publish_year) : null,
          posterUrl: item.cover_i ? getOlCoverUrl(item.cover_i, 'M') : null,
          reason: bookGenres[gi % bookGenres.length].reason,
          genre: null,
          director: null,
          author: item.author_name?.[0] ?? null,
          plot: null,
          externalRating: null,
        })
        added = true
        if (books.length >= 4) break
      }
    }
    round++
    if (!added) break
  }

  if (movies.length === 0 && series.length === 0 && books.length === 0) {
    return { data: null, error: 'API_ERROR' }
  }

  return { data: { movies, series, books }, error: null }
}
