'use client'

import { useOptimistic, useTransition } from 'react'
import Image from 'next/image'
import { Heart, Star } from 'lucide-react'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { updateItemStatus, toggleFavorite } from '@/app/actions/library'
import type { MediaItem, MediaStatus } from '@/types/media'
import { STATUSES_BY_TYPE, STATUS_LABELS_BY_TYPE } from '@/types/media'

const STATUS_COLORS: Record<MediaStatus, string> = {
  watchlist: 'bg-[#94a3b8]/20 text-[#94a3b8]',
  watching: 'bg-[#3b82f6]/20 text-[#3b82f6]',
  completed: 'bg-[#22c55e]/20 text-[#22c55e]',
  dropped: 'bg-[#6b7280]/20 text-[#6b7280]',
}

interface MediaListItemProps {
  item: MediaItem
  onItemClick?: (item: MediaItem) => void
}

export function MediaListItem({ item, onItemClick }: MediaListItemProps) {
  const [, startTransition] = useTransition()

  const [optimisticStatus, setOptimisticStatus] = useOptimistic(
    item.status,
    (_: MediaStatus, newStatus: MediaStatus) => newStatus
  )

  const [optimisticFavorite, setOptimisticFavorite] = useOptimistic(
    item.is_favorite,
    (_: boolean, newFavorite: boolean) => newFavorite
  )

  function handleStatusChange(newStatus: MediaStatus) {
    startTransition(async () => {
      setOptimisticStatus(newStatus)
      const result = await updateItemStatus(item.id, newStatus)
      if (result?.error) {
        toast("Couldn't save change. Try again.", { duration: 4000 })
      }
    })
  }

  function handleFavoriteToggle() {
    startTransition(async () => {
      const newFavorite = !optimisticFavorite
      setOptimisticFavorite(newFavorite)
      const result = await toggleFavorite(item.id, newFavorite)
      if (result?.error) {
        toast("Couldn't save change. Try again.", { duration: 4000 })
      }
    })
  }

  const ratingStars = item.user_rating ? Math.round(item.user_rating / 2) : 0

  return (
    <div className="group flex items-center gap-3 p-2 rounded-lg hover:bg-[#12121a]/50 transition-colors cursor-pointer" onClick={() => onItemClick?.(item)}>
      {/* Poster thumbnail */}
      <div className="relative w-12 aspect-[2/3] rounded-sm overflow-hidden flex-shrink-0 bg-[#12121a]">
        {item.poster_url ? (
          <Image
            src={item.poster_url}
            alt={item.title}
            fill
            className="object-cover"
            sizes="48px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[#94a3b8] text-[9px] text-center leading-tight px-0.5">
              {item.title.slice(0, 10)}
            </span>
          </div>
        )}
      </div>

      {/* Content area */}
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-[400] text-[#f1f5f9] truncate">{item.title}</p>
        <div className="flex items-center gap-2">
          {item.year && (
            <p className="text-[12px] font-[400] text-[#94a3b8]">{item.year}</p>
          )}
          {item.media_type === 'series' && item.status === 'watching' && item.episodes_watched.length > 0 && (
            <span className="text-[11px] text-[#3b82f6] font-[500]">
              {item.episodes_watched.length} ep
            </span>
          )}
        </div>
      </div>

      {/* Right-aligned controls — visible on hover */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Compact star rating */}
        {item.user_rating ? (
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={12}
                className={i < ratingStars ? 'text-[#eab308] fill-[#eab308]' : 'text-[#94a3b8]'}
              />
            ))}
          </div>
        ) : (
          <span className="text-[11px] text-[#94a3b8]">{item.user_rating ?? '—'}/10</span>
        )}

        {/* Status dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={`text-[11px] font-[400] px-2 py-0.5 rounded-full ${STATUS_COLORS[optimisticStatus]} cursor-pointer`}
              onClick={(e) => e.stopPropagation()}
            >
              {STATUS_LABELS_BY_TYPE[item.media_type][optimisticStatus]}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[#12121a] border-[#94a3b8]/20">
            {STATUSES_BY_TYPE[item.media_type].map((status) => (
              <DropdownMenuItem
                key={status}
                onClick={() => handleStatusChange(status)}
                className="text-[#f1f5f9] text-[13px] cursor-pointer hover:bg-[#1e1e2e] focus:bg-[#1e1e2e]"
              >
                {STATUS_LABELS_BY_TYPE[item.media_type][status]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Favorite toggle — 44px touch target */}
        <button
          onClick={(e) => { e.stopPropagation(); handleFavoriteToggle() }}
          className="flex items-center justify-center w-11 h-11 cursor-pointer"
          aria-label={optimisticFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            size={20}
            className={optimisticFavorite ? 'text-[#ef4444] fill-[#ef4444]' : 'text-[#94a3b8]'}
          />
        </button>
      </div>
    </div>
  )
}
