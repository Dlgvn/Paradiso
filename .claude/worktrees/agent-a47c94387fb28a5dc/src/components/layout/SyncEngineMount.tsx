'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'
import { replaySyncQueue } from '@/lib/sync/sync-engine'
import { pendingWriteCount } from '@/lib/db/sync-queue'
import { syncBus, SYNC_EVENT, type SyncEventDetail } from '@/lib/sync/sync-events'

const BG_SYNC_TAG = 'sync-library-queue'

async function tryReplay(): Promise<void> {
  try {
    await replaySyncQueue()
  } catch {
    // sync-engine emits its own error events; swallowing here keeps the listener alive
  }
}

async function registerBackgroundSync(): Promise<void> {
  if (typeof navigator === 'undefined') return
  if (!('serviceWorker' in navigator)) return
  if (!('SyncManager' in window)) return
  try {
    const reg = await navigator.serviceWorker.ready
    // Some types miss .sync — narrow defensively.
    const sync = (reg as ServiceWorkerRegistration & { sync?: { register: (tag: string) => Promise<void> } }).sync
    if (sync) {
      await sync.register(BG_SYNC_TAG)
    }
  } catch {
    // Background Sync registration is best-effort; the window 'online' fallback covers the rest.
  }
}

/**
 * SyncEngineMount — invisible. Wires the dual-trigger sync system:
 *   1. Background Sync API (Chromium) — fires even after the tab closes
 *   2. window 'online' event (universal fallback)
 *   3. Service worker → client postMessage relay (when sw fires the sync event)
 * Also surfaces sonner toasts on sync completion.
 */
export function SyncEngineMount() {
  useEffect(() => {
    let cancelled = false

    const onOnline = () => {
      void tryReplay()
    }
    window.addEventListener('online', onOnline)

    const onSwMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'replay-sync-queue') {
        void tryReplay()
      }
    }
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', onSwMessage)
    }

    // Toast on sync completion
    const onSync = (e: Event) => {
      const detail = (e as CustomEvent<SyncEventDetail>).detail
      if (detail.phase === 'success' && detail.replayed > 0) {
        const word = detail.replayed === 1 ? 'change' : 'changes'
        toast.success(`Synced ${detail.replayed} ${word}`)
      } else if (detail.phase === 'error') {
        toast.error(`Sync incomplete — ${detail.error}`)
      }
    }
    syncBus.addEventListener(SYNC_EVENT, onSync)

    // Initial replay on mount if we are online and have queued entries
    ;(async () => {
      if (cancelled) return
      if (typeof navigator !== 'undefined' && !navigator.onLine) return
      const pending = await pendingWriteCount()
      if (pending > 0 && !cancelled) {
        await tryReplay()
      }
    })()

    // Best-effort background sync registration
    void registerBackgroundSync()

    return () => {
      cancelled = true
      window.removeEventListener('online', onOnline)
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', onSwMessage)
      }
      syncBus.removeEventListener(SYNC_EVENT, onSync)
    }
  }, [])

  return null
}
