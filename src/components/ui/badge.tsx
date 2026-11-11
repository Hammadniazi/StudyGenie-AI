import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-xs font-medium leading-none whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary-soft text-primary',
        secondary: 'border-transparent bg-muted text-muted-foreground',
        outline: 'border-border-strong text-muted-foreground',
        success: 'border-transparent bg-success-soft text-success',
        warning: 'border-transparent bg-warning-soft text-warning',
        destructive: 'border-transparent bg-danger-soft text-danger',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

/** Maps a difficulty level to a badge variant — colour plus the visible word, never colour alone. */
export const difficultyVariant = {
  easy: 'success',
  medium: 'warning',
  hard: 'destructive',
} as const

export { Badge, badgeVariants }
