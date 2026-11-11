import Link from 'next/link'
import { Check, ChevronLeft } from 'lucide-react'
import { Logo } from '@/components/brand'
import { ThemeToggle } from '@/components/theme'

const points = [
  'Summaries and key terms from your own notes',
  'Flashcards and practice quizzes you can retake',
  'A day-by-day plan up to your exam date',
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh bg-background">
      {/* Left panel — large screens only */}
      <aside className="hidden w-[44%] max-w-xl flex-col justify-between border-r border-border bg-muted p-10 lg:flex xl:p-14">
        <Logo />
        <div>
          <p className="font-display text-[2rem] font-medium leading-tight tracking-tight text-foreground">
            “The best time to start revising was last week. The second best is <span className="marker">tonight</span>.”
          </p>
          <ul className="mt-10 space-y-3">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3 text-foreground">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-sm bg-primary text-primary-foreground">
                  <Check className="size-3.5" aria-hidden="true" />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-1 rounded-sm text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Back to home
        </Link>
      </aside>

      {/* Form side */}
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between px-4 py-4 sm:px-6">
          <div className="lg:hidden">
            <Logo />
          </div>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>

        <main id="main-content" className="flex flex-1 items-start justify-center px-4 pb-12 pt-4 sm:items-center sm:px-6">
          <div className="w-full max-w-[420px]">
            <Link
              href="/"
              className="mb-5 inline-flex h-10 items-center gap-1 rounded-sm text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
              Back to home
            </Link>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
