'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { RecommendationCard } from './RecommendationCard'
import {
  getRecommendations,
  type RecommendationCandidate,
  type RecommendationsByType,
} from '@/app/actions/recommendations'

const AddItemDialog = dynamic(
  () => import('@/components/search/AddItemDialog').then(m => m.AddItemDialog),
  { ssr: false }
)

type LoadState =
  | { status: 'loading' }
  | { status: 'empty' }
  | { status: 'error' }
  | { status: 'ready'; data: RecommendationsByType }

function SectionRow({
  title,
  items,
  onAdd,
}: {
  title: string
  items: RecommendationCandidate[]
  onAdd: (c: RecommendationCandidate) => void
}) {
  if (items.length === 0) return null
  return (
    <div>
      <h3 className="text-[16px] font-[600] text-white mb-3">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(c => (
          <RecommendationCard
            key={`${c.mediaType}:${c.externalId}`}
            candidate={c}
            onAdd={onAdd}
          />
        ))}
      </div>
    </div>
  )
}

export function RecommendationsSection() {
  const [state, setState] = useState<LoadState>({ status: 'loading' })
  const [selected, setSelected] = useState<RecommendationCandidate | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState({ status: 'loading' })
    getRecommendations().then(result => {
      if (cancelled) return
      if (result.error === 'UNAUTHORIZED' || result.error === 'API_ERROR') {
        setState({ status: 'error' })
      } else if (result.error === 'NO_DATA') {
        setState({ status: 'empty' })
      } else if (result.data) {
        const { movies, series, books } = result.data
        if (movies.length === 0 && series.length === 0 && books.length === 0) {
          setState({ status: 'empty' })
        } else {
          setState({ status: 'ready', data: result.data })
        }
      } else {
        setState({ status: 'empty' })
      }
    }).catch(() => {
      if (!cancelled) setState({ status: 'error' })
    })
    return () => { cancelled = true }
  }, [reloadKey])

  function handleAdded(candidate: RecommendationCandidate) {
    toast.success(`Added "${candidate.title}" to your library`)
    setState(prev => {
      if (prev.status !== 'ready') return prev
      const filter = (list: RecommendationCandidate[]) =>
        list.filter(c => c.externalId !== candidate.externalId)
      return {
        status: 'ready',
        data: {
          movies: filter(prev.data.movies),
          series: filter(prev.data.series),
          books: filter(prev.data.books),
        },
      }
    })
    setSelected(null)
  }

  return (
    <div className="flex flex-col gap-8">
      {state.status === 'loading' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-[140px] w-full rounded-xl" />
          ))}
        </div>
      )}

      {state.status === 'empty' && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-[16px] font-[600] text-accent-silver mb-1">Not enough data yet</p>
          <p className="text-[14px] font-[400] text-accent-silver/70 max-w-xs">
            Complete or rate a few items to unlock recommendations.
          </p>
        </div>
      )}

      {state.status === 'error' && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-[14px] font-[400] text-accent-silver mb-3">
            Could not load recommendations. Check your connection and try again.
          </p>
          <button
            onClick={() => setReloadKey(k => k + 1)}
            className="px-4 py-2 rounded-lg bg-accent text-white text-[13px] font-[500] hover:bg-accent/90 transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {state.status === 'ready' && (
        <>
          <SectionRow title="Movies" items={state.data.movies} onAdd={setSelected} />
          <SectionRow title="Series" items={state.data.series} onAdd={setSelected} />
          <SectionRow title="Books" items={state.data.books} onAdd={setSelected} />
        </>
      )}

      {selected && (
        <AddItemDialog
          open
          onClose={() => setSelected(null)}
          onAdded={() => handleAdded(selected)}
          item={{
            externalId: selected.externalId,
            mediaType: selected.mediaType,
            title: selected.title,
            year: selected.year,
            posterUrl: selected.posterUrl,
            genre: selected.genre,
            director: selected.director,
            author: selected.author,
            plot: selected.plot,
            externalRating: selected.externalRating,
          }}
        />
      )}
    </div>
  )
}
