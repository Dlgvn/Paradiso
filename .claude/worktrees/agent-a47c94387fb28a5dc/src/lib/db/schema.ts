import Dexie, { type EntityTable } from 'dexie'
import type { MediaItem } from '@/types/media'

// Dexie row shape — identical to MediaItem (mirrors Supabase media_items table).
// Kept as a separate alias so future divergence is allowed without churning the import surface.
export type LibraryItem = MediaItem

export type SyncOperation =
  | 'update_status'
  | 'update_rating'
  | 'toggle_favorite'

export interface SyncQueueEntry {
  id?: number
  operation: SyncOperation
  item_id: string
  payload: Record<string, unknown>
  queued_at: string
  attempts: number
  last_error?: string | null
}

export class MediaTrackerDB extends Dexie {
  library_items!: EntityTable<LibraryItem, 'id'>
  sync_queue!: EntityTable<SyncQueueEntry, 'id'>

  constructor() {
    super('media-tracker-v3')
    this.version(1).stores({
      library_items: 'id, user_id, media_type, status, updated_at',
      sync_queue: '++id, item_id, queued_at, operation',
    })
  }
}

// Singleton — every consumer imports the same Dexie instance.
// SSR-safe: Dexie does not touch indexedDB until a query runs, and consumers MUST
// be inside 'use client' boundaries or useEffect.
export const db = new MediaTrackerDB()
