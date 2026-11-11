import Link from 'next/link'
import { cn } from '@/lib/utils'

/** Notebook-with-bookmark mark. Uses tokens so it adapts to both themes. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn('size-8 shrink-0', className)}>
      <rect x="1" y="1" width="30" height="30" rx="7" fill="var(--primary)" />
      <path
        d="M9 9.5c0-.8.7-1.5 1.5-1.5H22c.6 0 1 .4 1 1v14.5c0 .3-.2.5-.5.5H10.5c-.8 0-1.5-.7-1.5-1.5v-13Z"
        fill="var(--primary-foreground)"
      />
      <path d="M12 12.5h7M12 15.5h7M12 18.5h4.5" stroke="var(--primary)" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M19.5 8h2.5v6.5l-1.25-1-1.25 1V8Z" fill="#f2c53d" />
    </svg>
  )
}

export function Logo({
  href = '/',
  className,
  onClick,
}: {
  href?: string
  className?: string
  onClick?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
    >
      <LogoMark />
      <span className="font-display text-[19px] font-semibold tracking-tight text-foreground">StudyGenie</span>
    </Link>
  )
}
