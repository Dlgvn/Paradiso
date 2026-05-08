'use client'

import { Heart } from 'lucide-react'
import type { MediaItem } from '@/types/media'

export interface ActiveFilters {
  genre: string | null
  decade: string | null
  minRating: number | null
  favoritesOnly: boolean
}

interface FilterBarProps {
  items: MediaItem[]
  filters: ActiveFilters
  onFiltersChange: (filters: ActiveFilters) => void
}

const DECADE_OPTIONS = [
  { label: 'All Years', value: null },
  { label: 'Pre-2000', value: 'pre2000' },
  { label: "2000s", value: '2000s' },
  { label: "2010s", value: '2010s' },
  { label: "2020s", value: '2020s' },
]

const RATING_OPTIONS = [
  { label: 'Any Rating', value: null },
  { label: '7+', value: 7 },
  { label: '8+', value: 8 },
  { label: '9+', value: 9 },
]

function getUniqueGenres(items: MediaItem[]): string[] {
  const set = new Set<string>()
  for (const item of items) {
    if (!item.genre) continue
    for (const g of item.genre.split(',')) {
      const trimmed = g.trim()
      if (trimmed) set.add(trimmed)
    }
  }
  return Array.from(set).sort()
}

const selectClass =
  'bg-white/5 border border-white/10 text-[#f1f5f9] text-[12px] rounded-full px-3 py-1 cursor-pointer focus:outline-none focus:border-[#3b82f6]/50 hover:border-white/20 transition-colors appearance-none'

export function FilterBar({ items, filters, onFiltersChange }: FilterBarProps) {
  const genres = getUniqueGenres(items)
  const hasActiveFilter =
    filters.genre !== null ||
    filters.decade !== null ||
    filters.minRating !== null ||
    filters.favoritesOnly

  function update(patch: Partial<ActiveFilters>) {
    onFiltersChange({ ...filters, ...patch })
  }

  function clearAll() {
    onFiltersChange({ genre: null, decade: null, minRating: null, favoritesOnly: false })
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Genre */}
      {genres.length > 0 && (
        <select
          value={filters.genre ?? ''}
          onChange={(e) => update({ genre: e.target.value || null })}
          className={selectClass}
          style={{ paddingRight: '1.5rem' }}
        >
          <option value="">Genre</option>
          {genres.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      )}

      {/* Year / Decade */}
      <select
        value={filters.decade ?? ''}
        onChange={(e) => update({ decade: e.target.value || null })}
        className={selectClass}
        style={{ paddingRight: '1.5rem' }}
      >
        {DECADE_OPTIONS.map((opt) => (
          <option key={opt.value ?? 'all'} value={opt.value ?? ''}>{opt.label}</option>
        ))}
      </select>

      {/* Rating */}
      <select
        value={filters.minRating ?? ''}
        onChange={(e) => update({ minRating: e.target.value ? Number(e.target.value) : null })}
        className={selectClass}
        style={{ paddingRight: '1.5rem' }}
      >
        {RATING_OPTIONS.map((opt) => (
          <option key={opt.value ?? 'any'} value={opt.value ?? ''}>{opt.label}</option>
        ))}
      </select>

      {/* Favorites toggle */}
      <button
        onClick={() => update({ favoritesOnly: !filters.favoritesOnly })}
        className={`flex items-center gap-1.5 text-[12px] px-3 py-1 rounded-full border transition-colors cursor-pointer ${
          filters.favoritesOnly
            ? 'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30'
            : 'bg-white/5 text-[#94a3b8] border-white/10 hover:border-white/20'
        }`}
      >
        <Heart size={12} className={filters.favoritesOnly ? 'fill-[#ef4444]' : ''} />
        Favorites
      </button>

      {/* Clear all */}
      {hasActiveFilter && (
        <button
          onClick={clearAll}
          className="text-[12px] text-[#94a3b8] hover:text-[#f1f5f9] transition-colors px-1 cursor-pointer"
        >
          Clear
        </button>
      )}
    </div>
  )
}

export function applyFilters(items: MediaItem[], filters: ActiveFilters): MediaItem[] {
  return items.filter((item) => {
    if (filters.favoritesOnly && !item.is_favorite) return false

    if (filters.genre) {
      const genres = item.genre?.split(',').map((g) => g.trim()) ?? []
      if (!genres.includes(filters.genre)) return false
    }

    if (filters.decade && item.year) {
      const y = parseInt(item.year, 10)
      if (!isNaN(y)) {
        if (filters.decade === 'pre2000' && y >= 2000) return false
        if (filters.decade === '2000s' && (y < 2000 || y >= 2010)) return false
        if (filters.decade === '2010s' && (y < 2010 || y >= 2020)) return false
        if (filters.decade === '2020s' && y < 2020) return false
      }
    }

    if (filters.minRating !== null) {
      if (item.user_rating === null || item.user_rating < filters.minRating) return false
    }

    return true
  })
}
