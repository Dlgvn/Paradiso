'use server'

import { searchOmdb, getOmdbDetails, getOmdbSeason } from '@/lib/api/omdb'
import { searchOpenLibrary } from '@/lib/api/open-library'

export async function searchMovies(query: string) {
  if (!query || typeof query !== 'string' || query.trim() === '') {
    return { results: [], error: 'Query cannot be empty' }
  }
  return searchOmdb(query.trim(), 'movie')
}

export async function searchSeries(query: string) {
  if (!query || typeof query !== 'string' || query.trim() === '') {
    return { results: [], error: 'Query cannot be empty' }
  }
  return searchOmdb(query.trim(), 'series')
}

export async function getMovieDetails(imdbId: string) {
  return getOmdbDetails(imdbId)
}

export async function getSeriesEpisodes(imdbId: string, season: number) {
  if (!imdbId || season < 1) return []
  return getOmdbSeason(imdbId, season)
}

export async function searchBooks(query: string) {
  if (!query || typeof query !== 'string' || query.trim() === '') {
    return { results: [], error: 'Query cannot be empty' }
  }
  return searchOpenLibrary(query.trim())
}
