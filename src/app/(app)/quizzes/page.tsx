'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, CheckCircle, XCircle, ArrowRight, RotateCcw, Sparkles, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'
import { useStudyData } from '@/contexts/study-data-context'
import type { Quiz, QuizResult } from '@/types'
import { v4 as uuidv4 } from 'uuid'

type QuizView = 'list' | 'taking' | 'results'

export default function QuizzesPage() {
  const { quizzes, addQuiz } = useStudyData()

  const [view, setView] = useState<QuizView>('list')
  const [activeQuiz, setActiveQuiz] = useState<Quiz>(quizzes[0])
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<QuizResult | null>(null)
  const [generating, setGenerating] = useState(false)

  const question = activeQuiz?.questions[currentQ]
  const progress = activeQuiz ? ((currentQ + 1) / activeQuiz.questions.length) * 100 : 0

  function startQuiz(q: Quiz) {
    setActiveQuiz(q)
    setCurrentQ(0)
    setAnswers({})
    setResult(null)
    setView('taking')
  }

  function handleAnswer(qId: string, answer: string) {
    setAnswers((prev) => ({ ...prev, [qId]: answer }))
  }

  function handleNext() {
    if (currentQ < activeQuiz.questions.length - 1) {
      setCurrentQ((c) => c + 1)
    } else {
      submitQuiz()
    }
  }

  function submitQuiz() {
    const answersArr = activeQuiz.questions.map((q) => ({
      question_id: q.id,
      answer: answers[q.id] ?? '',
      is_correct: (answers[q.id] ?? '').trim().toLowerCase() === q.correct_answer.toLowerCase(),
    }))
    const score = answersArr.filter((a) => a.is_correct).length
    const weakAreas = activeQuiz.questions
      .filter((_, i) => !answersArr[i].is_correct)
      .map((q) => q.topic_tag)
      .filter((v, i, a) => a.indexOf(v) === i)

    setResult({
      id: uuidv4(),
      quiz_id: activeQuiz.id,
      user_id: '',
      score,
      total_questions: activeQuiz.questions.length,
      answers: answersArr,
      weak_areas: weakAreas,
      completed_at: new Date().toISOString(),
    })
    setView('results')
  }

  function resetToList() {
    setCurrentQ(0)
    setAnswers({})
    setResult(null)
    setView('list')
  }

  async function handleGenerate() {
    setGenerating(true)
    try {
      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: 'General knowledge quiz covering science, history, mathematics, and technology.',
          difficulty: 'medium',
          count: 5,
        }),
      })
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        const title = `AI Quiz — ${new Date().toLocaleDateString()}`
        addQuiz(title, 'medium', data)
        toast({ title: 'New quiz added!', description: `${data.length} questions ready on the list.` })
      }
    } catch {
      toast({ title: 'Failed to generate quiz', variant: 'destructive' })
    } finally {
      setGenerating(false)
    }
  }

  // ── List view ──────────────────────────────────────────────────────────────
  if (view === 'list') {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Available Quizzes</h2>
          <Button onClick={handleGenerate} disabled={generating} className="gap-2">
            <Sparkles className="w-4 h-4" />
            {generating ? 'Generating...' : 'Generate Quiz'}
          </Button>
        </div>

        <div className="space-y-3">
          {quizzes.map((q) => {
            const topics = [...new Set(q.questions.map((qn) => qn.topic_tag))].slice(0, 3)
            return (
              <Card key={q.id} className="glass border-border hover:border-primary/30 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-foreground">{q.title}</h3>
                        <Badge variant="secondary">{q.difficulty}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {q.questions.length} questions
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {topics.map((t) => (
                          <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                        ))}
                      </div>
                    </div>
                    <Button size="sm" className="gap-2 shrink-0" onClick={() => startQuiz(q)}>
                      Start <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  // ── Taking view ────────────────────────────────────────────────────────────
  if (view === 'taking' && question) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Question {currentQ + 1} of {activeQuiz.questions.length}</span>
            <Badge variant="outline">{question.topic_tag}</Badge>
          </div>
          <Progress value={progress} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="glass border-border">
              <CardHeader>
                <CardTitle className="text-base font-medium leading-relaxed">{question.question}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {question.type === 'multiple_choice' || question.type === 'true_false' ? (
                  question.options?.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleAnswer(question.id, opt)}
                      className={cn(
                        'w-full text-left px-4 py-3 rounded-lg border text-sm transition-all',
                        answers[question.id] === opt
                          ? 'border-primary bg-primary/10 text-foreground'
                          : 'border-border hover:border-primary/50 hover:bg-secondary/50 text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {opt}
                    </button>
                  ))
                ) : (
                  <Input
                    placeholder="Type your answer..."
                    value={answers[question.id] ?? ''}
                    onChange={(e) => handleAnswer(question.id, e.target.value)}
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between">
          <Button variant="outline" onClick={resetToList}>Cancel</Button>
          <Button onClick={handleNext} disabled={!answers[question.id]} className="gap-2">
            {currentQ === activeQuiz.questions.length - 1 ? 'Submit Quiz' : 'Next'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    )
  }

  // ── Results view ───────────────────────────────────────────────────────────
  if (view === 'results' && result) {
    const pct = Math.round((result.score / result.total_questions) * 100)
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <Card className="glass border-border text-center">
          <CardContent className="p-8">
            <Trophy className={cn('w-16 h-16 mx-auto mb-4', pct >= 70 ? 'text-yellow-400' : 'text-muted-foreground')} />
            <h2 className="text-3xl font-bold mb-1">{pct}%</h2>
            <p className="text-muted-foreground mb-4">
              {result.score} / {result.total_questions} correct
            </p>
            <Badge variant={pct >= 80 ? 'success' : pct >= 60 ? 'secondary' : 'destructive'} className="text-sm px-4 py-1">
              {pct >= 80 ? 'Excellent!' : pct >= 60 ? 'Good work!' : 'Keep practicing!'}
            </Badge>
          </CardContent>
        </Card>

        {result.weak_areas.length > 0 && (
          <Card className="glass border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="w-4 h-4 text-orange-400" />
                Areas to Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                {result.weak_areas.map((a) => (
                  <Badge key={a} variant="destructive" className="text-xs">{a}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {activeQuiz.questions.map((q, i) => {
            const a = result.answers[i]
            return (
              <Card key={q.id} className={cn('border', a.is_correct ? 'border-green-700/40 bg-green-900/10' : 'border-red-700/40 bg-red-900/10')}>
                <CardContent className="p-4">
                  <div className="flex gap-2 mb-2">
                    {a.is_correct
                      ? <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                      : <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
                    <p className="text-sm font-medium text-foreground">{q.question}</p>
                  </div>
                  {!a.is_correct && (
                    <div className="ml-6 space-y-1">
                      <p className="text-xs text-red-400">Your answer: {a.answer || '(no answer)'}</p>
                      <p className="text-xs text-green-400">Correct: {q.correct_answer}</p>
                    </div>
                  )}
                  <p className="ml-6 text-xs text-muted-foreground mt-1">{q.explanation}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Button onClick={resetToList} className="w-full gap-2" variant="outline">
          <RotateCcw className="w-4 h-4" />
          Back to Quizzes
        </Button>
      </div>
    )
  }

  return null
}
