'use client'

import { usePathname } from 'next/navigation'
import { Menu, Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme'
import { useStudyData } from '@/contexts/study-data-context'
import { navSections } from './sidebar'

const titles: Record<string, string> = Object.fromEntries(
  navSections.flatMap((s) => s.links.map((l) => [l.href, l.label]))
)

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname()
  const { stats, ready } = useStudyData()
  const title = titles[pathname] ?? 'StudyGenie'

  return (
    <header className="sticky top-0 z-20 flex h-[60px] items-center justify-between gap-3 border-b border-border bg-background/95 px-4 supports-[backdrop-filter]:bg-background/85 supports-[backdrop-filter]:backdrop-blur-sm sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="-ml-2 lg:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu aria-hidden="true" />
        </Button>
        <h1 className="truncate font-display text-xl font-semibold tracking-tight text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-1">
        {ready && stats.streak > 0 && (
          <div
            className="mr-1 hidden items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground sm:flex"
            title="Days in a row with study activity"
          >
            <Flame className="size-3.5 text-warning" aria-hidden="true" />
            <span className="tabular">{stats.streak}</span>
            <span className="text-muted-foreground">day streak</span>
          </div>
        )}
        <ThemeToggle />
      </div>
    </header>
  )
}
