'use client'

import { useEffect, useState } from 'react'

/**
 * useOnlineStatus — returns true while the browser reports a network connection.
 * SSR-safe: returns true on first render (assume online), then corrects to the
 * real navigator.onLine value after mount. Subscribes to window 'online'/'offline'
 * events for live updates.
 */
export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(true)

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      setOnline(navigator.onLine)
    }
    const onOnline = () => setOnline(true)
    const onOffline = () => setOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  return online
}
