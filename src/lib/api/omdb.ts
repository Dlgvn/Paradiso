export interface OmdbSearchResult {
  imdbID: string
  Title: string
  Year: string
  Type: 'movie' | 'series'
  Poster: string // URL or "N/A"
}

export interface OmdbDetailResult {
  imdbId: string
  title: string
  year: string | null
  genre: string | null
  director: string | null
  plot: string | null
  posterUrl: string | null
  imdbRating: string | null
  type: 'movie' | 'series'
  totalSeasons: number | null
}

export interface OmdbEpisode {
  episode: number
  title: string
}

export async function searchOmdb(
  title: string,
  type: 'movie' | 'series'
): Promise<{ results: OmdbSearchResult[]; error?: string }> {
  const apiKey = process.env.OMDB_API_KEY
  if (!apiKey) {
    throw new Error('OMDB_API_KEY not configured')
  }

  const url = `https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(title)}&type=${type}`
  const res = await fetch(url, { next: { revalidate: 300 } })
  const data = await res.json()

  if (data.Response === 'False') {
    const notFound =
      data.Error === 'Movie not found!' || data.Error === 'Series not found!'
    return {
      results: [],
      error: notFound ? undefined : data.Error,
    }
  }

  return { results: data.Search ?? [] }
}

export async function getOmdbDetails(
  imdbId: string
): Promise<OmdbDetailResult> {
  const apiKey = process.env.OMDB_API_KEY
  if (!apiKey) {
    throw new Error('OMDB_API_KEY not configured')
  }

  const url = `https://www.omdbapi.com/?apikey=${apiKey}&i=${imdbId}&plot=short`
  const res = await fetch(url, { next: { revalidate: 3600 } })
  const data = await res.json()

  const rawSeasons = data.totalSeasons
  const totalSeasons =
    rawSeasons && rawSeasons !== 'N/A' ? parseInt(rawSeasons, 10) : null

  return {
    imdbId: data.imdbID,
    title: data.Title !== 'N/A' ? data.Title : null,
    year: data.Year !== 'N/A' ? data.Year : null,
    genre: data.Genre !== 'N/A' ? data.Genre : null,
    director: data.Director !== 'N/A' ? data.Director : null,
    plot: data.Plot !== 'N/A' ? data.Plot : null,
    posterUrl: data.Poster !== 'N/A' ? data.Poster : null,
    imdbRating: data.imdbRating !== 'N/A' ? data.imdbRating : null,
    type: data.Type as 'movie' | 'series',
    totalSeasons: isNaN(totalSeasons as number) ? null : totalSeasons,
  }
}

export async function getOmdbSeason(
  imdbId: string,
  season: number
): Promise<OmdbEpisode[]> {
  const apiKey = process.env.OMDB_API_KEY
  if (!apiKey) return []

  const url = `https://www.omdbapi.com/?apikey=${apiKey}&i=${imdbId}&Season=${season}`
  const res = await fetch(url, { next: { revalidate: 300 } })
  const data = await res.json()

  if (data.Response === 'False' || !Array.isArray(data.Episodes)) return []

  return data.Episodes.map((ep: { Episode: string; Title: string }) => ({
    episode: parseInt(ep.Episode, 10),
    title: ep.Title !== 'N/A' ? ep.Title : `Episode ${ep.Episode}`,
  })).filter((ep: OmdbEpisode) => !isNaN(ep.episode))
}
