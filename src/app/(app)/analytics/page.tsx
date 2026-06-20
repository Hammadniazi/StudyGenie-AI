'use client'

import {
  BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { BarChart3, Trophy, Flame, Target, TrendingUp, AlertTriangle, BookOpen } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const STUDY_HOURS = [
  { week: 'Week 1', hours: 12 },
  { week: 'Week 2', hours: 15 },
  { week: 'Week 3', hours: 10 },
  { week: 'Week 4', hours: 18 },
  { week: 'Week 5', hours: 14 },
  { week: 'Week 6', hours: 20 },
]

const QUIZ_ACCURACY = [
  { date: 'Jun 1', score: 62 },
  { date: 'Jun 5', score: 70 },
  { date: 'Jun 8', score: 68 },
  { date: 'Jun 12', score: 78 },
  { date: 'Jun 15', score: 82 },
  { date: 'Jun 18', score: 88 },
]

const RADAR_DATA = [
  { topic: 'Cell Biology', A: 85 },
  { topic: 'Genetics', A: 90 },
  { topic: 'Biochemistry', A: 65 },
  { topic: 'Protein Synthesis', A: 41 },
  { topic: 'Cell Division', A: 62 },
  { topic: 'Ecology', A: 73 },
]

const STREAK_DAYS = Array.from({ length: 35 }, (_, i) => ({
  day: i,
  active: [0,1,2,4,5,6,7,8,10,11,12,13,14,15,16,17,18,19,21,22,23,24,25,26,27,28,29,30,31,32,33,34].includes(i),
}))

const BADGES = [
  { name: 'First Quiz', icon: '🏆', desc: 'Completed your first quiz' },
  { name: '7-Day Streak', icon: '🔥', desc: 'Studied 7 days in a row' },
  { name: 'Flash Master', icon: '🃏', desc: 'Reviewed 100 flashcards' },
  { name: 'AI Explorer', icon: '🤖', desc: 'Had 10 AI tutor sessions' },
  { name: 'High Scorer', icon: '⭐', desc: 'Scored 90%+ on a quiz' },
  { name: 'Bookworm', icon: '📚', desc: 'Uploaded 5 study materials' },
]

const WEAK_AREAS = [
  { topic: 'Protein Synthesis', mastery: 41, recommendation: 'Review Chapter 7 and generate new flashcards' },
  { topic: 'Cell Division', mastery: 62, recommendation: 'Take the mitosis/meiosis quiz again' },
  { topic: 'Biochemistry', mastery: 65, recommendation: 'Use AI tutor to practice enzyme kinetics' },
]

const chartTheme = {
  grid: 'hsl(217 33% 20%)',
  tick: 'hsl(215 20% 65%)',
  tooltip: { background: 'hsl(222 47% 9%)', border: '1px solid hsl(217 33% 20%)', borderRadius: '8px', color: 'hsl(210 40% 95%)' },
}

export default function AnalyticsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Study Hours', value: '89h', icon: BookOpen, color: 'text-blue-400', sub: 'Total this month' },
          { label: 'Quiz Average', value: '78%', icon: Trophy, color: 'text-yellow-400', sub: '+8% from last month' },
          { label: 'Current Streak', value: '7 days', icon: Flame, color: 'text-orange-400', sub: 'Personal best: 12' },
          { label: 'Topics Mastered', value: '3 / 6', icon: Target, color: 'text-green-400', sub: '50% overall' },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <Card key={label} className="glass border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">{label}</p>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Study hours bar chart */}
        <Card className="glass border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="w-4 h-4 text-primary" />
              Weekly Study Hours
            </CardTitle>
            <CardDescription>Hours studied per week over 6 weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={STUDY_HOURS}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                <XAxis dataKey="week" tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={chartTheme.tooltip} />
                <Bar dataKey="hours" name="Hours" fill="hsl(262 83% 68%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quiz accuracy line chart */}
        <Card className="glass border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-4 h-4 text-green-400" />
              Quiz Accuracy Trend
            </CardTitle>
            <CardDescription>Score progression over recent quizzes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={QUIZ_ACCURACY}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                <XAxis dataKey="date" tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={chartTheme.tooltip} />
                <Line type="monotone" dataKey="score" name="Score %" stroke="hsl(142 70% 50%)" strokeWidth={2} dot={{ fill: 'hsl(142 70% 50%)', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar / Topic mastery */}
        <Card className="glass border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="w-4 h-4 text-primary" />
              Topic Mastery Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={RADAR_DATA}>
                <PolarGrid stroke={chartTheme.grid} />
                <PolarAngleAxis dataKey="topic" tick={{ fill: chartTheme.tick, fontSize: 10 }} />
                <Radar name="Mastery" dataKey="A" stroke="hsl(262 83% 68%)" fill="hsl(262 83% 68%)" fillOpacity={0.2} />
                <Tooltip contentStyle={chartTheme.tooltip} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Streak heatmap */}
        <Card className="glass border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Flame className="w-4 h-4 text-orange-400" />
              Study Streak Heatmap
            </CardTitle>
            <CardDescription>Last 5 weeks of activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1.5">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <div key={i} className="text-center text-xs text-muted-foreground pb-1">{d}</div>
              ))}
              {STREAK_DAYS.map(({ day, active }) => (
                <div
                  key={day}
                  className={`h-7 rounded ${active ? 'bg-orange-500/70' : 'bg-secondary'} transition-colors`}
                  title={`Day ${day + 1}: ${active ? 'Studied' : 'Not studied'}`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              {STREAK_DAYS.filter((d) => d.active).length} / 35 days active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Weak areas */}
      <Card className="glass border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            Weak Areas & Recommendations
          </CardTitle>
          <CardDescription>Topics that need more focus based on your quiz performance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {WEAK_AREAS.map(({ topic, mastery, recommendation }) => (
            <div key={topic} className="p-4 rounded-lg bg-secondary/50 border border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{topic}</span>
                <Badge variant={mastery < 50 ? 'destructive' : 'secondary'} className="text-xs">{mastery}% mastery</Badge>
              </div>
              <Progress value={mastery} className="h-1.5" />
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span className="text-yellow-400">Tip:</span>
                {recommendation}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Badges */}
      <Card className="glass border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="w-4 h-4 text-yellow-400" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {BADGES.map(({ name, icon, desc }) => (
              <div key={name} className="flex flex-col items-center text-center gap-2 p-3 rounded-xl glass border border-border hover:border-primary/30 transition-colors">
                <span className="text-3xl">{icon}</span>
                <p className="text-xs font-semibold text-foreground">{name}</p>
                <p className="text-xs text-muted-foreground leading-tight">{desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
