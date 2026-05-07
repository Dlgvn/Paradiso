'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Film, BookOpen, Tv, Search, User, LogOut } from 'lucide-react'
import { signOut } from '@/app/(auth)/auth/actions'
import { SyncStatusBadge } from './SyncStatusBadge'

const navItems = [
  { href: '/movies', icon: Film, label: 'Movies' },
  { href: '/books', icon: BookOpen, label: 'Books' },
  { href: '/series', icon: Tv, label: 'Series' },
  { href: '/search', icon: Search, label: 'Search' },
  { href: '/profile', icon: User, label: 'Profile' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden flex items-center justify-around h-16 bg-base-surface/90 backdrop-blur-md border-t border-accent-silver/10 z-50 relative">
      <div className="absolute inset-x-0 top-0 pointer-events-none"><SyncStatusBadge variant="bottomnav" /></div>
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center justify-center h-16 flex-1"
          >
            <Icon
              size={24}
              className={isActive ? 'text-accent' : 'text-accent-silver'}
            />
          </Link>
        )
      })}
      <form action={signOut} className="flex items-center justify-center h-16 flex-1">
        <button
          type="submit"
          className="flex items-center justify-center w-full h-full text-accent-silver hover:text-red-400 transition-colors"
          aria-label="Log out"
        >
          <LogOut size={22} />
        </button>
      </form>
    </nav>
  )
}
