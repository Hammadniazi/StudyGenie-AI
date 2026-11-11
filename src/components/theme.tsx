'use client'

import { useCallback, useSyncExternalStore } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

const STORAGE_KEY = 'sg-theme'
type Theme = 'light' | 'dark'

/** Runs in <head> before first paint: stored choice → system preference. */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("${STORAGE_KEY}");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.setAttribute("data-theme",t)}catch(e){document.documentElement.setAttribute("data-theme","light")}})()`

const getTheme = (): Theme =>
  document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'

function subscribe(onChange: () => void) {
  // The <html data-theme> attribute is the source of truth.
  const mo = new MutationObserver(onChange)
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

  // Follow the OS only while the user hasn't picked a theme explicitly.
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  const onSystem = (e: MediaQueryListEvent) => {
    let stored: string | null = null
    try { stored = localStorage.getItem(STORAGE_KEY) } catch {}
    if (!stored) document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light')
  }
  mq.addEventListener('change', onSystem)

  return () => {
    mo.disconnect()
    mq.removeEventListener('change', onSystem)
  }
}

export function useTheme() {
  const theme = useSyncExternalStore<Theme>(subscribe, getTheme, () => 'light')
  const setTheme = useCallback((next: Theme) => {
    document.documentElement.setAttribute('data-theme', next)
    try { localStorage.setItem(STORAGE_KEY, next) } catch {}
  }, [])
  return { theme, setTheme }
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'
  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      {isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
    </Button>
  )
}
