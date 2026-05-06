import { createClient } from '@/lib/supabase/server'
import { SearchPageClient } from '@/components/search/SearchPageClient'
import type { MediaItem } from '@/types/media'

export default async function SearchPage() {
  const supabase = await createClient()
  const { data: initialItems } = await supabase
    .from('media_items')
    .select('*')
    .eq('media_type', 'movie')
    .order('date_added', { ascending: false })

  return <SearchPageClient initialLibraryItems={(initialItems ?? []) as MediaItem[]} />
}
