'use client'

import { useOptimistic, useTransition, useState } from 'react'
import { Star } from 'lucide-react'
import { toast } from 'sonner'
import { updateItemRating } from '@/app/actions/library'
import type { MediaType } from '@/types/media'

interface RatingEditorProps {
  itemId: string
  currentRating: number | null
  mediaType: MediaType
}

export function RatingEditor({ itemId, currentRating }: RatingEditorProps) {
  const [, startTransition] = useTransition()
  const [optimisticRating, setOptimisticRating] = useOptimistic(currentRating)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  function handleRate(rating: number | null) {
    startTransition(async () => {
      setOptimisticRating(rating)
      const result = await updateItemRating(itemId, rating)
      if (result?.error) {
        toast("Couldn't save rating. Try again.", { duration: 4000 })
      }
    })
  }

  const displayRating = hoverIndex ?? optimisticRating ?? 0

  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-[#94a3b8] mb-2">Your Rating</p>
      <div
        className="flex items-center"
        onMouseLeave={() => setHoverIndex(null)}
      >
        {Array.from({ length: 10 }).map((_, i) => {
          const starIndex = i + 1
          const isFilled = starIndex <= displayRating
          const isHovering = hoverIndex !== null

          return (
            <button
              key={starIndex}
              className="flex items-center justify-center w-11 h-11 cursor-pointer"
              onMouseEnter={() => setHoverIndex(starIndex)}
              onClick={() => {
                if (optimisticRating === starIndex) {
                  handleRate(null)
                } else {
                  handleRate(starIndex)
                }
              }}
              aria-label={`Rate ${starIndex} out of 10`}
            >
              <Star
                size={24}
                className={
                  isFilled
                    ? isHovering
                      ? 'text-[#eab308]/60 fill-[#eab308]/60'
                      : 'text-[#eab308] fill-[#eab308]'
                    : 'text-[#94a3b8]'
                }
              />
            </button>
          )
        })}
      </div>
      {optimisticRating === null && hoverIndex === null && (
        <span className="text-xs text-[#94a3b8]">Tap to rate</span>
      )}
    </div>
  )
}
