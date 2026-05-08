import { createClient } from '@/lib/supabase/server'
import { AnalyticsClient } from './AnalyticsClient'
import type { MediaItem } from '@/types/media'

type AnalyticsItem = Pick<MediaItem, 'id' | 'media_type' | 'status' | 'genre' | 'user_rating' | 'date_completed' | 'title' | 'external_id'>

export default async function AnalyticsPage() {
  const supabase = await createClient()
  // Open Question 2 mitigation: explicit ceiling to prevent partial loads on huge libraries
  const { data: items } = await supabase
    .from('media_items')
    .select('id, media_type, status, genre, user_rating, date_completed, title, external_id')
    .limit(1000)
    .order('date_completed', { ascending: true })

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <header className="mb-8">
        <h1 className="text-[28px] font-[600] text-white leading-tight">Your Stats</h1>
        <p className="text-[14px] font-[400] text-accent-silver mt-1">A breakdown of your media consumption</p>
      </header>
      <AnalyticsClient items={(items ?? []) as AnalyticsItem[]} />
    </div>
  )
}
