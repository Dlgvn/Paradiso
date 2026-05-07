'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { RecommendationCard } from './RecommendationCard'
import {
  getRecommendations,
  type RecommendationCandidate,
} from '@/app/actions/recommendations'

// Lazy import — AddItemDialog uses browser APIs and Sheet/Dialog (heavy)
const AddItemDialog = dynamic(
  () => import('@/components/search/AddItemDialog').then(m => m.AddItemDialog),
  { ssr: false }
)

type LoadState =
  | { status: 'loading' }
  | { status: 'empty' }
  | { status: 'error' }
  | { status: 'ready'; candidates: RecommendationCandidate[] }

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
      } else if (result.error === 'NO_DATA' || result.recommendations.length === 0) {
        setState({ status: 'empty' })
      } else {
        setState({ status: 'ready', candidates: result.recommendations })
      }
    }).catch(() => {
      if (!cancelled) setState({ status: 'error' })
    })
    return () => { cancelled = true }
  }, [reloadKey])

  return (
    <section className="rounded-2xl bg-base-elevated border border-accent-silver/10 p-6">
      <header className="mb-4">
        <h2 className="text-[20px] font-[600] text-white">Recommended for You</h2>
        <p className="text-[14px] font-[400] text-accent-silver mt-1">Based on your top genres and highest-rated titles</p>
      </header>

      {state.status === 'loading' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2].map(i => <Skeleton key={i} className="h-[120px] w-full rounded-xl" />)}
        </div>
      )}

      {state.status === 'empty' && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-[16px] font-[600] text-accent-silver mb-1">Not enough data yet</p>
          <p className="text-[14px] font-[400] text-accent-silver/70 max-w-xs">Complete or rate a few items to unlock recommendations.</p>
        </div>
      )}

      {state.status === 'error' && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-[14px] font-[400] text-accent-silver mb-3">Could not load recommendations. Check your connection and try again.</p>
          <button
            onClick={() => setReloadKey(k => k + 1)}
            className="px-4 py-2 rounded-lg bg-accent text-white text-[13px] font-[500] hover:bg-accent/90 transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {state.status === 'ready' && (
        <div className="md:grid md:grid-cols-3 md:gap-4 flex gap-4 overflow-x-auto md:overflow-visible -mx-2 px-2 md:mx-0 md:px-0">
          {state.candidates.map(c => (
            <RecommendationCard
              key={`${c.mediaType}:${c.externalId}`}
              candidate={c}
              onAdd={setSelected}
            />
          ))}
        </div>
      )}

      {selected && (
        <AddItemDialog
          open={selected !== null}
          onClose={() => setSelected(null)}
          onAdded={() => {
            toast.success(`Added "${selected.title}" to your library`)
            // Remove the added item from the list so the user sees progress
            setState(prev =>
              prev.status === 'ready'
                ? { status: 'ready', candidates: prev.candidates.filter(c => c.externalId !== selected.externalId) }
                : prev
            )
            setSelected(null)
          }}
          item={{
            externalId: selected.externalId,
            mediaType: selected.mediaType,
            title: selected.title,
            year: selected.year,
            posterUrl: selected.posterUrl,
          }}
        />
      )}
    </section>
  )
}
