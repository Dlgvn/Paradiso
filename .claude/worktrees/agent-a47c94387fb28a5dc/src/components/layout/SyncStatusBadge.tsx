'use client'

import { WifiOff, Loader2 } from 'lucide-react'
import { useSyncStatus } from '@/lib/sync/use-sync-status'

interface SyncStatusBadgeProps {
  variant?: 'sidebar' | 'bottomnav'
}

export function SyncStatusBadge({ variant = 'sidebar' }: SyncStatusBadgeProps) {
  const { online, syncing, pendingCount } = useSyncStatus()

  if (online && !syncing && pendingCount === 0) return null

  if (variant === 'bottomnav') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="absolute top-1 right-2 flex items-center gap-1"
      >
        {!online ? (
          <span
            aria-label={pendingCount > 0 ? `Offline — ${pendingCount} pending` : 'Offline'}
            className="flex items-center gap-1 rounded-full bg-amber-500/20 text-amber-300 px-1.5 py-0.5 text-[10px]"
          >
            <WifiOff size={10} />
            {pendingCount > 0 ? pendingCount : null}
          </span>
        ) : syncing ? (
          <Loader2 size={12} className="text-accent animate-spin" aria-label="Syncing" />
        ) : null}
      </div>
    )
  }

  // sidebar variant — vertical stack, sits above the signOut button
  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center gap-1">
      {!online ? (
        <span
          aria-label={pendingCount > 0 ? `Offline — ${pendingCount} pending changes` : 'Offline'}
          className="flex items-center gap-1 rounded-full bg-amber-500/20 text-amber-300 px-2 py-1 text-[10px]"
        >
          <WifiOff size={12} />
          {pendingCount > 0 ? pendingCount : null}
        </span>
      ) : syncing ? (
        <Loader2 size={14} className="text-accent animate-spin" aria-label="Syncing" />
      ) : null}
    </div>
  )
}
