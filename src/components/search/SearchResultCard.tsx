'use client'

import Image from 'next/image'
import type { MediaType, MediaStatus } from '@/types/media'
import type { OmdbSearchResult } from '@/lib/api/omdb'
import type { OlSearchResult } from '@/lib/api/open-library'
import { getOlCoverUrl } from '@/lib/api/open-library'

interface SearchResultCardProps {
  result: OmdbSearchResult | OlSearchResult
  mediaType: MediaType
  existingStatus: MediaStatus | null
  onTap: () => void
  isAdded: boolean
}

function isOmdbResult(
  result: OmdbSearchResult | OlSearchResult
): result is OmdbSearchResult {
  return 'imdbID' in result
}

export function SearchResultCard({
  result,
  mediaType: _mediaType, // eslint-disable-line @typescript-eslint/no-unused-vars
  existingStatus,
  onTap,
  isAdded,
}: SearchResultCardProps) {
  const title = isOmdbResult(result) ? result.Title : result.title
  const year = isOmdbResult(result)
    ? result.Year
    : result.first_publish_year?.toString()

  let posterSrc: string | null = null
  if (isOmdbResult(result)) {
    posterSrc = result.Poster !== 'N/A' ? result.Poster : null
  } else {
    posterSrc = result.cover_i ? getOlCoverUrl(result.cover_i, 'M') : null
  }

  return (
    <div
      onClick={onTap}
      className="relative overflow-hidden rounded-lg aspect-[2/3] cursor-pointer group"
    >
      {/* Poster */}
      {posterSrc ? (
        <Image
          src={posterSrc}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16.67vw"
          unoptimized={!isOmdbResult(result)}
        />
      ) : (
        <div className="absolute inset-0 bg-[#12121a] flex items-center justify-center p-2">
          <span className="text-[#94a3b8] text-xs text-center leading-tight">
            {title}
          </span>
        </div>
      )}

      {/* Badge overlay top-right */}
      {isAdded ? (
        <div className="absolute top-1.5 right-1.5 bg-[#22c55e] text-white text-[11px] font-[500] px-2 py-0.5 rounded-full transition-opacity duration-[120ms]">
          Added
        </div>
      ) : existingStatus !== null ? (
        <div className="absolute top-1.5 right-1.5 bg-[#3b82f6] text-white text-[11px] font-[500] px-2 py-0.5 rounded-full">
          In Library
        </div>
      ) : null}

      {/* Bottom info on hover */}
      <div
        className="absolute inset-x-0 bottom-0 opacity-0 group-hover:opacity-100 transition-opacity duration-[180ms] ease-out p-2 pt-6"
        style={{
          background: 'linear-gradient(to top, rgba(18,18,26,0.95) 0%, transparent 100%)',
        }}
      >
        <p className="text-[14px] font-[400] text-[#f1f5f9] leading-tight line-clamp-2">
          {title}
        </p>
        {year && (
          <p className="text-[12px] font-[400] text-[#94a3b8] mt-0.5">{year}</p>
        )}
      </div>
    </div>
  )
}
