'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, Sparkles, CheckSquare, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import type { StudyPlan, PlanTask } from '@/types'

const TASK_COLORS: Record<string, string> = {
  study: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  revision: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
  quiz: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
  flashcards: 'bg-green-500/10 border-green-500/30 text-green-400',
}

const TASK_ICONS: Record<string, string> = {
  study: '📚',
  revision: '🔄',
  quiz: '🏆',
  flashcards: '🃏',
}

export default function StudyPlannerPage() {
  const [subject, setSubject] = useState('')
  const [examDate, setExamDate] = useState('')
  const [dailyHours, setDailyHours] = useState('2')
  const [topics, setTopics] = useState('')
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState<StudyPlan | null>(null)
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set())

  async function handleGenerate() {
    if (!subject || !examDate) {
      toast({ title: 'Missing fields', description: 'Please enter subject and exam date.', variant: 'destructive' })
      return
    }
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
        subject,
        exam_date: examDate,
        daily_hours: Number(dailyHours),
        daily_plan: data.daily_plan ?? [],
        weekly_plan: data.weekly_plan ?? [],
        created_at: new Date().toISOString(),
      })
      toast({ title: 'Study plan generated!' })
    } catch (e) {
      toast({ title: 'Failed to generate plan', description: String(e), variant: 'destructive' })
    } finally {
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

  function TaskItem({ task }: { task: PlanTask }) {
    const completed = completedTasks.has(task.id)
    return (
      <button
        onClick={() => toggleTask(task.id)}
        className={cn(
          'w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all duration-150',
          TASK_COLORS[task.type],
          completed && 'opacity-50'
        )}
      >
        {completed ? <CheckSquare className="w-4 h-4 shrink-0" /> : <Square className="w-4 h-4 shrink-0" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm">{TASK_ICONS[task.type]}</span>
            <span className={cn('text-sm font-medium', completed && 'line-through')}>{task.title}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <Clock className="w-3 h-3 opacity-70" />
            <span className="text-xs opacity-70">{task.duration_minutes} min</span>
            <span className="text-xs opacity-50">• {task.topic}</span>
          </div>
        </div>
        <Badge variant="outline" className="text-xs capitalize shrink-0">{task.type}</Badge>
      </button>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Form */}
      <Card className="glass border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Generate Study Plan
          </CardTitle>
          <CardDescription>Fill in your details and AI will create a personalized study schedule</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Subject / Course</Label>
              <Input placeholder="e.g. Biology" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Exam Date</Label>
              <Input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="space-y-1.5">
              <Label>Daily Study Hours</Label>
              <Input type="number" min="1" max="12" placeholder="2" value={dailyHours} onChange={(e) => setDailyHours(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Topics to Cover <span className="text-muted-foreground text-xs">(optional, comma-separated)</span></Label>
              <Input placeholder="e.g. Cell Biology, Genetics, Ecology" value={topics} onChange={(e) => setTopics(e.target.value)} />
            </div>
          </div>
          <Button onClick={handleGenerate} disabled={loading} className="w-full gap-2" size="lg">
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Generating your plan...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Study Plan
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Plan display */}
      <AnimatePresence>
        {plan && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="glass border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Your Study Plan — {plan.subject}
                </CardTitle>
                <CardDescription>
                  Exam: {new Date(plan.exam_date).toLocaleDateString()} • {plan.daily_hours}h/day
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="daily">
                  <TabsList className="mb-6">
                    <TabsTrigger value="daily">Day View</TabsTrigger>
                    <TabsTrigger value="weekly">Week View</TabsTrigger>
                  </TabsList>

                  <TabsContent value="daily" className="space-y-6">
                    {plan.daily_plan.map((day, i) => (
                      <div key={i}>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </h3>
                        <div className="space-y-2">
                          {day.tasks.map((task) => <TaskItem key={task.id} task={task} />)}
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="weekly" className="space-y-6">
                    {plan.weekly_plan.map((week, i) => (
                      <div key={i}>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-3">Week {week.week_number}</h3>
                        <div className="flex gap-2 flex-wrap mb-3">
                          {week.focus_topics.map((t) => (
                            <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                          ))}
                        </div>
                        <div className="space-y-2">
                          {week.tasks.map((task) => <TaskItem key={task.id} task={task} />)}
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>

                {/* Legend */}
                <div className="mt-6 flex gap-3 flex-wrap text-xs text-muted-foreground border-t border-border pt-4">
                  {Object.entries(TASK_ICONS).map(([type, icon]) => (
                    <span key={type} className="flex items-center gap-1 capitalize">
                      {icon} {type}
                    </span>
                  ))}
                  <span className="ml-auto">
                    {completedTasks.size} / {plan.daily_plan.reduce((a, d) => a + d.tasks.length, 0) + plan.weekly_plan.reduce((a, w) => a + w.tasks.length, 0)} tasks completed
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
