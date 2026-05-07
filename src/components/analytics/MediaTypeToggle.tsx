'use client'

export type MediaTypeFilter = 'all' | 'movie' | 'book' | 'series'

interface Props {
  activeType: MediaTypeFilter
  onChange: (type: MediaTypeFilter) => void
}

const OPTIONS: { value: MediaTypeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'movie', label: 'Movies' },
  { value: 'book', label: 'Books' },
  { value: 'series', label: 'Series' },
]

export function MediaTypeToggle({ activeType, onChange }: Props) {
  return (
    <div className="flex gap-1 p-1 bg-base-elevated rounded-full w-fit">
      {OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={
            activeType === value
              ? 'px-4 py-1.5 rounded-full text-[13px] font-[400] transition-colors duration-120 cursor-pointer bg-accent/20 text-accent'
              : 'px-4 py-1.5 rounded-full text-[13px] font-[400] transition-colors duration-120 cursor-pointer bg-transparent text-accent-silver hover:bg-accent-silver/10'
          }
        >
          {label}
        </button>
      ))}
    </div>
  )
}
