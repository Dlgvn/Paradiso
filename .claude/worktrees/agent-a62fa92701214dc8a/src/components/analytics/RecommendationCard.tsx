'use client'

import Image from 'next/image'
import { Film } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { RecommendationCandidate } from '@/app/actions/recommendations'

interface Props {
  candidate: RecommendationCandidate
  onAdd: (candidate: RecommendationCandidate) => void
}

export function RecommendationCard({ candidate, onAdd }: Props) {
  return (
    <div className="flex gap-3 p-3 bg-base-elevated rounded-xl border border-accent-silver/10 min-w-[260px]">
      {candidate.posterUrl ? (
        <div className="relative w-[80px] h-[120px] flex-shrink-0 rounded overflow-hidden">
          <Image
            src={candidate.posterUrl}
            alt={candidate.title}
            fill
            className="object-cover"
            sizes="80px"
            unoptimized={candidate.mediaType === 'book'}
          />
        </div>
      ) : (
        <div className="w-[80px] h-[120px] flex-shrink-0 bg-base-surface rounded flex items-center justify-center">
          <Film size={28} className="text-accent-silver/40" />
        </div>
      )}
      <div className="flex flex-col flex-1 min-w-0">
        <p className="text-[14px] font-[600] text-white leading-tight line-clamp-2">{candidate.title}</p>
        {candidate.year && (
          <p className="text-[12px] font-[400] text-accent-silver mt-0.5">{candidate.year}</p>
        )}
        {candidate.director && (
          <p className="text-[11px] font-[400] text-accent-silver/70 mt-0.5 truncate">
            Dir. {candidate.director}
          </p>
        )}
        {candidate.author && (
          <p className="text-[11px] font-[400] text-accent-silver/70 mt-0.5 truncate">
            {candidate.author}
          </p>
        )}
        {candidate.genre && (
          <p className="text-[11px] font-[400] text-accent-silver/50 mt-0.5 truncate">{candidate.genre}</p>
        )}
        <p className="text-[11px] font-[400] text-accent/80 mt-1.5 line-clamp-1 italic">{candidate.reason}</p>
        <Button
          variant="default"
          size="sm"
          className="mt-auto w-fit bg-accent hover:bg-accent/90 text-white"
          onClick={() => onAdd(candidate)}
        >
          Add to Library
        </Button>
      </div>
    </div>
  )
}
