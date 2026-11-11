import Link from 'next/link'
import {
  ArrowRight,
  Check,
  FileText,
  Layers,
  ListChecks,
  MessagesSquare,
  CalendarDays,
  LineChart,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/brand'
import { ThemeToggle } from '@/components/theme'

const steps = [
  {
    n: '01',
    title: 'Add your material',
    body: 'Upload a PDF or text file, or paste notes straight from a lecture or textbook chapter.',
  },
  {
    n: '02',
    title: 'Get study material back',
    body: 'A summary, key terms, flashcards and a practice quiz, all built from what you added.',
  },
  {
    n: '03',
    title: 'Revise and check yourself',
    body: 'Flip through cards, take the quiz, and see which topics still need another pass.',
  },
]

const features = [
  { icon: FileText, title: 'Summaries', body: 'The main points, learning objectives and definitions from a chapter on one page.' },
  { icon: Layers, title: 'Flashcards', body: 'Question-and-answer cards tagged by topic and difficulty. Save the ones you keep missing.' },
  { icon: ListChecks, title: 'Practice quizzes', body: 'Multiple choice, true/false and short answer, with an explanation for every question.' },
  { icon: MessagesSquare, title: 'Tutor chat', body: 'Ask follow-up questions about anything you didn’t understand, in plain language.' },
  { icon: CalendarDays, title: 'Study plan', body: 'Give it your exam date and daily hours; get a day-by-day schedule you can tick off.' },
  { icon: LineChart, title: 'Progress', body: 'Quiz scores by topic and a streak, based only on what you’ve actually done.' },
]

function ProductPreview() {
  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-md select-none lg:mx-0">
      {/* Summary card */}
      <div className="rounded-lg border border-border bg-card p-5 shadow-md">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Summary · Biology ch. 5</span>
          <span className="rounded-sm bg-primary-soft px-1.5 py-0.5 text-[11px] font-medium text-primary">4 key terms</span>
        </div>
        <p className="text-sm leading-relaxed text-foreground">
          Cells copy their DNA before dividing. Replication is{' '}
          <span className="marker">semi-conservative</span>: each new double helix keeps one original strand and
          builds one new one, using DNA polymerase.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1.1fr]">
        {/* Flashcard */}
        <div className="flex flex-col justify-between rounded-lg border border-border bg-card p-4 shadow-sm sm:-rotate-1">
          <div className="flex items-center justify-between">
            <span className="rounded-sm bg-warning-soft px-1.5 py-0.5 text-[11px] font-medium text-warning">medium</span>
            <span className="font-mono text-[11px] text-muted-foreground">3 / 12</span>
          </div>
          <p className="mt-3 text-sm font-medium leading-snug text-foreground">
            What is the difference between mitosis and meiosis?
          </p>
          <p className="mt-3 text-xs text-muted-foreground">Tap to see the answer</p>
        </div>

        {/* Quiz */}
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <p className="text-sm font-medium leading-snug text-foreground">Which protein carries oxygen in red blood cells?</p>
          <ul className="mt-3 space-y-1.5 text-sm">
            <li className="rounded-md border border-border px-2.5 py-1.5 text-muted-foreground">Insulin</li>
            <li className="flex items-center justify-between rounded-md border border-success/50 bg-success-soft px-2.5 py-1.5 font-medium text-success">
              Hemoglobin <Check className="size-4" />
            </li>
            <li className="rounded-md border border-border px-2.5 py-1.5 text-muted-foreground">Keratin</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const year = new Date().getFullYear()

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Logo />
        <nav aria-label="Account" className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Get started</Link>
          </Button>
        </nav>
      </header>

      <main id="main-content">
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pt-20">
          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">For exam season, and the weeks before it</p>
            <h1 className="font-display text-[2.5rem] font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.5rem]">
              Turn your lecture notes into something you can <span className="marker">revise</span>.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Add a PDF or paste your notes. StudyGenie writes a summary, makes flashcards and a practice quiz from
              them, and helps you plan the days until your exam.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/dashboard">
                  Try it — no account needed
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/register">Create an account</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">Free to use. Guest work stays in your browser.</p>
          </div>

          <ProductPreview />
        </section>

        {/* How it works */}
        <section aria-labelledby="how-heading" className="border-y border-border bg-card">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
            <h2 id="how-heading" className="font-display text-3xl font-semibold tracking-tight">How it works</h2>
            <ol className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
              {steps.map((s) => (
                <li key={s.n} className="border-t border-border-strong pt-5">
                  <span className="font-mono text-sm text-primary">{s.n}</span>
                  <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Features */}
        <section aria-labelledby="features-heading" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
          <div className="max-w-2xl">
            <h2 id="features-heading" className="font-display text-3xl font-semibold tracking-tight">
              What you get from one upload
            </h2>
            <p className="mt-3 text-muted-foreground">Everything is made from your own material, not a generic question bank.</p>
          </div>
          <ul className="mt-12 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-4">
                <div className="grid size-10 shrink-0 place-items-center rounded-md bg-primary-soft text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Privacy note */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col gap-4 rounded-lg border border-border bg-muted p-6 sm:flex-row sm:items-start">
            <ShieldCheck className="size-6 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <h2 className="font-semibold">You don&apos;t need an account to try it</h2>
              <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                As a guest, your flashcards, quizzes and progress are saved in this browser only — clearing your
                browser data removes them. Create an account if you want to keep them. The text you upload is sent
                to the AI model to generate your study material.
              </p>
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
          <div className="flex flex-col items-start justify-between gap-6 border-t border-border-strong pt-10 md:flex-row md:items-end">
            <h2 className="max-w-xl font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Have a chapter to get through this week? Start with that one.
            </h2>
            <Button asChild size="lg">
              <Link href="/upload">
                Add your first notes
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between">
          <p>© {year} StudyGenie</p>
          <p className="max-w-xl md:text-right">
            Summaries and questions are generated with Google Gemini; check important facts against your course
            material.
          </p>
        </div>
      </footer>
    </div>
  )
}
