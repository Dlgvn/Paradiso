'use client'

import { useEffect, useState } from 'react'
import { useOnlineStatus } from '@/lib/hooks/useOnlineStatus'
import { pendingWriteCount } from '@/lib/db/sync-queue'
import { syncBus, SYNC_EVENT, type SyncEventDetail } from './sync-events'

export interface SyncStatus {
  online: boolean
  syncing: boolean
  pendingCount: number
  lastResult: SyncEventDetail | null
}

export function useSyncStatus(): SyncStatus {
  const online = useOnlineStatus()
  const [syncing, setSyncing] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [lastResult, setLastResult] = useState<SyncEventDetail | null>(null)

  useEffect(() => {
    let cancelled = false

    // Initial pending count
    pendingWriteCount().then((n) => {
      if (!cancelled) setPendingCount(n)
    })

    const handler = (e: Event) => {
      const detail = (e as CustomEvent<SyncEventDetail>).detail
      setLastResult(detail)
      if (detail.phase === 'start') {
        setSyncing(true)
        setPendingCount(detail.pending)
      } else {
        setSyncing(false)
        setPendingCount(detail.remaining)
      }
    }
    syncBus.addEventListener(SYNC_EVENT, handler)
    return () => {
      cancelled = true
      syncBus.removeEventListener(SYNC_EVENT, handler)
    }
  }, [])

  return { online, syncing, pendingCount, lastResult }
}
