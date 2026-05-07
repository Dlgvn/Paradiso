'use client'

import { Toaster } from 'sonner'
import { BackdropProvider } from '../backdrop/BackdropContext'
import { TooltipProvider } from '@/components/ui/tooltip'
import { InstallPrompt } from '@/components/pwa/InstallPrompt'
import { DBSeedGate } from '@/components/layout/DBSeedGate'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <BackdropProvider>
      <TooltipProvider>
        {children}
        <DBSeedGate />
        <InstallPrompt />
        <Toaster position="bottom-center" />
      </TooltipProvider>
    </BackdropProvider>
  )
}
