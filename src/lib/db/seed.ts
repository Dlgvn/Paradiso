'use client'

import { db, type LibraryItem } from './schema'
import { createClient } from '@/lib/supabase/client'

/**
 * seedLibraryFromSupabase — pulls all media_items rows for the given user from
 * Supabase and bulkPuts them into Dexie library_items. Idempotent: bulkPut
 * upserts by primary key (id), so calling this repeatedly while online keeps
 * Dexie fresh without duplicating rows. Caller is responsible for verifying
 * navigator.onLine before invoking.
 */
export async function seedLibraryFromSupabase(userId: string): Promise<{ seeded: number }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('media_items')
    .select('*')
    .eq('user_id', userId)

  if (error) {
    // Surface to the caller; do NOT clear local data on a transient fetch error.
    throw new Error(`seedLibraryFromSupabase: ${error.message}`)
  }
  if (!data || data.length === 0) {
    return { seeded: 0 }
  }

  // Dexie types are strict — cast through unknown because Supabase's row type
  // is the database row shape and our LibraryItem mirrors it field-for-field.
  await db.library_items.bulkPut(data as unknown as LibraryItem[])
  return { seeded: data.length }
}
