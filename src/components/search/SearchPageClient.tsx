'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MediaTypeSelector } from '@/components/search/MediaTypeSelector'
import { SearchResultCard } from '@/components/search/SearchResultCard'
import { SearchSkeleton } from '@/components/search/SearchSkeleton'
import { LibrarySearchTab } from '@/components/search/LibrarySearchTab'
import { searchMovies, searchSeries, searchBooks, getMovieDetails } from '@/app/actions/search'
import { checkDuplicate } from '@/app/actions/library'
import type { MediaType, MediaStatus, MediaItem } from '@/types/media'
import type { OmdbSearchResult } from '@/lib/api/omdb'
import type { OlSearchResult } from '@/lib/api/open-library'
import { getOlCoverUrl, getOlWorkId } from '@/lib/api/open-library'

type SearchResult = OmdbSearchResult | OlSearchResult

function isOmdbResult(result: SearchResult): result is OmdbSearchResult {
  return 'imdbID' in result
}

interface AddItemData {
  externalId: string
  mediaType: MediaType
  title: string
  year?: string | null
  posterUrl?: string | null
  genre?: string | null
  director?: string | null
  author?: string | null
  plot?: string | null
  externalRating?: string | null
  totalSeasons?: number | null
}

interface SearchPageClientProps {
  initialLibraryItems: MediaItem[]
}

export function SearchPageClient({ initialLibraryItems }: SearchPageClientProps) {
  const [query, setQuery] = useState('')
  const [mediaType, setMediaType] = useState<MediaType>('movie')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [existingItems, setExistingItems] = useState<Map<string, MediaStatus>>(new Map())
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set())

  // Dialog state
  const [selectedItem, setSelectedItem] = useState<AddItemData | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false)
  const [duplicateStatus, setDuplicateStatus] = useState<MediaStatus | null>(null)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const runSearch = useCallback(async (q: string, type: MediaType) => {
    if (!q.trim()) {
      setResults([])
      setExistingItems(new Map())
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      let response: { results: SearchResult[]; error?: string }

      if (type === 'movie') {
        response = await searchMovies(q)
      } else if (type === 'series') {
        response = await searchSeries(q)
      } else {
        response = await searchBooks(q)
      }

      if (response.error) {
        setError(response.error)
        setResults([])
        setExistingItems(new Map())
        setIsLoading(false)
        return
      }

      setResults(response.results)

      // Batch duplicate check
      const ids = response.results.map((r) => {
        if (isOmdbResult(r)) return r.imdbID
        return getOlWorkId(r.key)
      })

      const checks = await Promise.all(ids.map((id) => checkDuplicate(id)))
      const map = new Map<string, MediaStatus>()
      ids.forEach((id, i) => {
        if (checks[i].exists && checks[i].status) {
          map.set(id, checks[i].status as MediaStatus)
        }
      })
      setExistingItems(map)
    } catch {
      setError('Something went wrong. Please try again.')
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Debounce query changes
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      runSearch(query, mediaType)
    }, 350)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, mediaType, runSearch])

  // Clear results when media type changes
  const handleTypeChange = (type: MediaType) => {
    setMediaType(type)
    setResults([])
    setExistingItems(new Map())
  }

  async function handleResultTap(result: SearchResult) {
    const externalId = isOmdbResult(result) ? result.imdbID : getOlWorkId(result.key)
    const existingStatus = existingItems.get(externalId) ?? null

    if (existingStatus !== null) {
      // Show duplicate warning
      const itemData = await buildItemData(result)
      setSelectedItem(itemData)
      setDuplicateStatus(existingStatus)
      setShowDuplicateDialog(true)
    } else {
      const itemData = await buildItemData(result)
      setSelectedItem(itemData)
      setShowAddDialog(true)
    }
  }

  async function buildItemData(result: SearchResult): Promise<AddItemData> {
    if (isOmdbResult(result)) {
      // Fetch full details for movies/series
      try {
        const details = await getMovieDetails(result.imdbID)
        return {
          externalId: details.imdbId,
          mediaType: details.type,
          title: details.title ?? result.Title,
          year: details.year ?? result.Year,
          posterUrl: details.posterUrl ?? (result.Poster !== 'N/A' ? result.Poster : null),
          genre: details.genre,
          director: details.director,
          plot: details.plot,
          externalRating: details.imdbRating,
          totalSeasons: details.totalSeasons ?? null,
        }
      } catch {
        return {
          externalId: result.imdbID,
          mediaType: result.Type,
          title: result.Title,
          year: result.Year,
          posterUrl: result.Poster !== 'N/A' ? result.Poster : null,
        }
      }
    } else {
      return {
        externalId: getOlWorkId(result.key),
        mediaType: 'book',
        title: result.title,
        year: result.first_publish_year?.toString() ?? null,
        posterUrl: result.cover_i ? getOlCoverUrl(result.cover_i, 'M') : null,
        author: result.author_name?.[0] ?? null,
      }
    }
  }

  function handleAdded(externalId: string) {
    setAddedItems((prev) => new Set(prev).add(externalId))
  }

  function handleDuplicateAddAnyway() {
    setShowDuplicateDialog(false)
    setShowAddDialog(true)
  }

  const hasQuery = query.trim().length > 0

  return (
    <div className="min-h-screen bg-[#0a0a0f] px-4 py-6">
      <Tabs defaultValue="add-new">
        <TabsList className="mb-6 bg-[#12121a] border border-[#94a3b8]/20">
          <TabsTrigger value="add-new" className="data-[state=active]:bg-[#1e1e2e] data-[state=active]:text-[#f1f5f9] text-[#94a3b8]">
            Add New
          </TabsTrigger>
          <TabsTrigger value="my-library" className="data-[state=active]:bg-[#1e1e2e] data-[state=active]:text-[#f1f5f9] text-[#94a3b8]">
            My Library
          </TabsTrigger>
        </TabsList>

        <TabsContent value="add-new">
          <div className="space-y-4">
            {/* Search input */}
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies, series, or books..."
              className="w-full bg-[#12121a] border border-[#94a3b8]/20 rounded-lg px-4 py-3 text-[14px] text-[#f1f5f9] placeholder-[#94a3b8] focus:outline-none focus:border-[#3b82f6] transition-colors"
            />

            {/* Media type selector */}
            <MediaTypeSelector activeType={mediaType} onChange={handleTypeChange} />

            {/* Error state */}
            {error && (
              <div className="flex items-center gap-3 p-3 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg">
                <p className="text-[#ef4444] text-[14px] flex-1">{error}</p>
                <button
                  onClick={() => runSearch(query, mediaType)}
                  className="text-[13px] font-[500] text-[#3b82f6] hover:text-[#60a5fa] transition-colors cursor-pointer"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Results area */}
            {isLoading ? (
              <SearchSkeleton />
            ) : results.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {results.map((result) => {
                  const externalId = isOmdbResult(result)
                    ? result.imdbID
                    : getOlWorkId(result.key)
                  return (
                    <SearchResultCard
                      key={externalId}
                      result={result}
                      mediaType={mediaType}
                      existingStatus={existingItems.get(externalId) ?? null}
                      isAdded={addedItems.has(externalId)}
                      onTap={() => handleResultTap(result)}
                    />
                  )
                })}
              </div>
            ) : hasQuery && !isLoading && !error ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-[16px] font-[500] text-[#f1f5f9] mb-2">
                  No results for &ldquo;{query}&rdquo;
                </p>
                <p className="text-[14px] text-[#94a3b8]">
                  Try a different title or switch to another media type.
                </p>
              </div>
            ) : null}
          </div>
        </TabsContent>

        <TabsContent value="my-library">
          <LibrarySearchTab initialItems={initialLibraryItems} />
        </TabsContent>
      </Tabs>

      {/* Dialogs — rendered lazily to avoid import cycles */}
      {showDuplicateDialog && selectedItem && duplicateStatus && (
        <DuplicateWarningDialogLazy
          open={showDuplicateDialog}
          onClose={() => setShowDuplicateDialog(false)}
          onAddAnyway={handleDuplicateAddAnyway}
          existingStatus={duplicateStatus}
          itemTitle={selectedItem.title}
        />
      )}

      {showAddDialog && selectedItem && (
        <AddItemDialogLazy
          open={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          onAdded={() => {
            if (selectedItem) handleAdded(selectedItem.externalId)
          }}
          item={selectedItem}
        />
      )}
    </div>
  )
}

const AddItemDialogLazy = dynamic(
  () => import('@/components/search/AddItemDialog').then((m) => m.AddItemDialog),
  { ssr: false }
)

const DuplicateWarningDialogLazy = dynamic(
  () => import('@/components/search/DuplicateWarningDialog').then((m) => m.DuplicateWarningDialog),
  { ssr: false }
)
