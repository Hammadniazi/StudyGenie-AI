'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Bot,
  Upload,
  CreditCard,
  Trophy,
  Calendar,
  BarChart3,
  LogOut,
  X,
  Sparkles,
} from 'lucide-react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tutor', label: 'AI Tutor', icon: Bot },
  { href: '/upload', label: 'Upload Material', icon: Upload },
  { href: '/flashcards', label: 'Flashcards', icon: CreditCard },
  { href: '/quizzes', label: 'Quizzes', icon: Trophy },
  { href: '/study-planner', label: 'Study Planner', icon: Calendar },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  userEmail?: string
  userName?: string
}

export function Sidebar({ isOpen, onClose, userEmail, userName }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  async function handleLogout() {
    if (isSupabaseConfigured()) {
      const supabase = createClient()
      await supabase.auth.signOut()
    }
    router.push('/')
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full flex flex-col glass border-r border-border transition-transform duration-300 ease-in-out',
          'w-[240px]',
          // Mobile: slide in/out
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2" onClick={onClose}>
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20 border border-primary/30">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <span className="font-bold text-foreground">StudyGenie AI</span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-primary/15 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-border p-3 shrink-0">
          <div className="flex items-center gap-3 px-2 py-2 mb-2 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-primary">
                {(userName || userEmail || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {userName || 'Student'}
              </p>
              <p className="text-xs text-muted-foreground truncate">{userEmail || ''}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Log out
          </Button>
        </div>
      </aside>
    </>
  )
}
