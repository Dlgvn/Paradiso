'use client'

import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

// BeforeInstallPromptEvent is not in lib.dom.d.ts. Minimal local typing:
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const DISMISS_KEY = 'mt-install-prompt-dismissed'

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.localStorage.getItem(DISMISS_KEY) === '1') {
      setDismissed(true)
      return
    }
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    const installedHandler = () => setDeferred(null)
    window.addEventListener('appinstalled', installedHandler)
    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', installedHandler)
    }
  }, [])

  if (dismissed || !deferred) return null

  const onInstall = async () => {
    await deferred.prompt()
    await deferred.userChoice
    setDeferred(null)
  }

  const onDismiss = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(DISMISS_KEY, '1')
    }
    setDismissed(true)
  }

  return (
    <div
      role="dialog"
      aria-label="Install Media Tracker"
      className="fixed z-40 right-4 bottom-20 md:bottom-4 flex items-center gap-2 rounded-xl bg-base-surface/90 backdrop-blur-md border border-accent-silver/15 px-3 py-2 shadow-lg"
    >
      <button
        type="button"
        onClick={onInstall}
        className="inline-flex items-center gap-2 rounded-lg bg-accent/20 text-accent px-3 py-1.5 text-sm hover:bg-accent/30 transition-colors"
      >
        <Download size={16} />
        Install app
      </button>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss install prompt"
        className="inline-flex items-center justify-center rounded-md text-accent-silver hover:text-white p-1"
      >
        <X size={16} />
      </button>
    </div>
  )
}
