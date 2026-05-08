'use client'

/**
 * sync-events — minimal EventTarget-based bus for sync lifecycle events.
 * Used by useSyncStatus (UI state) and SyncEngineMount (toast trigger) so
 * the sync engine itself stays UI-free and easily testable.
 */
export type SyncEventDetail =
  | { phase: 'start'; pending: number }
  | { phase: 'success'; replayed: number; remaining: number }
  | { phase: 'error'; replayed: number; remaining: number; error: string }

export const SYNC_EVENT = 'mt:sync'

class SyncEventBus extends EventTarget {
  emit(detail: SyncEventDetail) {
    this.dispatchEvent(new CustomEvent<SyncEventDetail>(SYNC_EVENT, { detail }))
  }
}

// Singleton bus — safe to import from both browser and SSR (EventTarget is in
// jsdom + modern Node; no DOM access required to construct).
export const syncBus = new SyncEventBus()
