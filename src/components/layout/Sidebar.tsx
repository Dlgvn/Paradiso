'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Film, BookOpen, Tv, Search, BarChart3, Sparkles, LogOut } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { signOut } from '@/app/(auth)/auth/actions'

const navItems = [
  { href: '/movies', icon: Film, label: 'Movies' },
  { href: '/books', icon: BookOpen, label: 'Books' },
  { href: '/series', icon: Tv, label: 'Series' },
  { href: '/search', icon: Search, label: 'Search' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/recommendations', icon: Sparkles, label: 'Recommendations' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex flex-col items-center py-4 gap-2 w-16 h-screen bg-base-surface/80 backdrop-blur-sm border-r border-accent-silver/10">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href)
        const Icon = item.icon
        return (
          <Tooltip key={item.href} delayDuration={200}>
            <TooltipTrigger asChild>
              <Link href={item.href}>
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-accent/20'
                      : 'hover:bg-accent-silver/10'
                  }`}
                >
                  <Icon
                    size={24}
                    className={isActive ? 'text-accent' : 'text-accent-silver'}
                  />
                </div>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
              {item.label}
            </TooltipContent>
          </Tooltip>
        )
      })}

      <div className="mt-auto flex flex-col items-center gap-2">
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <form action={signOut}>
              <button
                type="submit"
                className="flex items-center justify-center w-12 h-12 rounded-xl transition-colors hover:bg-red-500/20 hover:text-red-400 text-accent-silver"
              >
                <LogOut size={24} />
              </button>
            </form>
          </TooltipTrigger>
          <TooltipContent side="right">
            Log out
          </TooltipContent>
        </Tooltip>
      </div>
    </aside>
  )
}
