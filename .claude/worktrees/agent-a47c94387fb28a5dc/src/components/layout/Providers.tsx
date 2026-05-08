'use client'

import { Toaster } from 'sonner'
import { BackdropProvider } from '../backdrop/BackdropContext'
import { TooltipProvider } from '@/components/ui/tooltip'
import { DBSeedGate } from '@/components/layout/DBSeedGate'
import { InstallPrompt } from '@/components/pwa/InstallPrompt'
import { SyncEngineMount } from '@/components/layout/SyncEngineMount'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <BackdropProvider>
      <TooltipProvider>
        {children}
        <DBSeedGate />
        <SyncEngineMount />
        <InstallPrompt />
        <Toaster position="bottom-center" />
      </TooltipProvider>
    </BackdropProvider>
  )
}
