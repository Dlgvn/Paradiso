'use client'

import { useOptimistic, useTransition, useRef, useState } from 'react'
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

interface MediaCardProps {
  item: MediaItem
  onItemClick?: (item: MediaItem) => void
}

export function MediaCard({ item, onItemClick }: MediaCardProps) {
  const [, startTransition] = useTransition()
  const [imgError, setImgError] = useState(false)

  // 80ms mouseleave debounce to prevent overlay flicker when cursor moves into dropdown
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [overlayVisible, setOverlayVisible] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  function handleMouseEnter() {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
    setOverlayVisible(true)
  }

  function handleMouseLeave() {
    // Don't hide while the dropdown portal is open — it lives outside this div
    if (dropdownOpen) return
    hideTimerRef.current = setTimeout(() => {
      setOverlayVisible(false)
    }, 80)
  }

  const [ratingHovered, setRatingHovered] = useState(false)

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
        // Optimistic state will revert automatically when transition ends without revalidation
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
    <div
      className="relative overflow-hidden rounded-lg aspect-[2/3] group cursor-pointer"
      onClick={() => onItemClick?.(item)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Poster */}
      {item.poster_url && !imgError ? (
        <Image
          src={item.poster_url}
          alt={item.title}
          fill
          className="object-cover"
          onError={() => setImgError(true)}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16.67vw"
        />
      ) : (
        <div className="absolute inset-0 bg-[#12121a] flex items-center justify-center p-2">
          <span className="text-[#94a3b8] text-xs text-center leading-tight">
            {item.title}
          </span>
        </div>
      )}

      {/* Hover overlay — JS-controlled with debounce, CSS group-hover as fallback */}
      <div
        className={`absolute inset-0 transition-opacity duration-[180ms] ease-out flex flex-col justify-end p-2 ${
          overlayVisible ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
        style={{ backgroundColor: 'rgba(18,18,26,0.72)', backdropFilter: 'blur(12px)' }}
      >
        {/* Title */}
        <p className="text-[14px] font-[400] text-[#f1f5f9] leading-tight line-clamp-2 mb-0.5">
          {item.title}
        </p>

        {/* Year */}
        {item.year && (
          <p className="text-[12px] font-[400] text-[#94a3b8] mb-1">{item.year}</p>
        )}

        {/* Star rating */}
        <div
          className="flex items-center gap-0.5 mb-2"
          onMouseEnter={() => item.user_rating && setRatingHovered(true)}
          onMouseLeave={() => setRatingHovered(false)}
        >
          {item.user_rating ? (
            ratingHovered ? (
              <span className="text-[13px] font-[600] text-[#eab308]">{item.user_rating}/10</span>
            ) : (
              Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < ratingStars ? 'text-[#eab308] fill-[#eab308]' : 'text-[#94a3b8]'}
                />
              ))
            )
          ) : (
            <span className="text-[11px] text-[#94a3b8]">Not rated</span>
          )}
        </div>

        {/* Bottom row: status dropdown + favorite */}
        <div className="flex items-center justify-between">
          <DropdownMenu
            open={dropdownOpen}
            onOpenChange={(open) => {
              setDropdownOpen(open)
              if (open) setOverlayVisible(true)
            }}
          >
            <DropdownMenuTrigger asChild>
              <button
                className={`text-[11px] font-[400] px-2 py-0.5 rounded-full ${STATUS_COLORS[optimisticStatus]} cursor-pointer`}
                onClick={(e) => e.stopPropagation()}
              >
                {STATUS_LABELS_BY_TYPE[item.media_type][optimisticStatus]}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-[#12121a] border-[#94a3b8]/20">
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
            className="flex items-center justify-center w-11 h-11 -mr-1 -mb-1 cursor-pointer"
            aria-label={optimisticFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              size={20}
              className={optimisticFavorite ? 'text-[#ef4444] fill-[#ef4444]' : 'text-[#94a3b8]'}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
