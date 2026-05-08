'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Star } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { addMediaItem } from '@/app/actions/library'
import type { MediaType, MediaStatus } from '@/types/media'
import { STATUSES_BY_TYPE, STATUS_LABELS_BY_TYPE } from '@/types/media'

interface AddItemDialogProps {
  open: boolean
  onClose: () => void
  onAdded: () => void
  item: {
    externalId: string
    mediaType: MediaType
    title: string
    year?: string | null
    posterUrl?: string | null
    genre?: string | null
    director?: string | null
    author?: string | null
    plot?: string | null
    externalRating?: string | null
    totalSeasons?: number | null
  }
}

function useIsMobile() {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 640
}

function AddItemContent({
  item,
  onClose,
  onAdded,
}: Omit<AddItemDialogProps, 'open'>) {
  const [selectedStatus, setSelectedStatus] = useState<MediaStatus>('watchlist')
  const [selectedRating, setSelectedRating] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleAdd() {
    setIsLoading(true)
    setErrorMsg(null)

    const result = await addMediaItem({
      externalId: item.externalId,
      mediaType: item.mediaType,
      title: item.title,
      status: selectedStatus,
      userRating: selectedRating ?? undefined,
      year: item.year,
      genre: item.genre,
      director: item.director,
      author: item.author,
      plot: item.plot,
      posterUrl: item.posterUrl,
      externalRating: item.externalRating,
      totalSeasons: item.totalSeasons,
    })

    setIsLoading(false)

    if ('error' in result && result.error) {
      setErrorMsg('Something went wrong adding this item. Try again.')
      return
    }

    onAdded()
    onClose()
  }

  return (
    <div className="space-y-5 px-1">
      {/* Header: poster + title + year */}
      <div className="flex items-start gap-3">
        {item.posterUrl ? (
          <div className="relative w-[60px] h-[90px] flex-shrink-0 rounded overflow-hidden">
            <Image
              src={item.posterUrl}
              alt={item.title}
              fill
              className="object-cover"
              sizes="60px"
              unoptimized={item.posterUrl?.includes('openlibrary.org')}
            />
          </div>
        ) : (
          <div className="w-[60px] h-[90px] flex-shrink-0 bg-[#12121a] rounded flex items-center justify-center">
            <span className="text-[#94a3b8] text-[10px] text-center leading-tight px-1">
              {item.title}
            </span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-[20px] font-[600] text-[#f1f5f9] leading-tight">
            {item.title}
          </h3>
          {item.year && (
            <p className="text-[12px] font-[400] text-[#94a3b8] mt-0.5">{item.year}</p>
          )}
        </div>
      </div>

      {/* Status selector */}
      <div>
        <p className="text-[14px] font-[400] text-[#94a3b8] mb-2">Status</p>
        <div className="flex flex-wrap gap-2">
          {STATUSES_BY_TYPE[item.mediaType].map((status) => (
            <button
              key={status}
              disabled={isLoading}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-[400] transition-colors cursor-pointer ${
                selectedStatus === status
                  ? 'bg-[#3b82f6] text-white'
                  : 'bg-[#12121a] text-[#94a3b8] hover:text-[#f1f5f9]'
              }`}
            >
              {STATUS_LABELS_BY_TYPE[item.mediaType][status]}
            </button>
          ))}
        </div>
      </div>

      {/* Rating selector */}
      <div>
        <p className="text-[14px] font-[400] text-[#94a3b8] mb-2">
          Your Rating (optional)
        </p>
        <div className="flex items-center gap-1">
          {Array.from({ length: 10 }).map((_, i) => {
            const starValue = i + 1
            const filled = selectedRating !== null && starValue <= selectedRating
            return (
              <button
                key={i}
                disabled={isLoading}
                onClick={() => setSelectedRating(starValue)}
                className="cursor-pointer p-0.5"
                aria-label={`Rate ${starValue}`}
              >
                <Star
                  size={22}
                  className={
                    filled
                      ? 'text-[#eab308] fill-[#eab308]'
                      : 'text-[#94a3b8]'
                  }
                />
              </button>
            )
          })}
        </div>
        <button
          disabled={isLoading}
          onClick={() => setSelectedRating(null)}
          className="mt-1.5 text-[12px] text-[#94a3b8] hover:text-[#f1f5f9] transition-colors cursor-pointer"
        >
          Skip for now
        </button>
      </div>

      {/* Error */}
      {errorMsg && (
        <p className="text-[13px] text-[#ef4444]">{errorMsg}</p>
      )}

      {/* CTA */}
      <button
        onClick={handleAdd}
        disabled={isLoading}
        className="w-full py-3 rounded-lg bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-60 text-white text-[15px] font-[500] transition-colors cursor-pointer"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            Adding...
          </span>
        ) : (
          'Add to Library'
        )}
      </button>
    </div>
  )
}

export function AddItemDialog({ open, onClose, onAdded, item }: AddItemDialogProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
        <SheetContent side="bottom" className="bg-[#0a0a0f] border-t border-[#94a3b8]/20 px-6 pb-8 pt-6 rounded-t-2xl">
          <SheetHeader className="mb-4">
            <SheetTitle className="sr-only">Add to Library</SheetTitle>
          </SheetHeader>
          <AddItemContent item={item} onClose={onClose} onAdded={onAdded} />
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-[#0a0a0f] border border-[#94a3b8]/20 max-w-[360px] p-6">
        <DialogHeader className="mb-2">
          <DialogTitle className="sr-only">Add to Library</DialogTitle>
        </DialogHeader>
        <AddItemContent item={item} onClose={onClose} onAdded={onAdded} />
      </DialogContent>
    </Dialog>
  )
}
