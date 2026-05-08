'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { EmptyState } from './EmptyState'

interface StatusTabsProps {
  mediaType: 'movies' | 'books' | 'series'
}

const tabs = [
  { value: 'watchlist', label: 'Watchlist' },
  { value: 'watching', label: 'Watching' },
  { value: 'completed', label: 'Completed' },
  { value: 'dropped', label: 'Dropped' },
]

export function StatusTabs({ mediaType }: StatusTabsProps) {
  return (
    <Tabs defaultValue="watchlist" className="w-full">
      <TabsList className="bg-transparent border-b border-accent-silver/10 rounded-none w-full justify-start h-auto p-0 gap-0">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="rounded-none bg-transparent px-4 py-3 text-accent-silver data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-accent border-b-2 border-transparent transition-colors"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="mt-0">
          <EmptyState mediaType={mediaType} />
        </TabsContent>
      ))}
    </Tabs>
  )
}
