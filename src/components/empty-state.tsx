import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed border-border-strong px-6 py-10 text-center',
        className
      )}
    >
      <div className="mb-3 grid size-10 place-items-center rounded-md bg-muted text-muted-foreground">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <p className="font-medium text-foreground">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

/** Small notice used where example content is shown, so nothing passes as real data. */
export function ExampleNotice({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-md border border-border bg-muted/60 px-3 py-2 text-sm text-muted-foreground',
        className
      )}
    >
      <span className="mt-px rounded-sm bg-highlight px-1.5 py-0.5 text-xs font-medium text-foreground">Example</span>
      <span>{children}</span>
    </div>
  )
}
