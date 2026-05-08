'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { LayoutGrid, List } from 'lucide-react'

interface ViewToggleProps {
  view: 'grid' | 'list'
  onChange?: (view: 'grid' | 'list') => void
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleToggle(newView: 'grid' | 'list') {
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', newView)
    router.push(`?${params.toString()}`)
    onChange?.(newView)
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => handleToggle('grid')}
        className={`flex items-center justify-center w-8 h-8 rounded transition-colors cursor-pointer ${
          view === 'grid'
            ? 'text-[#3b82f6] bg-[#3b82f6]/10'
            : 'text-[#94a3b8] hover:text-[#f1f5f9]'
        }`}
        aria-label="Grid view"
        aria-pressed={view === 'grid'}
      >
        <LayoutGrid size={18} />
      </button>
      <button
        onClick={() => handleToggle('list')}
        className={`flex items-center justify-center w-8 h-8 rounded transition-colors cursor-pointer ${
          view === 'list'
            ? 'text-[#3b82f6] bg-[#3b82f6]/10'
            : 'text-[#94a3b8] hover:text-[#f1f5f9]'
        }`}
        aria-label="List view"
        aria-pressed={view === 'list'}
      >
        <List size={18} />
      </button>
    </div>
  )
}
