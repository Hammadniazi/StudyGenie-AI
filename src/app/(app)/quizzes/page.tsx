'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle2, XCircle, ArrowRight, ArrowLeft, RotateCcw, ListChecks, FileUp, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge, difficultyVariant } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EmptyState, ExampleNotice } from '@/components/empty-state'
import { cn } from '@/lib/utils'
import { useStudyData, isExample } from '@/contexts/study-data-context'
import type { Quiz } from '@/types'

type QuizView = 'list' | 'taking' | 'results'

interface GradedAnswer {
  questionId: string
  answer: string
  isCorrect: boolean
}

const normalise = (s: string) => s.trim().toLowerCase()

export default function QuizzesPage() {
  const { quizzes, recordQuizAttempt } = useStudyData()

  const [view, setView] = useState<QuizView>('list')
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null)
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [graded, setGraded] = useState<GradedAnswer[] | null>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)

  const question = activeQuiz?.questions[currentQ]
  const total = activeQuiz?.questions.length ?? 0

  // Move focus to the question on each step so keyboard/screen-reader users follow along.
  useEffect(() => {
    if (view !== 'list') headingRef.current?.focus()
  }, [view, currentQ])

  function startQuiz(q: Quiz) {
    setActiveQuiz(q)
    setCurrentQ(0)
    setAnswers({})
    setGraded(null)
    setView('taking')
  }

  function handleAnswer(qId: string, answer: string) {
    setAnswers((prev) => ({ ...prev, [qId]: answer }))
  }

  function submitQuiz() {
    if (!activeQuiz) return
    const result = activeQuiz.questions.map((q) => {
      const answer = answers[q.id] ?? ''
      return { questionId: q.id, answer, isCorrect: normalise(answer) === normalise(q.correct_answer) }
    })
    setGraded(result)
    recordQuizAttempt({
      quizId: activeQuiz.id,
      quizTitle: activeQuiz.title,
      correct: result.filter((a) => a.isCorrect).length,
      total: result.length,
      answers: activeQuiz.questions.map((q, i) => ({ topic: q.topic_tag, isCorrect: result[i].isCorrect })),
    })
    setView('results')
  }

  function handleNext() {
    if (!activeQuiz) return
    if (currentQ < total - 1) setCurrentQ((c) => c + 1)
    else submitQuiz()
  }

  function resetToList() {
    setActiveQuiz(null)
    setCurrentQ(0)
    setAnswers({})
    setGraded(null)
    setView('list')
  }

  // ── List ───────────────────────────────────────────────────────────────────
  if (view === 'list') {
    const ownQuizzes = quizzes.filter((q) => !isExample(q.id))
    return (
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6 lg:py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">Your quizzes</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Quizzes are written from the material you add. Scores feed your progress page.
            </p>
          </div>
          <Button asChild>
            <Link href="/upload">
              <FileUp aria-hidden="true" />
              Make a quiz from notes
            </Link>
          </Button>
        </div>

        {ownQuizzes.length === 0 && (
          <EmptyState
            icon={ListChecks}
            title="No quizzes of your own yet"
            description="Add your notes, summarise them, then choose “Make a quiz”. Until then you can try the example below."
            action={
              <Button asChild variant="outline" size="sm">
                <Link href="/upload">Add material</Link>
              </Button>
            }
          />
        )}

        <ul className="space-y-3">
          {quizzes.map((q) => {
            const topics = [...new Set(q.questions.map((qn) => qn.topic_tag))].slice(0, 3)
            const example = isExample(q.id)
            return (
              <li key={q.id}>
                <Card className="transition-colors hover:border-border-strong">
                  <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-foreground">{q.title}</h3>
                        {example && (
                          <span className="rounded-sm bg-highlight px-1.5 py-0.5 text-xs font-medium text-foreground">
                            Example
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span className="tabular">{q.questions.length} questions</span>
                        <span aria-hidden="true">·</span>
                        <Badge variant={difficultyVariant[q.difficulty]}>{q.difficulty}</Badge>
                        {topics.map((t) => (
                          <Badge key={t} variant="outline">{t}</Badge>
                        ))}
                      </div>
                    </div>
                    <Button className="shrink-0" variant={example ? 'outline' : 'default'} onClick={() => startQuiz(q)}>
                      Start
                      <ArrowRight aria-hidden="true" />
                    </Button>
                  </CardContent>
                </Card>
              </li>
            )
          })}
        </ul>
      </div>
    )
  }

  // ── Taking ─────────────────────────────────────────────────────────────────
  if (view === 'taking' && activeQuiz && question) {
    const selected = answers[question.id]
    const isLast = currentQ === total - 1
    return (
      <div className="mx-auto max-w-2xl space-y-5 px-4 py-6 sm:px-6 lg:py-8">
        {isExample(activeQuiz.id) && (
          <ExampleNotice>This is an example quiz. Your score here won’t be counted in your progress.</ExampleNotice>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="tabular font-medium text-foreground">
              Question {currentQ + 1} of {total}
            </span>
            <Badge variant="outline">{question.topic_tag}</Badge>
          </div>
          <Progress value={((currentQ + 1) / total) * 100} aria-label={`Question ${currentQ + 1} of ${total}`} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle
              ref={headingRef}
              tabIndex={-1}
              className="font-display text-xl font-medium leading-snug focus:outline-none"
            >
              {question.question}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {question.type === 'multiple_choice' || question.type === 'true_false' ? (
              <div role="radiogroup" aria-label="Answer options" className="space-y-2">
                {question.options?.map((opt, i) => {
                  const isSelected = selected === opt
                  return (
                    <button
                      key={opt}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => handleAnswer(question.id, opt)}
                      className={cn(
                        'flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-md border px-4 py-3 text-left text-[15px] transition-colors',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        isSelected
                          ? 'border-primary bg-primary-soft text-foreground'
                          : 'border-border-strong bg-card text-foreground hover:bg-muted'
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          'grid size-6 shrink-0 place-items-center rounded-full border font-mono text-xs',
                          isSelected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border-strong text-muted-foreground'
                        )}
                      >
                        {isSelected ? <Check className="size-3.5" /> : String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor={`answer-${question.id}`}>Your answer</Label>
                <Input
                  id={`answer-${question.id}`}
                  placeholder="Type your answer"
                  value={selected ?? ''}
                  onChange={(e) => handleAnswer(question.id, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && selected?.trim()) handleNext()
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-2">
            <Button variant="ghost" onClick={resetToList}>Quit</Button>
            {currentQ > 0 && (
              <Button variant="outline" onClick={() => setCurrentQ((c) => c - 1)}>
                <ArrowLeft aria-hidden="true" />
                Back
              </Button>
            )}
          </div>
          <Button onClick={handleNext} disabled={!selected?.trim()}>
            {isLast ? 'Finish quiz' : 'Next'}
            <ArrowRight aria-hidden="true" />
          </Button>
        </div>
      </div>
    )
  }

  // ── Results ────────────────────────────────────────────────────────────────
  if (view === 'results' && activeQuiz && graded) {
    const correct = graded.filter((a) => a.isCorrect).length
    const pct = Math.round((correct / graded.length) * 100)
    const weakAreas = [
      ...new Set(activeQuiz.questions.filter((_, i) => !graded[i].isCorrect).map((q) => q.topic_tag)),
    ]
    const verdict =
      pct >= 80 ? 'Strong result' : pct >= 60 ? 'Getting there' : 'Worth another pass'

    return (
      <div className="mx-auto max-w-2xl space-y-5 px-4 py-6 sm:px-6 lg:py-8">
        {isExample(activeQuiz.id) && (
          <ExampleNotice>Example quiz — this score isn’t saved to your progress.</ExampleNotice>
        )}

        <Card>
          <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{activeQuiz.title}</p>
              <h2
                ref={headingRef}
                tabIndex={-1}
                className="font-display text-2xl font-semibold tracking-tight focus:outline-none"
              >
                {verdict}
              </h2>
            </div>
            <div className="text-left sm:text-right">
              <p className="tabular font-display text-4xl font-semibold leading-none text-foreground">{pct}%</p>
              <p className="tabular mt-1 text-sm text-muted-foreground">
                {correct} of {graded.length} correct
              </p>
            </div>
          </CardContent>
        </Card>

        {weakAreas.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Review these topics</CardTitle>
              <CardDescription>You missed at least one question on each.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {weakAreas.map((a) => (
                <Badge key={a} variant="warning">{a}</Badge>
              ))}
            </CardContent>
          </Card>
        )}

        <ol className="space-y-3">
          {activeQuiz.questions.map((q, i) => {
            const a = graded[i]
            return (
              <li
                key={q.id}
                className={cn(
                  'rounded-lg border p-4',
                  a.isCorrect ? 'border-success/30 bg-success-soft' : 'border-danger/30 bg-danger-soft'
                )}
              >
                <div className="flex gap-3">
                  {a.isCorrect ? (
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" aria-hidden="true" />
                  ) : (
                    <XCircle className="mt-0.5 size-5 shrink-0 text-danger" aria-hidden="true" />
                  )}
                  <div className="min-w-0 space-y-1.5">
                    <p className={cn('text-xs font-semibold uppercase tracking-wide', a.isCorrect ? 'text-success' : 'text-danger')}>
                      <span className="tabular">{i + 1}.</span> {a.isCorrect ? 'Correct' : 'Incorrect'}
                    </p>
                    <p className="font-medium text-foreground">{q.question}</p>
                    {!a.isCorrect && (
                      <div className="space-y-0.5 text-sm">
                        <p className="text-foreground">
                          <span className="text-muted-foreground">Your answer: </span>
                          {a.answer || <em className="text-muted-foreground">no answer</em>}
                        </p>
                        <p className="text-foreground">
                          <span className="text-muted-foreground">Correct answer: </span>
                          <span className="font-medium">{q.correct_answer}</span>
                        </p>
                      </div>
                    )}
                    <p className="text-sm leading-relaxed text-muted-foreground">{q.explanation}</p>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={() => startQuiz(activeQuiz)} variant="outline" className="flex-1">
            <RotateCcw aria-hidden="true" />
            Retake quiz
          </Button>
          <Button onClick={resetToList} className="flex-1">
            Back to quizzes
          </Button>
        </div>
      </div>
    )
  }

  return null
}
