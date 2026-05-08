'use client'

import Image from 'next/image'
import { useOptimistic, useTransition, useState, useEffect } from 'react'
import { ArrowLeft, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { CinematicSheetBackdrop } from '@/components/detail/CinematicSheetBackdrop'
import { GenrePills } from '@/components/detail/GenrePills'
import { RatingEditor } from '@/components/detail/RatingEditor'
import { DeleteConfirmRow } from '@/components/detail/DeleteConfirmRow'
import { updateItemStatus, toggleEpisodeWatched } from '@/app/actions/library'
import { getSeriesEpisodes } from '@/app/actions/search'
import type { MediaItem, MediaStatus } from '@/types/media'
import { STATUS_LABELS_BY_TYPE, STATUSES_BY_TYPE } from '@/types/media'

const STATUS_COLORS: Record<MediaStatus, string> = {
  watchlist: 'bg-[#3b82f6]/20 text-[#3b82f6] border border-[#3b82f6]/30',
  watching: 'bg-[#3b82f6]/20 text-[#3b82f6] border border-[#3b82f6]/30',
  completed: 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30',
  dropped: 'bg-[#6b7280]/20 text-[#6b7280] border border-[#6b7280]/30',
}

interface ItemDetailSheetProps {
  item: MediaItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface Episode {
  episode: number
  title: string
}

function EpisodeTracker({ item }: { item: MediaItem }) {
  const totalSeasons = item.total_seasons ?? 1
  const [selectedSeason, setSelectedSeason] = useState(1)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [loadingEpisodes, setLoadingEpisodes] = useState(false)
  const [, startTransition] = useTransition()

  // Local optimistic state for watched episodes
  const [watchedSet, setWatchedSet] = useState<Set<string>>(
    () => new Set(item.episodes_watched.map((e) => `${e.season}-${e.episode}`))
  )

  useEffect(() => {
    let cancelled = false
    setLoadingEpisodes(true)
    setEpisodes([])
    getSeriesEpisodes(item.external_id, selectedSeason).then((eps) => {
      if (!cancelled) {
        setEpisodes(eps)
        setLoadingEpisodes(false)
      }
    })
    return () => { cancelled = true }
  }, [item.external_id, selectedSeason])

  function toggleEpisode(episode: number) {
    const key = `${selectedSeason}-${episode}`
    const isWatched = watchedSet.has(key)
    // Optimistic update
    setWatchedSet((prev) => {
      const next = new Set(prev)
      if (isWatched) next.delete(key)
      else next.add(key)
      return next
    })
    startTransition(async () => {
      const result = await toggleEpisodeWatched(item.id, selectedSeason, episode, !isWatched)
      if (result?.error) {
        // Revert optimistic on error
        setWatchedSet((prev) => {
          const next = new Set(prev)
          if (isWatched) next.add(key)
          else next.delete(key)
          return next
        })
        toast("Couldn't save progress. Try again.", { duration: 4000 })
      }
    })
  }

  const totalWatched = watchedSet.size
  const estimatedTotal = totalSeasons * 10
  const progress = Math.min(1, estimatedTotal > 0 ? totalWatched / estimatedTotal : 0)

  const seasonOptions = Array.from({ length: totalSeasons }, (_, i) => i + 1)

  return (
    <section className="px-4 pb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[12px] uppercase tracking-widest text-[#94a3b8]">Progress</h3>
        <span className="text-[11px] text-[#94a3b8]">{totalWatched} episodes watched</span>
      </div>

      {/* Overall progress bar */}
      <div className="w-full h-1 bg-white/10 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-[#3b82f6] rounded-full transition-all duration-300"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Season selector */}
      <div className="flex gap-1.5 flex-wrap mb-3">
        {seasonOptions.map((s) => (
          <button
            key={s}
            onClick={() => setSelectedSeason(s)}
            className={`text-[11px] px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
              s === selectedSeason
                ? 'bg-[#3b82f6]/20 text-[#3b82f6] border border-[#3b82f6]/30'
                : 'bg-white/5 text-[#94a3b8] border border-white/10 hover:border-white/20'
            }`}
          >
            S{s}
          </button>
        ))}
      </div>

      {/* Episode list */}
      {loadingEpisodes ? (
        <div className="flex flex-col gap-1.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 bg-white/5 rounded-md animate-pulse" />
          ))}
        </div>
      ) : episodes.length === 0 ? (
        <p className="text-[12px] text-[#94a3b8]">No episode data available</p>
      ) : (
        <div className="flex flex-col gap-1">
          {episodes.map((ep) => {
            const key = `${selectedSeason}-${ep.episode}`
            const watched = watchedSet.has(key)
            return (
              <button
                key={ep.episode}
                onClick={() => toggleEpisode(ep.episode)}
                className={`flex items-center gap-2.5 w-full text-left px-2.5 py-2 rounded-md transition-colors cursor-pointer ${
                  watched
                    ? 'bg-[#3b82f6]/10 hover:bg-[#3b82f6]/15'
                    : 'hover:bg-white/5'
                }`}
              >
                <div
                  className={`flex-shrink-0 w-4 h-4 rounded-sm flex items-center justify-center transition-colors ${
                    watched ? 'bg-[#3b82f6]' : 'bg-white/10 border border-white/20'
                  }`}
                >
                  {watched && <Check size={10} strokeWidth={3} className="text-white" />}
                </div>
                <span className={`text-[13px] ${watched ? 'text-[#f1f5f9]' : 'text-[#94a3b8]'}`}>
                  E{ep.episode}: {ep.title}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </section>
  )
}

function DetailContent({ item, onOpenChange }: { item: MediaItem; onOpenChange: (open: boolean) => void }) {
  const [, startTransition] = useTransition()
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(
    item.status,
    (_: MediaStatus, next: MediaStatus) => next
  )

  function handleStatusChange(newStatus: MediaStatus) {
    if (newStatus === optimisticStatus) return
    startTransition(async () => {
      setOptimisticStatus(newStatus)
      const result = await updateItemStatus(item.id, newStatus)
      if (result?.error) {
        toast("Couldn't save change. Try again.", { duration: 4000 })
      }
    })
  }

  return (
    <>
      <CinematicSheetBackdrop posterUrl={item.poster_url ?? null} alt={item.title} />

      <div className="relative z-10">
        {/* Back button */}
        <button
          onClick={() => onOpenChange(false)}
          className="flex items-center gap-1.5 text-[#94a3b8] hover:text-[#f1f5f9] transition-colors px-4 pt-2 pb-1"
        >
          <ArrowLeft size={16} />
          <span className="text-[13px]">Back</span>
        </button>

        {/* Header section */}
        <section className="flex gap-6 pt-2 px-4 pb-4">
          {/* Poster thumbnail */}
          <div className="relative w-[120px] h-[180px] shrink-0 rounded-lg overflow-hidden shadow-2xl">
            {item.poster_url ? (
              <Image
                src={item.poster_url}
                alt={item.title}
                fill
                className="object-cover"
                sizes="120px"
              />
            ) : (
              <div className="absolute inset-0 bg-[#12121a] flex items-center justify-center p-2">
                <span className="text-[#94a3b8] text-xs text-center leading-tight">
                  {item.title}
                </span>
              </div>
            )}
          </div>

          {/* Title block */}
          <div className="flex flex-col justify-end gap-2 min-w-0 flex-1">
            <h2 className="text-[28px] font-[600] text-[#f1f5f9] leading-[1.15] line-clamp-2">
              {item.title}
            </h2>
            {item.year && (
              <p className="text-[12px] font-[400] text-[#94a3b8]">{item.year}</p>
            )}
            {item.external_rating && (
              <p className="text-[12px] font-[400] text-[#94a3b8]">
                External Rating: {item.external_rating}
              </p>
            )}

            {/* Inline status selector */}
            <div className="flex flex-wrap gap-1.5 mt-0.5">
              {STATUSES_BY_TYPE[item.media_type].map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className={`text-[11px] px-2.5 py-1 rounded-full transition-all duration-150 ${
                    s === optimisticStatus
                      ? STATUS_COLORS[s]
                      : 'bg-white/5 text-[#94a3b8] border border-white/10 hover:border-white/20'
                  }`}
                >
                  {STATUS_LABELS_BY_TYPE[item.media_type][s]}
                </button>
              ))}
            </div>

            <GenrePills genre={item.genre} />
          </div>
        </section>

        {/* Director / Author metadata */}
        {(item.director || item.author) && (
          <section className="grid grid-cols-2 gap-4 px-4 pb-4">
            {item.director && (
              <div>
                <dt className="text-[12px] uppercase tracking-wider text-[#94a3b8]">Director</dt>
                <dd className="text-[14px] text-[#f1f5f9] mt-1">{item.director}</dd>
              </div>
            )}
            {item.author && (
              <div>
                <dt className="text-[12px] uppercase tracking-wider text-[#94a3b8]">Author</dt>
                <dd className="text-[14px] text-[#f1f5f9] mt-1">{item.author}</dd>
              </div>
            )}
          </section>
        )}

        {/* Synopsis */}
        {item.plot && (
          <section className="px-4 pb-4">
            <h3 className="text-[12px] uppercase tracking-widest text-[#94a3b8] mb-2">Synopsis</h3>
            <p className="text-[14px] font-[400] text-[#f1f5f9]/80 leading-relaxed">{item.plot}</p>
          </section>
        )}

        {/* Episode tracker — series in watching status only */}
        {item.media_type === 'series' && optimisticStatus === 'watching' && (
          <EpisodeTracker item={item} />
        )}

        {/* Rating editor */}
        <section className="px-4 pb-4">
          <RatingEditor
            itemId={item.id}
            currentRating={item.user_rating}
            mediaType={item.media_type}
          />
        </section>

        {/* Delete section */}
        <section className="px-4 pb-8">
          <DeleteConfirmRow
            itemId={item.id}
            mediaType={item.media_type}
            onDeleted={() => onOpenChange(false)}
          />
        </section>
      </div>
    </>
  )
}

export function ItemDetailSheet({ item, open, onOpenChange }: ItemDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[85vh] max-h-[90vh] lg:max-w-[640px] lg:mx-auto rounded-t-2xl border-0 bg-black/95 p-0 overflow-y-auto overflow-x-hidden [&>button]:hidden"
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-12 h-1 rounded-full bg-white/20" />
        </div>

        {item && <DetailContent item={item} onOpenChange={onOpenChange} />}
      </SheetContent>
    </Sheet>
  )
}
