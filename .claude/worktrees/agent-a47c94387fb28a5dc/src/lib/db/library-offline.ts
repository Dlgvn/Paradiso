'use client'

import { db, type LibraryItem } from './schema'
import { enqueueOfflineWrite } from './sync-queue'
import {
  updateItemStatus,
  updateItemRating,
  toggleFavorite,
} from '@/app/actions/library'
import type { MediaStatus, MediaType } from '@/types/media'

function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true
}

export interface GetLibraryItemsFilter {
  mediaType?: MediaType
  status?: MediaStatus
  userId?: string
}

/**
 * getLibraryItems — reads from Dexie. Always. UI does not need to know whether
 * the network is up; Dexie is hydrated by seedLibraryFromSupabase on app mount
 * and kept fresh by the sync engine (Plan 06-03) on reconnect.
 */
export async function getLibraryItems(
  filter: GetLibraryItemsFilter = {},
): Promise<LibraryItem[]> {
  let collection = db.library_items.toCollection()
  if (filter.userId) {
    collection = db.library_items.where('user_id').equals(filter.userId)
  }
  let items = await collection.toArray()
  if (filter.mediaType) {
    items = items.filter((i) => i.media_type === filter.mediaType)
  }
  if (filter.status) {
    items = items.filter((i) => i.status === filter.status)
  }
  // Stable order: by date_added desc to match the existing online list ordering.
  items.sort((a, b) => (a.date_added < b.date_added ? 1 : -1))
  return items
}

/**
 * updateItemStatusOffline — branches on navigator.onLine. Online: call Server
 * Action + write through to Dexie so reads stay consistent. Offline: queue + apply.
 */
export async function updateItemStatusOffline(
  id: string,
  status: MediaStatus,
): Promise<{ success: true } | { error: string }> {
  const now = new Date().toISOString()
  if (isOnline()) {
    const result = await updateItemStatus(id, status)
    if ('error' in result) return { error: String(result.error) }
    await db.library_items.update(id, { status, updated_at: now })
    return { success: true }
  }
  await enqueueOfflineWrite('update_status', id, { status })
  return { success: true }
}

export async function updateItemRatingOffline(
  id: string,
  rating: number | null,
): Promise<{ success: true } | { error: string }> {
  const now = new Date().toISOString()
  if (isOnline()) {
    const result = await updateItemRating(id, rating)
    if ('error' in result) return { error: String(result.error) }
    await db.library_items.update(id, { user_rating: rating, updated_at: now })
    return { success: true }
  }
  await enqueueOfflineWrite('update_rating', id, { user_rating: rating })
  return { success: true }
}

export async function toggleFavoriteOffline(
  id: string,
  isFavorite: boolean,
): Promise<{ success: true } | { error: string }> {
  const now = new Date().toISOString()
  if (isOnline()) {
    const result = await toggleFavorite(id, isFavorite)
    if ('error' in result) return { error: String(result.error) }
    await db.library_items.update(id, { is_favorite: isFavorite, updated_at: now })
    return { success: true }
  }
  await enqueueOfflineWrite('toggle_favorite', id, { is_favorite: isFavorite })
  return { success: true }
}
