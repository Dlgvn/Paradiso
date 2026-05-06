'use client'

import { useState } from 'react'
import { MediaCard } from '@/components/library/MediaCard'
import { MediaListItem } from '@/components/library/MediaListItem'
import { ItemDetailSheet } from '@/components/detail/ItemDetailSheet'
import type { MediaItem } from '@/types/media'

interface LibraryGridProps {
  items: MediaItem[]
  view: 'grid' | 'list'
}

export function LibraryGrid({ items, view }: LibraryGridProps) {
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  function handleItemClick(item: MediaItem) {
    setSelectedItem(item)
    setSheetOpen(true)
  }

  return (
    <>
      {view === 'list' ? (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <MediaListItem key={item.id} item={item} onItemClick={handleItemClick} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((item) => (
            <MediaCard key={item.id} item={item} onItemClick={handleItemClick} />
          ))}
        </div>
      )}

      <ItemDetailSheet item={selectedItem} open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  )
}
