'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import {
  Flame,
  ListChecks,
  Percent,
  Layers,
  FileText,
  Award,
  CalendarCheck,
  Target,
  LineChart as LineChartIcon,
  Lock,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/empty-state'
import { useStudyData } from '@/contexts/study-data-context'
import { chartTheme } from '@/lib/chart-theme'
import { cn } from '@/lib/utils'

const container = 'mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8'

const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

function masteryColor(p: number) {
  if (p >= 80) return 'var(--success)'
  if (p >= 60) return 'var(--warning)'
  return 'var(--danger)'
}

// Heatmap intensity steps (0 = none). Uses the primary token at increasing strength.
const heatClasses = ['bg-muted', 'bg-primary/25', 'bg-primary/50', 'bg-primary/75', 'bg-primary']
const heatLevel = (n: number) => (n === 0 ? 0 : n === 1 ? 1 : n <= 3 ? 2 : n <= 5 ? 3 : 4)

export default function AnalyticsPage() {
  const { ready, stats, quizAttempts, activity } = useStudyData()

  if (!ready) {
    return (
      <div className={cn(container, 'space-y-6')}>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    )
  }

  if (!stats.hasOwnData) {
    return (
      <div className={container}>
        <EmptyState
          icon={LineChartIcon}
          title="No progress to show yet"
          description="Add some material, make flashcards and take a quiz. Your scores, topic mastery and study days will appear here."
          action={
            <Button asChild>
              <Link href="/upload">Add material</Link>
            </Button>
          }
          className="py-16"
        />
      </div>
    )
  }

  // ── Derived data ──
  const scoreSeries = [...quizAttempts]
    .reverse()
    .map((a, i) => ({ attempt: `#${i + 1}`, date: format(new Date(a.completedAt), 'MMM d'), score: a.score, title: a.quizTitle }))

  const bestScore = quizAttempts.reduce((m, a) => Math.max(m, a.score), 0)

  const counts = new Map<string, number>()
  for (const a of activity) {
    const k = dayKey(new Date(a.at))
    counts.set(k, (counts.get(k) ?? 0) + 1)
  }
  // 5 full weeks ending this week (Mon–Sun columns).
  const today = new Date()
  const start = new Date(today)
  const weekday = (today.getDay() + 6) % 7 // Mon = 0
  start.setDate(today.getDate() - weekday - 28)
  const heatDays = Array.from({ length: 35 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const n = counts.get(dayKey(d)) ?? 0
    return { date: d, count: n, future: d > today }
  })
  const activeDays = heatDays.filter((d) => d.count > 0).length

  const tiles = [
    { label: 'Current streak', value: `${stats.streak} ${stats.streak === 1 ? 'day' : 'days'}`, icon: Flame },
    { label: 'Quizzes taken', value: String(stats.quizzesTaken), icon: ListChecks },
    { label: 'Average score', value: stats.averageScore === null ? '—' : `${stats.averageScore}%`, icon: Percent },
    { label: 'Cards made', value: String(stats.ownFlashcardsCount), icon: Layers },
  ]

  const milestones: Array<{ name: string; desc: string; icon: LucideIcon; done: boolean }> = [
    { name: 'First quiz', desc: 'Finish a quiz', icon: ListChecks, done: stats.quizzesTaken >= 1 },
    { name: '3-day streak', desc: 'Study 3 days in a row', icon: Flame, done: stats.streak >= 3 },
    { name: '7-day streak', desc: 'Study 7 days in a row', icon: CalendarCheck, done: stats.streak >= 7 },
    { name: '50 flashcards', desc: 'Make 50 cards', icon: Layers, done: stats.ownFlashcardsCount >= 50 },
    { name: '5 materials', desc: 'Add 5 study materials', icon: FileText, done: stats.materialsCount >= 5 },
    { name: 'Top marks', desc: 'Score 90% or more on a quiz', icon: Award, done: bestScore >= 90 },
  ]

  return (
    <div className={cn(container, 'space-y-6')}>
      <section aria-label="Summary" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{label}</p>
              <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
            </div>
            <p className="tabular mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">{value}</p>
          </Card>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quiz scores */}
        <Card>
          <CardHeader>
            <CardTitle>Quiz scores</CardTitle>
            <CardDescription>Each attempt, oldest to newest</CardDescription>
          </CardHeader>
          <CardContent>
            {scoreSeries.length === 0 ? (
              <EmptyState
                icon={ListChecks}
                title="No quiz attempts yet"
                description="Example quizzes don't count. Generate one from your material."
                action={
                  <Button asChild size="sm" variant="outline">
                    <Link href="/quizzes">Go to quizzes</Link>
                  </Button>
                }
                className="py-8"
              />
            ) : (
              <div
                role="img"
                aria-label={`Line chart of quiz scores across ${scoreSeries.length} attempts: ${scoreSeries
                  .map((s) => `${s.attempt} ${s.score}%`)
                  .join(', ')}`}
              >
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={scoreSeries} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke={chartTheme.grid} />
                    <XAxis dataKey="attempt" tick={chartTheme.tick} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} unit="%" tick={chartTheme.tick} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={chartTheme.tooltip.contentStyle}
                      labelStyle={chartTheme.tooltip.labelStyle}
                      itemStyle={chartTheme.tooltip.itemStyle}
                      labelFormatter={(_, payload) => {
                        const p = payload?.[0]?.payload as (typeof scoreSeries)[number] | undefined
                        return p ? `${p.title} · ${p.date}` : ''
                      }}
                      formatter={(v) => [`${v}%`, 'Score']}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, color: 'var(--muted-foreground)' }} />
                    <Line
                      type="monotone"
                      dataKey="score"
                      name="Score"
                      stroke={chartTheme.series[0]}
                      strokeWidth={2}
                      dot={{ r: 3.5, fill: chartTheme.series[0], strokeWidth: 0 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Topic mastery */}
        <Card>
          <CardHeader>
            <CardTitle>Topic mastery</CardTitle>
            <CardDescription>Share of questions answered correctly, per topic</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.topicMastery.length === 0 ? (
              <EmptyState
                icon={Target}
                title="No topics scored yet"
                description="Topic mastery comes from quiz answers."
                className="py-8"
              />
            ) : (
              <>
                <div
                  role="img"
                  aria-label={`Bar chart of topic mastery: ${stats.topicMastery
                    .map((t) => `${t.topic} ${t.mastery}%`)
                    .join(', ')}`}
                >
                  <ResponsiveContainer width="100%" height={Math.max(160, stats.topicMastery.length * 36 + 24)}>
                    <BarChart
                      data={stats.topicMastery}
                      layout="vertical"
                      margin={{ top: 0, right: 12, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid horizontal={false} stroke={chartTheme.grid} />
                      <XAxis type="number" domain={[0, 100]} unit="%" tick={chartTheme.tick} axisLine={false} tickLine={false} />
                      <YAxis
                        type="category"
                        dataKey="topic"
                        width={120}
                        tick={chartTheme.tick}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={chartTheme.tooltip.contentStyle}
                        labelStyle={chartTheme.tooltip.labelStyle}
                        itemStyle={chartTheme.tooltip.itemStyle}
                        cursor={chartTheme.tooltip.cursor}
                        formatter={(v, _n, item) => [
                          `${v}% (${(item?.payload as { answered?: number })?.answered ?? 0} answered)`,
                          'Mastery',
                        ]}
                      />
                      <Bar dataKey="mastery" name="Mastery" radius={[0, 3, 3, 0]} maxBarSize={20}>
                        {stats.topicMastery.map((t) => (
                          <Cell key={t.topic} fill={masteryColor(t.mastery)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground" aria-label="Legend">
                  <li className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-success" aria-hidden="true" />Strong (80%+)</li>
                  <li className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-warning" aria-hidden="true" />Getting there (60–79%)</li>
                  <li className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-danger" aria-hidden="true" />Needs work (under 60%)</li>
                </ul>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Heatmap */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Study days</CardTitle>
            <CardDescription>Last 5 weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="sr-only">
              {activeDays} of the last 35 days had study activity.
            </p>
            <div aria-hidden="true">
              <div className="mb-1.5 grid grid-cols-7 gap-1.5 text-center font-mono text-[10px] uppercase text-muted-foreground">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                  <span key={i}>{d}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {heatDays.map(({ date, count, future }) => (
                  <div
                    key={dayKey(date)}
                    title={future ? undefined : `${format(date, 'EEE, MMM d')}: ${count} ${count === 1 ? 'action' : 'actions'}`}
                    className={cn(
                      'aspect-square rounded-sm',
                      future ? 'border border-dashed border-border bg-transparent' : heatClasses[heatLevel(count)]
                    )}
                  />
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span className="tabular">{activeDays} active days</span>
                <span className="flex items-center gap-1">
                  Less
                  {heatClasses.map((c) => (
                    <span key={c} className={cn('size-3 rounded-sm', c)} />
                  ))}
                  More
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Milestones */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Milestones</CardTitle>
            <CardDescription>
              <span className="tabular">{milestones.filter((m) => m.done).length}</span> of {milestones.length} reached
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {milestones.map(({ name, desc, icon: Icon, done }) => (
                <li
                  key={name}
                  className={cn(
                    'flex items-center gap-3 rounded-md border p-3',
                    done ? 'border-border bg-card' : 'border-dashed border-border bg-muted/40'
                  )}
                >
                  <div
                    className={cn(
                      'grid size-9 shrink-0 place-items-center rounded-md',
                      done ? 'bg-primary-soft text-primary' : 'bg-muted text-muted-foreground'
                    )}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn('text-sm font-medium', done ? 'text-foreground' : 'text-muted-foreground')}>{name}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  {done ? (
                    <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-success">
                      <CheckCircle2 className="size-3.5" aria-hidden="true" />
                      Reached
                    </span>
                  ) : (
                    <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                      <Lock className="size-3.5" aria-hidden="true" />
                      Locked
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
