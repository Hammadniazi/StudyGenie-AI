'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import {
  FileText,
  Layers,
  ListChecks,
  Percent,
  CheckCircle2,
  Circle,
  ArrowRight,
  MessagesSquare,
  CalendarDays,
  History,
  BarChart3,
  type LucideIcon,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/empty-state'
import { useStudyData, type ActivityType } from '@/contexts/study-data-context'
import { chartTheme } from '@/lib/chart-theme'
import { cn } from '@/lib/utils'

const activityIcons: Record<ActivityType, LucideIcon> = {
  material: FileText,
  flashcards: Layers,
  quiz: ListChecks,
  tutor: MessagesSquare,
  plan: CalendarDays,
  review: Layers,
}

function masteryLevel(p: number) {
  if (p >= 80) return { label: 'Strong', bar: 'bg-success', text: 'text-success' }
  if (p >= 60) return { label: 'Getting there', bar: 'bg-warning', text: 'text-warning' }
  return { label: 'Needs work', bar: 'bg-danger', text: 'text-danger' }
}

const container = 'mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8'

export default function DashboardPage() {
  const { ready, stats, activity } = useStudyData()

  if (!ready) {
    return (
      <div className={cn(container, 'space-y-6')}>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  if (!stats.hasOwnData) return <GettingStarted />

  const statTiles = [
    { label: 'Materials', value: String(stats.materialsCount), icon: FileText },
    { label: 'Flashcards', value: String(stats.ownFlashcardsCount), icon: Layers },
    { label: 'Quizzes taken', value: String(stats.quizzesTaken), icon: ListChecks },
    { label: 'Average score', value: stats.averageScore === null ? '—' : `${stats.averageScore}%`, icon: Percent },
  ]

  // One clear next step, derived from what the user has actually done.
  const next = stats.weakTopics.length
    ? {
        title: `Review ${stats.weakTopics[0]}`,
        body: `It's your lowest-scoring topic so far. Go through the flashcards, then retake a quiz.`,
        href: '/flashcards',
        cta: 'Review flashcards',
      }
    : stats.quizzesTaken === 0
      ? {
          title: 'Test yourself',
          body: 'You have material and cards ready. A quick quiz shows which topics have stuck.',
          href: '/quizzes',
          cta: 'Take a quiz',
        }
      : {
          title: 'Add the next chapter',
          body: 'No weak topics right now. Add more material to keep going.',
          href: '/upload',
          cta: 'Add material',
        }

  const weekTotal = stats.last7Days.reduce((s, d) => s + d.actions, 0)

  return (
    <div className={cn(container, 'space-y-6')}>
      {/* Stats */}
      <section aria-label="Summary" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statTiles.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{label}</p>
              <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
            </div>
            <p className="tabular mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">{value}</p>
          </Card>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Next step */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardDescription className="font-mono text-[11px] uppercase tracking-wider">
              Pick up where you left off
            </CardDescription>
            <CardTitle className="font-display text-2xl font-semibold tracking-tight">{next.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">{next.body}</p>
            {stats.weakTopics.length > 1 && (
              <p className="mt-3 text-sm text-foreground">
                <span className="font-medium">Focus next:</span>{' '}
                <span className="text-muted-foreground">{stats.weakTopics.join(', ')}</span>
              </p>
            )}
            <Button asChild className="mt-5">
              <Link href={next.href}>
                {next.cta}
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Topic mastery */}
        <Card>
          <CardHeader>
            <CardTitle>Topic mastery</CardTitle>
            <CardDescription>From your quiz answers</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.topicMastery.length === 0 ? (
              <EmptyState
                icon={ListChecks}
                title="No quiz results yet"
                description="Take a quiz to see how well each topic has stuck."
                action={
                  <Button asChild size="sm" variant="outline">
                    <Link href="/quizzes">Take a quiz</Link>
                  </Button>
                }
                className="py-6"
              />
            ) : (
              <ul className="space-y-4">
                {stats.topicMastery.slice(0, 6).map((t) => {
                  const level = masteryLevel(t.mastery)
                  return (
                    <li key={t.topic}>
                      <div className="mb-1.5 flex items-baseline justify-between gap-2 text-sm">
                        <span className="truncate text-foreground">{t.topic}</span>
                        <span className="shrink-0 text-xs">
                          <span className={cn('font-medium', level.text)}>{level.label}</span>
                          <span className="tabular ml-1.5 text-muted-foreground">{t.mastery}%</span>
                        </span>
                      </div>
                      <div
                        role="progressbar"
                        aria-label={`${t.topic} mastery`}
                        aria-valuenow={t.mastery}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuetext={`${t.mastery}% — ${level.label}`}
                        className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
                      >
                        <div className={cn('h-full rounded-full', level.bar)} style={{ width: `${t.mastery}%` }} />
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Activity chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Last 7 days</CardTitle>
            <CardDescription>Study actions per day</CardDescription>
          </CardHeader>
          <CardContent>
            {weekTotal === 0 ? (
              <EmptyState
                icon={BarChart3}
                title="Nothing this week yet"
                description="Adding material, making cards and taking quizzes all count."
                className="py-8"
              />
            ) : (
              <div
                role="img"
                aria-label={`Bar chart of study actions over the last 7 days: ${stats.last7Days
                  .map((d) => `${d.label} ${d.actions}`)
                  .join(', ')}`}
              >
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats.last7Days} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke={chartTheme.grid} />
                    <XAxis dataKey="label" tick={chartTheme.tick} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={chartTheme.tick} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={chartTheme.tooltip.contentStyle}
                      labelStyle={chartTheme.tooltip.labelStyle}
                      itemStyle={chartTheme.tooltip.itemStyle}
                      cursor={chartTheme.tooltip.cursor}
                    />
                    <Bar dataKey="actions" name="Actions" fill={chartTheme.series[0]} radius={[3, 3, 0, 0]} maxBarSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            {activity.length === 0 ? (
              <EmptyState icon={History} title="No activity yet" className="py-6" />
            ) : (
              <ul className="divide-y divide-border">
                {activity.slice(0, 6).map((a) => {
                  const Icon = activityIcons[a.type] ?? History
                  return (
                    <li key={a.id} className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0">
                      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm leading-snug text-foreground [overflow-wrap:anywhere]">{a.text}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          <time dateTime={a.at}>{formatDistanceToNow(new Date(a.at), { addSuffix: true })}</time>
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function GettingStarted() {
  const { stats, flashcards } = useStudyData()
  const reviewedOrMade = stats.ownFlashcardsCount > 0

  const steps = [
    {
      title: 'Add your material',
      body: 'Upload a PDF or text file, or paste your notes. You get a summary, key terms and facts.',
      href: '/upload',
      cta: 'Add material',
      done: stats.materialsCount > 0,
    },
    {
      title: 'Review flashcards',
      body:
        flashcards.length > 0
          ? 'Make cards from your material. There are a few example cards to try first.'
          : 'Make cards from your material and flip through them.',
      href: '/flashcards',
      cta: 'Open flashcards',
      done: reviewedOrMade,
    },
    {
      title: 'Take a quiz',
      body: 'Check what has stuck. Your scores feed topic mastery and progress.',
      href: '/quizzes',
      cta: 'Open quizzes',
      done: stats.quizzesTaken > 0,
    },
  ]

  return (
    <div className={cn(container, 'max-w-3xl')}>
      <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Start with your <span className="marker">notes</span>
      </h2>
      <p className="mt-3 max-w-prose text-muted-foreground">
        Add a chapter, lecture slides or a page of notes. StudyGenie turns it into a summary, flashcards and a
        quiz. This page fills in as you study.
      </p>

      <ol className="mt-8 space-y-3">
        {steps.map((s, i) => (
          <li key={s.title}>
            <Card className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
              <div className="flex flex-1 items-start gap-3">
                {s.done ? (
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" aria-hidden="true" />
                ) : (
                  <Circle className="mt-0.5 size-5 shrink-0 text-border-strong" aria-hidden="true" />
                )}
                <div>
                  <p className="font-medium text-foreground">
                    <span className="tabular mr-1.5 font-mono text-xs text-muted-foreground">0{i + 1}</span>
                    {s.title}
                    <span className="sr-only">{s.done ? ' (done)' : ' (not done yet)'}</span>
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
                </div>
              </div>
              <Button asChild variant={i === 0 && !s.done ? 'default' : 'outline'} size="sm" className="shrink-0 self-start sm:self-center">
                <Link href={s.href}>{s.done ? 'Open' : s.cta}</Link>
              </Button>
            </Card>
          </li>
        ))}
      </ol>
    </div>
  )
}
