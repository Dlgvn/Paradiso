'use client'

import Image from 'next/image'

interface CinematicSheetBackdropProps {
  posterUrl: string | null
  alt: string
}

export function CinematicSheetBackdrop({ posterUrl, alt }: CinematicSheetBackdropProps) {
  if (!posterUrl) {
    return (
      <div className="absolute inset-0 bg-gradient-to-b from-[#16162a] via-[#0a0a0f] to-black" />
    )
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      <Image
        src={posterUrl}
        alt={alt}
        fill
        sizes="100vw"
        className="object-cover object-center"
        loading="eager"
        quality={60}
      />
      <div className="absolute inset-0 backdrop-blur-xl bg-black/60" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/80 to-transparent" />
    </div>
  )
}
