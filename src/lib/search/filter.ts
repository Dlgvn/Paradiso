import type { MediaItem } from '@/types/media'

export function filterLibrary(items: MediaItem[], query: string): MediaItem[] {
  if (!query.trim()) return items

  const q = query.toLowerCase()

  return items.filter((item) => {
    return (
      item.title?.toLowerCase().includes(q) ||
      item.author?.toLowerCase().includes(q) ||
      item.director?.toLowerCase().includes(q) ||
      item.genre?.toLowerCase().includes(q)
    )
  })
}
