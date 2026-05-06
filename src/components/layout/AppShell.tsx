'use client'

import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { BackdropLayer } from '../backdrop/BackdropLayer'

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BackdropLayer />
      <div className="flex h-screen">
        <div className="hidden md:flex">
          <Sidebar />
        </div>
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {children}
        </main>
        <BottomNav />
      </div>
    </>
  )
}
