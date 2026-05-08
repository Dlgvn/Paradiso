'use client'

import { Toaster } from 'sonner'
import { BackdropProvider } from '../backdrop/BackdropContext'
import { TooltipProvider } from '@/components/ui/tooltip'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <BackdropProvider>
      <TooltipProvider>
        {children}
        <Toaster position="bottom-center" />
      </TooltipProvider>
    </BackdropProvider>
  )
}
