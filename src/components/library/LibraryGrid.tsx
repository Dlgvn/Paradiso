'use client'

import { useState } from 'react'
import { MediaCard } from '@/components/library/MediaCard'
import { MediaListItem } from '@/components/library/MediaListItem'
import { ItemDetailSheet } from '@/components/detail/ItemDetailSheet'
import { FilterBar, applyFilters } from '@/components/library/FilterBar'
import type { ActiveFilters } from '@/components/library/FilterBar'
import type { MediaItem } from '@/types/media'

interface LibraryGridProps {
  items: MediaItem[]
  view: 'grid' | 'list'
}

const defaultFilters: ActiveFilters = {
  genre: null,
  decade: null,
  minRating: null,
  favoritesOnly: false,
}

export function LibraryGrid({ items, view }: LibraryGridProps) {
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [filters, setFilters] = useState<ActiveFilters>(defaultFilters)

  function handleItemClick(item: MediaItem) {
    setSelectedItem(item)
    setSheetOpen(true)
  }

  const filtered = applyFilters(items, filters)

  return (
    <>
      <FilterBar items={items} filters={filters} onFiltersChange={setFilters} />

      {view === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {filtered.map((item) => (
            <MediaListItem key={item.id} item={item} onItemClick={handleItemClick} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {filtered.map((item) => (
            <MediaCard key={item.id} item={item} onItemClick={handleItemClick} />
          ))}
        </div>
      )}

      <ItemDetailSheet item={selectedItem} open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  )
}
