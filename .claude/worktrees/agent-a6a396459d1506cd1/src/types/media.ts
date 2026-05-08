export type MediaType = 'movie' | 'book' | 'series'
export type MediaStatus = 'watchlist' | 'watching' | 'completed' | 'dropped'

export interface MediaItem {
  id: string
  user_id: string
  media_type: MediaType
  external_id: string
  title: string
  year: string | null
  genre: string | null
  director: string | null
  author: string | null
  plot: string | null
  poster_url: string | null
  external_rating: string | null
  status: MediaStatus
  user_rating: number | null
  is_favorite: boolean
  date_added: string
  date_completed: string | null
  notes: string | null
}

export interface AddMediaItemInput {
  externalId: string
  mediaType: MediaType
  title: string
  year?: string | null
  genre?: string | null
  director?: string | null
  author?: string | null
  plot?: string | null
  posterUrl?: string | null
  externalRating?: string | null
  status: MediaStatus
  userRating?: number | null
}

export const MEDIA_TYPES: MediaType[] = ['movie', 'book', 'series']
export const MEDIA_STATUSES: MediaStatus[] = ['watchlist', 'watching', 'completed', 'dropped']

export const STATUS_LABELS: Record<MediaStatus, string> = {
  watchlist: 'Watchlist',
  watching: 'Watching',
  completed: 'Completed',
  dropped: 'Dropped',
}

export const MEDIA_TYPE_LABELS: Record<MediaType, string> = {
  movie: 'Movies',
  book: 'Books',
  series: 'Series',
}

export const STATUSES_BY_TYPE: Record<MediaType, MediaStatus[]> = {
  movie: ['watchlist', 'completed'],
  series: ['watchlist', 'watching', 'completed', 'dropped'],
  book: ['watchlist', 'watching', 'completed', 'dropped'],
}

export const STATUS_LABELS_BY_TYPE: Record<MediaType, Record<MediaStatus, string>> = {
  movie: {
    watchlist: 'Watchlist',
    watching: 'Watching',
    completed: 'Completed',
    dropped: 'Dropped',
  },
  series: {
    watchlist: 'Watchlist',
    watching: 'Watching',
    completed: 'Completed',
    dropped: 'Dropped',
  },
  book: {
    watchlist: 'Want to Read',
    watching: 'Reading',
    completed: 'Read',
    dropped: 'Dropped',
  },
}
