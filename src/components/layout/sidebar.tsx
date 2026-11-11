'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import {
  LayoutDashboard,
  MessagesSquare,
  FileUp,
  Layers,
  ListChecks,
  CalendarDays,
  LineChart,
  LogOut,
  LogIn,
  X,
} from 'lucide-react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/brand'
import { cn } from '@/lib/utils'

export const navSections = [
  {
    label: 'Study',
    links: [
      { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
      { href: '/upload', label: 'Add material', icon: FileUp },
      { href: '/flashcards', label: 'Flashcards', icon: Layers },
      { href: '/quizzes', label: 'Quizzes', icon: ListChecks },
      { href: '/tutor', label: 'Tutor chat', icon: MessagesSquare },
    ],
  },
  {
    label: 'Plan',
    links: [
      { href: '/study-planner', label: 'Study plan', icon: CalendarDays },
      { href: '/analytics', label: 'Progress', icon: LineChart },
    ],
  },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  userEmail?: string
  userName?: string
}

function SidebarBody({ onNavigate, userEmail, userName }: { onNavigate?: () => void; userEmail?: string; userName?: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const isGuest = !userEmail

  async function handleLogout() {
    if (isSupabaseConfigured()) {
      const supabase = createClient()
      await supabase.auth.signOut()
    }
    router.push('/')
  }

  return (
    <>
      <nav aria-label="Main" className="flex-1 overflow-y-auto px-3 py-4">
        {navSections.map((section) => (
          <div key={section.label} className="mb-5">
            <p className="px-2 pb-1.5 font-mono text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.links.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || pathname.startsWith(href + '/')
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={onNavigate}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'relative flex h-10 items-center gap-3 rounded-md px-2.5 text-sm transition-colors',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        isActive
                          ? 'bg-card font-medium text-foreground shadow-sm ring-1 ring-border'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      {isActive && (
                        <span aria-hidden="true" className="absolute inset-y-2 left-0 w-[3px] rounded-r bg-primary" />
                      )}
                      <Icon className={cn('size-4 shrink-0', isActive && 'text-primary')} aria-hidden="true" />
                      {label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        {isGuest ? (
          <div className="rounded-md bg-card p-3 ring-1 ring-border">
            <p className="text-sm font-medium text-foreground">You&apos;re using a guest session</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              Your work is saved in this browser only. Create an account to keep it.
            </p>
            <Button asChild size="sm" className="mt-3 w-full">
              <Link href="/register" onClick={onNavigate}>Create account</Link>
            </Button>
            <Button asChild size="sm" variant="ghost" className="mt-1 w-full">
              <Link href="/login" onClick={onNavigate}>
                <LogIn aria-hidden="true" />
                Sign in
              </Link>
            </Button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 px-1 py-1.5">
              <div className="grid size-8 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
                {(userName || userEmail || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{userName || 'Student'}</p>
                <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="mt-1 w-full justify-start text-muted-foreground" onClick={handleLogout}>
              <LogOut aria-hidden="true" />
              Log out
            </Button>
          </div>
        )}
      </div>
    </>
  )
}

export function Sidebar({ isOpen, onClose, userEmail, userName }: SidebarProps) {
  const isGuest = !userEmail
  const home = isGuest ? '/' : '/dashboard'

  return (
    <>
      {/* Desktop: persistent rail */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[240px] flex-col border-r border-border bg-background lg:flex">
        <div className="flex h-[60px] shrink-0 items-center px-4">
          <Logo href={home} />
        </div>
        <SidebarBody userEmail={userEmail} userName={userName} />
      </aside>

      {/* Mobile: modal drawer with focus trap, Esc and scroll lock from Radix */}
      <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/40 lg:hidden" />
          <DialogPrimitive.Content
            className="fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[85vw] flex-col border-r border-border bg-background shadow-md lg:hidden"
          >
            <DialogPrimitive.Title className="sr-only">Navigation</DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">Move between sections of StudyGenie</DialogPrimitive.Description>
            <div className="flex h-[60px] shrink-0 items-center justify-between px-4">
              <Logo href={home} onClick={onClose} />
              <DialogPrimitive.Close asChild>
                <Button variant="ghost" size="icon" aria-label="Close menu">
                  <X aria-hidden="true" />
                </Button>
              </DialogPrimitive.Close>
            </div>
            <SidebarBody onNavigate={onClose} userEmail={userEmail} userName={userName} />
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  )
}
