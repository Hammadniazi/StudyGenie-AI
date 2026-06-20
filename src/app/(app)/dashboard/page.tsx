'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import { motion } from 'framer-motion'
import {
  Flame,
  BookOpen,
  Target,
  Trophy,
  Bot,
  CreditCard,
  Zap,
  TrendingUp,
  Lightbulb,
  Clock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { DashboardStats } from '@/types'

const MOCK_STATS: DashboardStats = {
  total_study_sessions: 24,
  study_streak: 7,
  topics_learned: 42,
  exam_readiness_score: 78,
  xp_points: 3450,
  badges: ['First Quiz', '7-Day Streak', 'Flash Master', 'AI Explorer'],
  topic_mastery: [
    { id: '1', user_id: '', topic: 'Photosynthesis', mastery_percentage: 85, last_updated: '' },
    { id: '2', user_id: '', topic: 'Cell Division', mastery_percentage: 62, last_updated: '' },
    { id: '3', user_id: '', topic: 'DNA Replication', mastery_percentage: 74, last_updated: '' },
    { id: '4', user_id: '', topic: 'Protein Synthesis', mastery_percentage: 41, last_updated: '' },
    { id: '5', user_id: '', topic: 'Genetics', mastery_percentage: 90, last_updated: '' },
  ],
  weak_areas: ['Protein Synthesis', 'Cell Division'],
  weekly_progress: [
    { day: 'Mon', study_hours: 2.5, quiz_score: 72 },
    { day: 'Tue', study_hours: 1.5, quiz_score: 80 },
    { day: 'Wed', study_hours: 3, quiz_score: 85 },
    { day: 'Thu', study_hours: 2, quiz_score: 78 },
    { day: 'Fri', study_hours: 1, quiz_score: 90 },
    { day: 'Sat', study_hours: 3.5, quiz_score: 88 },
    { day: 'Sun', study_hours: 2, quiz_score: 82 },
  ],
}

const MOCK_INSIGHTS = [
  'Your quiz accuracy jumped 15% this week — keep reviewing Genetics flashcards daily.',
  'You have a 7-day streak! Study at least 30 minutes today to maintain it.',
  'Protein Synthesis is your weakest area at 41% mastery — dedicate tomorrow morning to it.',
]

const MOCK_ACTIVITY = [
  { icon: CreditCard, text: 'Completed 20 Flashcards — Biology Ch. 5', time: '2 hours ago', color: 'text-blue-400' },
  { icon: Trophy, text: 'Scored 88% on Cell Division Quiz', time: '5 hours ago', color: 'text-yellow-400' },
  { icon: Bot, text: 'AI Tutor session on DNA Replication (45 min)', time: 'Yesterday', color: 'text-purple-400' },
  { icon: BookOpen, text: 'Uploaded "Biology Chapter 6" material', time: '2 days ago', color: 'text-green-400' },
]

function getMasteryColor(p: number) {
  if (p >= 80) return 'bg-green-500'
  if (p >= 60) return 'bg-yellow-500'
  if (p >= 40) return 'bg-orange-500'
  return 'bg-red-500'
}

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }
const stagger = { visible: { transition: { staggerChildren: 0.08 } } }

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [insights, setInsights] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate fetch / use mock data
    const timer = setTimeout(() => {
      setStats(MOCK_STATS)
      setInsights(MOCK_INSIGHTS)
      setLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  const statCards = stats
    ? [
        { label: 'Study Streak', value: `${stats.study_streak} days`, icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
        { label: 'Topics Learned', value: stats.topics_learned, icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
        { label: 'XP Points', value: stats.xp_points.toLocaleString(), icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
        { label: 'Exam Readiness', value: `${stats.exam_readiness_score}%`, icon: Target, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
      ]
    : []

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Stat cards */}
      <motion.div initial="hidden" animate="visible" variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="glass border-border">
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24 mb-3" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))
          : statCards.map(({ label, value, icon: Icon, color, bg }) => (
              <motion.div key={label} variants={fadeUp}>
                <Card className="glass border-border hover:border-primary/20 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-muted-foreground">{label}</p>
                      <div className={`p-2 rounded-lg border ${bg}`}>
                        <Icon className={`w-4 h-4 ${color}`} />
                      </div>
                    </div>
                    <p className={`text-3xl font-bold ${color}`}>{value}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly progress chart */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="lg:col-span-2">
          <Card className="glass border-border h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="w-4 h-4 text-primary" />
                Weekly Progress
              </CardTitle>
              <CardDescription>Study hours and quiz scores this week</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-48 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats?.weekly_progress ?? []} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 20%)" />
                    <XAxis dataKey="day" tick={{ fill: 'hsl(215 20% 65%)', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'hsl(215 20% 65%)', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: 'hsl(222 47% 9%)', border: '1px solid hsl(217 33% 20%)', borderRadius: '8px', color: 'hsl(210 40% 95%)' }}
                      cursor={{ fill: 'rgba(139,92,246,0.08)' }}
                    />
                    <Bar dataKey="study_hours" name="Study Hours" fill="hsl(262 83% 68%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="quiz_score" name="Quiz Score %" fill="hsl(214 100% 60%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Topic Mastery */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <Card className="glass border-border h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="w-4 h-4 text-primary" />
                Topic Mastery
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="space-y-1">
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-2 w-full" />
                    </div>
                  ))
                : stats?.topic_mastery.map((t) => (
                    <div key={t.topic}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-foreground">{t.topic}</span>
                        <span className="text-muted-foreground">{t.mastery_percentage}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${getMasteryColor(t.mastery_percentage)}`}
                          style={{ width: `${t.mastery_percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Insights */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="lg:col-span-2">
          <Card className="glass border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Lightbulb className="w-4 h-4 text-yellow-400" />
                AI Insights
              </CardTitle>
              <CardDescription>Personalized recommendations based on your progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading
                ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
                : insights.map((insight, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-lg bg-secondary/50 border border-border">
                      <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary">{i + 1}</span>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">{insight}</p>
                    </div>
                  ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-4">
          <Card className="glass border-border">
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/tutor">
                <Button className="w-full justify-start gap-2" variant="outline">
                  <Bot className="w-4 h-4 text-purple-400" />
                  Start AI Tutor
                </Button>
              </Link>
              <Link href="/quizzes">
                <Button className="w-full justify-start gap-2" variant="outline">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  Take Quiz
                </Button>
              </Link>
              <Link href="/flashcards">
                <Button className="w-full justify-start gap-2" variant="outline">
                  <CreditCard className="w-4 h-4 text-blue-400" />
                  Review Flashcards
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Badges */}
          <Card className="glass border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-400" />
                Badges Earned
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-16 w-full" />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {stats?.badges.map((badge) => (
                    <Badge key={badge} variant="secondary" className="text-xs">
                      {badge}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <Card className="glass border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="w-4 h-4 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
              : MOCK_ACTIVITY.map(({ icon: Icon, text, time, color }, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border hover:border-primary/20 transition-colors">
                    <Icon className={`w-4 h-4 shrink-0 ${color}`} />
                    <p className="text-sm text-foreground flex-1">{text}</p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{time}</span>
                  </div>
                ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
