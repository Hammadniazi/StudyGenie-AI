'use client'

import { useRef, useState } from 'react'
import { BookOpen, RotateCcw, ListChecks, Layers, Clock, Check, Loader2, CalendarDays } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from '@/components/ui/use-toast'
import { useStudyData } from '@/contexts/study-data-context'
import { cn } from '@/lib/utils'
import type { StudyPlan, PlanTask } from '@/types'

const TASK_TYPES: Record<PlanTask['type'], { label: string; icon: LucideIcon; chip: string }> = {
  study: { label: 'Study', icon: BookOpen, chip: 'bg-primary-soft text-primary' },
  revision: { label: 'Revision', icon: RotateCcw, chip: 'bg-warning-soft text-warning' },
  quiz: { label: 'Quiz', icon: ListChecks, chip: 'bg-success-soft text-success' },
  flashcards: { label: 'Flashcards', icon: Layers, chip: 'bg-muted text-muted-foreground' },
}

/** "YYYY-MM-DD" → local date (avoids the UTC off-by-one from `new Date("2026-01-05")`). */
function parseLocalDate(s: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? new Date(`${s}T00:00:00`) : new Date(s)
}

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function TaskItem({ task, completed, onToggle }: { task: PlanTask; completed: boolean; onToggle: () => void }) {
  const type = TASK_TYPES[task.type] ?? TASK_TYPES.study
  const Icon = type.icon
  return (
    <li className={cn('flex items-center gap-3 rounded-md border border-border bg-card p-2 pr-3 transition-opacity', completed && 'opacity-60')}>
      <button
        type="button"
        role="checkbox"
        aria-checked={completed}
        aria-label={`${task.title} — ${completed ? 'done' : 'not done'}`}
        onClick={onToggle}
        className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-md hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span
          aria-hidden="true"
          className={cn(
            'grid size-5 place-items-center rounded-sm border transition-colors',
            completed ? 'border-primary bg-primary text-primary-foreground' : 'border-border-strong bg-card'
          )}
        >
          {completed && <Check className="size-3.5" strokeWidth={3} />}
        </span>
      </button>
      <div className="min-w-0 flex-1">
        <p className={cn('text-sm font-medium text-foreground', completed && 'line-through decoration-muted-foreground')}>
          {task.title}
        </p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3" aria-hidden="true" />
            <span className="tabular">{task.duration_minutes} min</span>
          </span>
          {task.topic && (
            <>
              <span aria-hidden="true">·</span>
              <span>{task.topic}</span>
            </>
          )}
        </p>
      </div>
      <span className={cn('inline-flex shrink-0 items-center gap-1 rounded-sm px-1.5 py-1 text-xs font-medium', type.chip)}>
        <Icon className="size-3" aria-hidden="true" />
        {type.label}
      </span>
    </li>
  )
}

export default function StudyPlannerPage() {
  const { logActivity } = useStudyData()
  const [subject, setSubject] = useState('')
  const [examDate, setExamDate] = useState('')
  const [dailyHours, setDailyHours] = useState('2')
  const [topics, setTopics] = useState('')
  const [errors, setErrors] = useState<{ subject?: string; examDate?: string }>({})
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState<StudyPlan | null>(null)
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set())
  const busy = useRef(false)
  const subjectRef = useRef<HTMLInputElement>(null)
  const dateRef = useRef<HTMLInputElement>(null)

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    if (busy.current) return

    const nextErrors: typeof errors = {}
    if (!subject.trim()) nextErrors.subject = 'Enter the subject or course you’re revising for.'
    if (!examDate) nextErrors.examDate = 'Pick the date of your exam.'
    setErrors(nextErrors)
    if (nextErrors.subject) return subjectRef.current?.focus()
    if (nextErrors.examDate) return dateRef.current?.focus()

    busy.current = true
    setLoading(true)
    try {
      const topicsArr = topics.split(',').map((t) => t.trim()).filter(Boolean)
      const res = await fetch('/api/study-plan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, examDate, dailyHours: Number(dailyHours), topics: topicsArr }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setPlan({
        id: '',
        user_id: '',
        subject: subject.trim(),
        exam_date: examDate,
        daily_hours: Number(dailyHours),
        daily_plan: data.daily_plan ?? [],
        weekly_plan: data.weekly_plan ?? [],
        created_at: new Date().toISOString(),
      })
      setCompletedTasks(new Set())
      logActivity('plan', `Made a study plan for ${subject.trim()}`)
      toast({ title: 'Study plan ready', description: 'Tick tasks off as you go.' })
    } catch {
      toast({
        title: 'Couldn’t build a plan',
        description: 'Try again in a moment. Listing fewer topics can also help.',
        variant: 'destructive',
      })
    } finally {
      busy.current = false
      setLoading(false)
    }
  }

  function toggleTask(taskId: string) {
    setCompletedTasks((prev) => {
      const next = new Set(prev)
      if (next.has(taskId)) next.delete(taskId)
      else next.add(taskId)
      return next
    })
  }

  const totalTasks = plan
    ? plan.daily_plan.reduce((a, d) => a + d.tasks.length, 0) + plan.weekly_plan.reduce((a, w) => a + w.tasks.length, 0)
    : 0
  const daysLeft = plan
    ? Math.max(0, Math.ceil((parseLocalDate(plan.exam_date).getTime() - parseLocalDate(todayISO()).getTime()) / 86_400_000))
    : 0

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:py-8">
      <Card>
        <CardHeader>
          <CardTitle>Plan your revision</CardTitle>
          <CardDescription>Tell us when the exam is and how much time you have. You’ll get a day-by-day schedule.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} noValidate className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="plan-subject">Subject or course</Label>
                <Input
                  id="plan-subject"
                  ref={subjectRef}
                  placeholder="e.g. Biology"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  aria-invalid={!!errors.subject}
                  aria-describedby={errors.subject ? 'plan-subject-error' : undefined}
                  required
                />
                {errors.subject && (
                  <p id="plan-subject-error" role="alert" className="text-sm text-danger">{errors.subject}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="plan-date">Exam date</Label>
                <Input
                  id="plan-date"
                  ref={dateRef}
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  min={todayISO()}
                  aria-invalid={!!errors.examDate}
                  aria-describedby={errors.examDate ? 'plan-date-error' : undefined}
                  required
                />
                {errors.examDate && (
                  <p id="plan-date-error" role="alert" className="text-sm text-danger">{errors.examDate}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="plan-hours">Hours per day</Label>
                <Input
                  id="plan-hours"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="12"
                  value={dailyHours}
                  onChange={(e) => setDailyHours(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="plan-topics">
                  Topics <span className="font-normal text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="plan-topics"
                  placeholder="Cell biology, Genetics, Ecology"
                  value={topics}
                  onChange={(e) => setTopics(e.target.value)}
                  aria-describedby="plan-topics-hint"
                />
                <p id="plan-topics-hint" className="text-xs text-muted-foreground">Separate topics with commas.</p>
              </div>
            </div>
            <Button type="submit" disabled={loading} aria-busy={loading} className="w-full" size="lg">
              {loading ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden="true" />
                  Building your schedule…
                </>
              ) : (
                <>
                  <CalendarDays aria-hidden="true" />
                  Build my plan
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {plan && (
        <Card>
          <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="font-display text-xl font-semibold">{plan.subject}</CardTitle>
              <CardDescription className="tabular">
                Exam {parseLocalDate(plan.exam_date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}
                {' · '}
                {daysLeft === 0 ? 'today' : `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} to go`}
                {' · '}
                {plan.daily_hours}h a day
              </CardDescription>
            </div>
            <div className="w-full sm:w-48">
              <p className="tabular mb-1.5 text-right text-xs text-muted-foreground">
                {completedTasks.size} of {totalTasks} tasks done
              </p>
              <Progress value={totalTasks ? (completedTasks.size / totalTasks) * 100 : 0} aria-label="Tasks completed" />
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="daily">
              <TabsList className="mb-5">
                <TabsTrigger value="daily">By day</TabsTrigger>
                <TabsTrigger value="weekly">By week</TabsTrigger>
              </TabsList>

              <TabsContent value="daily" className="space-y-6">
                {plan.daily_plan.map((day, i) => (
                  <section key={i} aria-labelledby={`day-${i}`}>
                    <h3 id={`day-${i}`} className="mb-2 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {parseLocalDate(day.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                    </h3>
                    <ul className="space-y-2">
                      {day.tasks.map((task) => (
                        <TaskItem key={task.id} task={task} completed={completedTasks.has(task.id)} onToggle={() => toggleTask(task.id)} />
                      ))}
                    </ul>
                  </section>
                ))}
              </TabsContent>

              <TabsContent value="weekly" className="space-y-6">
                {plan.weekly_plan.map((week, i) => (
                  <section key={i} aria-labelledby={`week-${i}`}>
                    <h3 id={`week-${i}`} className="mb-2 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Week {week.week_number}
                    </h3>
                    {week.focus_topics.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-1.5">
                        {week.focus_topics.map((t) => (
                          <Badge key={t} variant="outline">{t}</Badge>
                        ))}
                      </div>
                    )}
                    <ul className="space-y-2">
                      {week.tasks.map((task) => (
                        <TaskItem key={task.id} task={task} completed={completedTasks.has(task.id)} onToggle={() => toggleTask(task.id)} />
                      ))}
                    </ul>
                  </section>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
