'use client'

import { useDebouncedCallback } from 'use-debounce'

interface LibrarySearchInputProps {
  defaultValue?: string
  onSearch: (query: string) => void
}

export function LibrarySearchInput({ defaultValue, onSearch }: LibrarySearchInputProps) {
  const handleSearch = useDebouncedCallback((term: string) => {
    onSearch(term)
  }, 300)

  return (
    <input
      type="search"
      placeholder="Search your library..."
      defaultValue={defaultValue ?? ''}
      onChange={(e) => handleSearch(e.target.value)}
      className="w-full rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3 text-[14px] text-white placeholder:text-white/40 outline-none focus:border-white/40 transition-colors"
    />
  )
}
