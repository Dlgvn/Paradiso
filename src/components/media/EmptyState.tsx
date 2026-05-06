import Link from 'next/link'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  mediaType: 'movies' | 'books' | 'series'
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function EmptyState({ mediaType }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] px-6">
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-8 text-center max-w-sm w-full">
        <h2 className="text-[28px] font-semibold leading-tight mb-3">
          Your library is empty
        </h2>
        <p className="text-sm text-accent-silver leading-relaxed mb-6">
          Search for movies, series, or books to start building your collection.
        </p>
        <Button
          asChild
          className="bg-accent hover:bg-accent-muted text-white"
        >
          <Link href="/search">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Link>
        </Button>
      </div>
    </div>
  )
}
