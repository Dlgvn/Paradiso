import AppShell from '@/components/layout/AppShell'
import { Toaster } from 'sonner'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      {children}
      <Toaster position="bottom-center" />
    </AppShell>
  )
}
