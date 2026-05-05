import Link from 'next/link'
import type { MediaStatus } from '@/types/media'

interface EmptyStateProps {
  status: MediaStatus | 'all'
}

type EmptyStateCopy = {
  heading: string
  body: string
  cta: string | null
}

const EMPTY_STATE_COPY: Record<MediaStatus | 'all', EmptyStateCopy> = {
  watchlist: {
    heading: 'Find your next watch',
    body: 'Search for movies, series, or books to build your watchlist.',
    cta: 'Search Now',
  },
  watching: {
    heading: 'Start something new',
    body: 'Nothing in progress yet. Pick something from your watchlist.',
    cta: 'Search Now',
  },
  completed: {
    heading: 'Nothing finished yet — keep going',
    body: 'Items you complete will appear here.',
    cta: 'Search Now',
  },
  dropped: {
    heading: 'Nothing dropped yet',
    body: 'Items you stop tracking will appear here.',
    cta: null,
  },
  all: {
    heading: 'Your library is empty',
    body: 'Search for movies, books, or series to get started.',
    cta: 'Search Now',
  },
}

export function EmptyState({ status }: EmptyStateProps) {
  const copy = EMPTY_STATE_COPY[status]

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] text-center px-8">
      <h2 className="text-[28px] font-[600] text-[#f1f5f9] leading-[1.15]">
        {copy.heading}
      </h2>
      <p className="text-[14px] font-[400] text-[#94a3b8] max-w-md mt-2 leading-[1.5]">
        {copy.body}
      </p>
      {copy.cta && (
        <Link
          href="/search"
          className="mt-6 px-5 py-2.5 rounded-md text-[14px] font-[400] text-white bg-[#3b82f6] hover:bg-[#2563eb] transition-colors"
        >
          {copy.cta}
        </Link>
      )}
    </div>
  )
}
