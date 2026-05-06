import { createClient } from '@/lib/supabase/server'
import { LibraryGrid } from '@/components/library/LibraryGrid'
import { StatusFilter } from '@/components/library/StatusFilter'
import { ViewToggle } from '@/components/library/ViewToggle'
import { EmptyState } from '@/components/library/EmptyState'
import type { MediaStatus } from '@/types/media'

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; view?: 'grid' | 'list' }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const status = (params.status as MediaStatus) ?? 'watchlist'
  const view = params.view ?? 'grid'

  const { data: items } = await supabase
    .from('media_items')
    .select('*')
    .eq('media_type', 'book')
    .eq('status', status)
    .order('date_added', { ascending: false })

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-8 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#f1f5f9]">Books</h1>
        <ViewToggle view={view} />
      </div>
      <StatusFilter activeStatus={status} mediaType="book" />
      {items && items.length > 0 ? (
        <LibraryGrid items={items} view={view} />
      ) : (
        <EmptyState status={status} />
      )}
    </div>
  )
}
