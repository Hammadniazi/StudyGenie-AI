'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, Bell, Sun, Moon, Zap, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/tutor': 'AI Tutor',
  '/upload': 'Upload Material',
  '/flashcards': 'Flashcards',
  '/quizzes': 'Quizzes',
  '/study-planner': 'Study Planner',
  '/analytics': 'Analytics',
}

interface HeaderProps {
  onMenuClick: () => void
  userEmail?: string
  userName?: string
  xp?: number
}

export function Header({ onMenuClick, userEmail, userName, xp = 0 }: HeaderProps) {
  const pathname = usePathname()
  const [isDark, setIsDark] = useState(true)

  const title = pageTitles[pathname] ?? 'StudyGenie AI'

  useEffect(() => {
    // Default to dark
    document.documentElement.classList.add('dark')
  }, [])

  function toggleTheme() {
    setIsDark((prev) => {
      const next = !prev
      // next=true → dark mode, next=false → light mode
      document.documentElement.classList.toggle('light', !next)
      document.documentElement.classList.toggle('dark', next)
      return next
    })
  }

  return (
    <header className="h-16 border-b border-border glass flex items-center justify-between px-4 gap-4 sticky top-0 z-30">
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>

      {/* Right: XP, dark mode, notifications, avatar */}
      <div className="flex items-center gap-2">
        {/* XP */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold">
          <Zap className="w-3.5 h-3.5" />
          {xp.toLocaleString()} XP
        </div>

        {/* Theme toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
        </Button>

        {/* Avatar */}
        <div className={cn(
          'w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center cursor-pointer',
        )}>
          {userEmail || userName ? (
            <span className="text-xs font-bold text-primary">
              {(userName || userEmail!).charAt(0).toUpperCase()}
            </span>
          ) : (
            <User className="w-4 h-4 text-primary" />
          )}
        </div>
      </div>
    </header>
  )
}
