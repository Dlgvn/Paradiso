'use client'

import { useState, useEffect, useCallback } from 'react'
import { MediaTypeSelector } from '@/components/search/MediaTypeSelector'
import { LibrarySearchInput } from './LibrarySearchInput'
import { LibraryGrid } from '@/components/library/LibraryGrid'
import { filterLibrary } from '@/lib/search/filter'
import type { MediaType, MediaItem } from '@/types/media'
import { MEDIA_TYPE_LABELS } from '@/types/media'
import { createClient } from '@/lib/supabase/client'

interface LibrarySearchTabProps {
  initialItems: MediaItem[]
  initialQuery?: string
}

export function LibrarySearchTab({ initialItems, initialQuery }: LibrarySearchTabProps) {
  const [mediaType, setMediaType] = useState<MediaType>('movie')
  const [query, setQuery] = useState(initialQuery ?? '')
  const [allItems, setAllItems] = useState<MediaItem[]>(initialItems)
  const [isLoading, setIsLoading] = useState(false)

  const fetchItems = useCallback(async (type: MediaType) => {
    setIsLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('media_items')
      .select('*')
      .eq('media_type', type)
      .order('date_added', { ascending: false })
    setAllItems(data ?? [])
    setIsLoading(false)
  }, [])

  useEffect(() => {
    // Skip fetch for initial 'movie' type — already have server-pre-fetched data
    if (mediaType === 'movie' && allItems === initialItems) return
    fetchItems(mediaType)
  }, [mediaType, fetchItems]) // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = filterLibrary(allItems, query)

  function handleTypeChange(type: MediaType) {
    setMediaType(type)
    setQuery('')
  }

  function handleSearch(q: string) {
    setQuery(q)
  }

  return (
    <div className="space-y-4">
      <MediaTypeSelector activeType={mediaType} onChange={handleTypeChange} />
      <LibrarySearchInput defaultValue={query} onSearch={handleSearch} key={mediaType} />
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
        </div>
      ) : query && filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-[20px] font-[600] text-[#f1f5f9] mb-2">
            No results for &ldquo;{query}&rdquo;
          </p>
          <p className="text-[14px] font-[400] text-[#94a3b8]">
            Try a different title, director, author, or genre.
          </p>
        </div>
      ) : !query && allItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-[20px] font-[600] text-[#f1f5f9] mb-2">
            No {MEDIA_TYPE_LABELS[mediaType]} yet
          </p>
          <p className="text-[14px] font-[400] text-[#94a3b8]">
            Add some from the search tab to get started.
          </p>
        </div>
      ) : (
        <LibraryGrid items={filtered} view="grid" />
      )}
    </div>
  )
}
