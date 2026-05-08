'use client'

import { useMemo, useState } from 'react'
import type { MediaItem } from '@/types/media'
import { groupByMonth, countGenres, ratingDistribution } from '@/lib/analytics'
import { MediaTypeToggle, type MediaTypeFilter } from '@/components/analytics/MediaTypeToggle'
import { ChartCard } from '@/components/analytics/ChartCard'
import { CompletionChart } from '@/components/analytics/CompletionChart'
import { GenreBreakdownChart } from '@/components/analytics/GenreBreakdownChart'
import { RatingDistributionChart } from '@/components/analytics/RatingDistributionChart'

type AnalyticsItem = Pick<MediaItem, 'id' | 'media_type' | 'status' | 'genre' | 'user_rating' | 'date_completed' | 'title' | 'external_id'>

interface Props {
  items: AnalyticsItem[]
}

export function AnalyticsClient({ items }: Props) {
  const [mediaType, setMediaType] = useState<MediaTypeFilter>('all')

  const filteredItems = useMemo(
    () => (mediaType === 'all' ? items : items.filter(i => i.media_type === mediaType)),
    [items, mediaType]
  )

  // Completion chart only counts completed items (date_completed != null implies completed status was set)
  const completedItems = useMemo(
    () => filteredItems.filter(i => i.status === 'completed' && i.date_completed != null),
    [filteredItems]
  )

  const completionData = useMemo(() => groupByMonth(completedItems), [completedItems])
  const genreData = useMemo(() => countGenres(filteredItems), [filteredItems])
  const ratingData = useMemo(() => ratingDistribution(filteredItems), [filteredItems])

  return (
    <div className="flex flex-col gap-8">
      <MediaTypeToggle activeType={mediaType} onChange={setMediaType} />

      <ChartCard title="Completed by Month">
        <CompletionChart data={completionData} />
      </ChartCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ChartCard title="Genre Breakdown">
          <GenreBreakdownChart data={genreData} />
        </ChartCard>
        <ChartCard title="Rating Distribution">
          <RatingDistributionChart data={ratingData} />
        </ChartCard>
      </div>
    </div>
  )
}
