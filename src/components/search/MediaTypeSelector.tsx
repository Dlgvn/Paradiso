'use client'

import type { MediaType } from '@/types/media'

interface MediaTypeSelectorProps {
  activeType: MediaType
  onChange: (type: MediaType) => void
}

const TYPES: { value: MediaType; label: string }[] = [
  { value: 'movie', label: 'Movies' },
  { value: 'book', label: 'Books' },
  { value: 'series', label: 'Series' },
]

export function MediaTypeSelector({ activeType, onChange }: MediaTypeSelectorProps) {
  return (
    <div className="flex gap-1 p-1 bg-[#12121a] rounded-full w-fit">
      {TYPES.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={`px-4 py-1.5 rounded-full text-[13px] font-[400] transition-colors duration-120 cursor-pointer ${
            activeType === value
              ? 'bg-[#3b82f6] text-white'
              : 'bg-transparent text-[#94a3b8] hover:text-[#f1f5f9]'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
