'use client'

import { useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useDropzone } from 'react-dropzone'
import {
  FileUp,
  FileText,
  X,
  Layers,
  ListChecks,
  BookOpen,
  Target,
  Hash,
  ClipboardList,
  Loader2,
  ArrowRight,
  NotebookPen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/components/ui/use-toast'
import { useStudyData } from '@/contexts/study-data-context'
import { cn } from '@/lib/utils'
import type { Summary } from '@/types'

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function UploadPage() {
  const { addMaterial, addFlashcards, addQuiz } = useStudyData()
  const [file, setFile] = useState<File | null>(null)
  const [manualText, setManualText] = useState('')
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [generatingCards, setGeneratingCards] = useState(false)
  const [generatingQuiz, setGeneratingQuiz] = useState(false)
  const [cardsReady, setCardsReady] = useState<number | null>(null)
  const [quizReady, setQuizReady] = useState(false)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [summaryTitle, setSummaryTitle] = useState('')
  // The exact content that was analysed — reused for flashcard/quiz generation
  const analyzedContent = useRef<string>('')
  const analyzedTitle = useRef<string>('')
  const busy = useRef({ analyze: false, cards: false, quiz: false })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const f = acceptedFiles[0]
    if (!f) return
    setFile(f)
    setTitle((t) => t || f.name.replace(/\.[^/.]+$/, ''))
  }, [])

  const { getRootProps, getInputProps, isDragActive, isFocused } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'text/plain': ['.txt'] },
    maxFiles: 1,
    onDropRejected: () => {
      toast({
        title: 'That file type isn’t supported',
        description: 'Upload a PDF or .txt file, or paste the text into the box below.',
        variant: 'destructive',
      })
    },
  })

  function removeFile() {
    setFile(null)
    analyzedContent.current = ''
  }

  async function readFileContent(f: File): Promise<string> {
    if (f.type === 'text/plain') {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.onerror = reject
        reader.readAsText(f)
      })
    }
    if (f.type === 'application/pdf') {
      const formData = new FormData()
      formData.append('file', f)
      const res = await fetch('/api/parse-pdf', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('PDF parsing failed')
      const { text } = await res.json()
      return text
    }
    throw new Error('Unsupported file type')
  }

  async function handleAnalyze() {
    if (busy.current.analyze) return
    let content = manualText.trim()

    busy.current.analyze = true
    setAnalyzing(true)
    try {
      if (!content && file) {
        try {
          content = await readFileContent(file)
        } catch {
          toast({
            title: 'Couldn’t read that file',
            description: 'If it’s a scanned PDF, copy the text out and paste it into the box instead.',
            variant: 'destructive',
          })
          return
        }
      }

      if (!content) {
        toast({
          title: 'Nothing to summarise yet',
          description: 'Upload a file or paste your notes first.',
          variant: 'destructive',
        })
        return
      }

      const materialTitle = title.trim() || 'Untitled notes'
      analyzedContent.current = content
      analyzedTitle.current = materialTitle

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, title: materialTitle, subject }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setSummary({ id: '', material_id: '', user_id: '', created_at: '', ...data })
      setSummaryTitle(materialTitle)
      setCardsReady(null)
      setQuizReady(false)
      addMaterial(materialTitle, subject.trim() || undefined)
      toast({ title: 'Summary ready', description: `“${materialTitle}” has been summarised.` })
    } catch {
      toast({
        title: 'Couldn’t summarise your notes',
        description: 'Check your connection and try again. Very long documents may need to be split up.',
        variant: 'destructive',
      })
    } finally {
      busy.current.analyze = false
      setAnalyzing(false)
    }
  }

  async function handleGenerateFlashcards() {
    if (busy.current.cards) return
    const content = analyzedContent.current
    if (!content) {
      toast({ title: 'Summarise your notes first', description: 'Flashcards are made from the material above.', variant: 'destructive' })
      return
    }
    busy.current.cards = true
    setGeneratingCards(true)
    try {
      const res = await fetch('/api/flashcards/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, count: 10 }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      if (!Array.isArray(data) || data.length === 0) throw new Error('empty')
      addFlashcards(data, analyzedTitle.current)
      setCardsReady(data.length)
      toast({ title: `${data.length} flashcards added`, description: 'They’re waiting in Flashcards.' })
    } catch {
      toast({
        title: 'Couldn’t make flashcards',
        description: 'Try again in a moment. If it keeps failing, shorten the material.',
        variant: 'destructive',
      })
    } finally {
      busy.current.cards = false
      setGeneratingCards(false)
    }
  }

  async function handleGenerateQuiz() {
    if (busy.current.quiz) return
    const content = analyzedContent.current
    if (!content) {
      toast({ title: 'Summarise your notes first', description: 'The quiz is built from the material above.', variant: 'destructive' })
      return
    }
    busy.current.quiz = true
    setGeneratingQuiz(true)
    try {
      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, difficulty: 'medium', count: 10 }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      if (!Array.isArray(data) || data.length === 0) throw new Error('empty')
      addQuiz(`${analyzedTitle.current} — practice quiz`, 'medium', data)
      setQuizReady(true)
      toast({ title: 'Quiz ready', description: `${data.length} questions are waiting in Quizzes.` })
    } catch {
      toast({
        title: 'Couldn’t make a quiz',
        description: 'Try again in a moment. If it keeps failing, shorten the material.',
        variant: 'destructive',
      })
    } finally {
      busy.current.quiz = false
      setGeneratingQuiz(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6 lg:py-8">
      <Card>
        <CardHeader>
          <CardTitle>Add study material</CardTitle>
          <CardDescription>
            Upload a PDF or text file, or paste your notes. You’ll get a summary, then can turn it into flashcards or a quiz.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Dropzone */}
          <div
            {...getRootProps({
              'aria-label': 'Upload a PDF or text file. Press Enter to browse.',
            })}
            className={cn(
              'cursor-pointer rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card',
              isDragActive
                ? 'border-primary bg-primary-soft'
                : 'border-border-strong hover:border-primary/60 hover:bg-muted/50',
              isFocused && !isDragActive && 'border-primary/60'
            )}
          >
            <input {...getInputProps()} />
            <FileUp className="mx-auto mb-3 size-8 text-muted-foreground" aria-hidden="true" />
            {isDragActive ? (
              <p className="font-medium text-primary">Drop the file to add it</p>
            ) : (
              <>
                <p className="font-medium text-foreground">Drag a file here, or click to browse</p>
                <p className="mt-1 text-sm text-muted-foreground">PDF or .txt</p>
              </>
            )}
          </div>

          {file && (
            <div className="flex items-center gap-3 rounded-md border border-border bg-muted/50 py-1.5 pl-3 pr-1.5">
              <FileText className="size-4 shrink-0 text-primary" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  <span className="tabular">{formatSize(file.size)}</span>
                  {file.type === 'application/pdf' && ' · text is extracted when you summarise'}
                </p>
              </div>
              {file.type === 'application/pdf' && <Badge variant="outline">PDF</Badge>}
              <Button
                variant="ghost"
                size="icon"
                className="size-9 text-muted-foreground hover:text-danger"
                onClick={removeFile}
                aria-label={`Remove ${file.name}`}
              >
                <X aria-hidden="true" />
              </Button>
            </div>
          )}

          <div className="relative" aria-hidden="true">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs text-muted-foreground">
              <span className="bg-card px-2">or paste your notes</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes" className="sr-only">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Paste lecture notes, a textbook section, or anything you need to learn…"
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              className="min-h-[140px]"
            />
            {manualText && file && (
              <p className="text-xs text-muted-foreground">Pasted text is used instead of the uploaded file.</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="e.g. Biology chapter 5" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="subject">
                Subject <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Input id="subject" placeholder="e.g. Biology" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
          </div>

          <Button onClick={handleAnalyze} disabled={analyzing} aria-busy={analyzing} className="w-full" size="lg">
            {analyzing ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" />
                Reading and summarising…
              </>
            ) : (
              <>
                <NotebookPen aria-hidden="true" />
                Summarise
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {(analyzing || summary) && (
        <Card aria-live="polite" aria-busy={analyzing}>
          <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>{summary ? summaryTitle : 'Summarising…'}</CardTitle>
              <CardDescription>
                {summary ? 'Summary, objectives, definitions and key facts' : 'This usually takes 10–20 seconds.'}
              </CardDescription>
            </div>
            {summary && (
              <div className="flex flex-wrap gap-2">
                {cardsReady !== null ? (
                  <Button asChild size="sm" variant="outline">
                    <Link href="/flashcards">
                      <Layers aria-hidden="true" />
                      Open flashcards <span className="tabular">({cardsReady})</span>
                      <ArrowRight aria-hidden="true" />
                    </Link>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleGenerateFlashcards}
                    disabled={generatingCards}
                    aria-busy={generatingCards}
                  >
                    {generatingCards ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Layers aria-hidden="true" />}
                    {generatingCards ? 'Making flashcards…' : 'Make flashcards'}
                  </Button>
                )}
                {quizReady ? (
                  <Button asChild size="sm" variant="outline">
                    <Link href="/quizzes">
                      <ListChecks aria-hidden="true" />
                      Open quiz
                      <ArrowRight aria-hidden="true" />
                    </Link>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleGenerateQuiz}
                    disabled={generatingQuiz}
                    aria-busy={generatingQuiz}
                  >
                    {generatingQuiz ? <Loader2 className="animate-spin" aria-hidden="true" /> : <ListChecks aria-hidden="true" />}
                    {generatingQuiz ? 'Writing quiz…' : 'Make a quiz'}
                  </Button>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent>
            {analyzing ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : summary ? (
              <Tabs defaultValue="summary">
                <TabsList className="mb-4 h-auto flex-wrap justify-start gap-1">
                  <TabsTrigger value="summary" className="gap-1.5"><BookOpen className="size-3.5" aria-hidden="true" />Summary</TabsTrigger>
                  <TabsTrigger value="objectives" className="gap-1.5"><Target className="size-3.5" aria-hidden="true" />Objectives</TabsTrigger>
                  <TabsTrigger value="definitions" className="gap-1.5"><Hash className="size-3.5" aria-hidden="true" />Definitions</TabsTrigger>
                  <TabsTrigger value="facts" className="gap-1.5"><ClipboardList className="size-3.5" aria-hidden="true" />Key facts</TabsTrigger>
                  <TabsTrigger value="revision">Quick revision</TabsTrigger>
                </TabsList>

                <TabsContent value="summary">
                  <p className="max-w-prose text-[15px] leading-relaxed text-foreground">{summary.executive_summary}</p>
                </TabsContent>

                <TabsContent value="objectives">
                  <ol className="max-w-prose space-y-2.5">
                    {summary.learning_objectives?.map((obj, i) => (
                      <li key={i} className="flex gap-3 text-[15px] leading-relaxed">
                        <span className="tabular shrink-0 font-mono text-sm text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>
                        <span className="text-foreground">{obj}</span>
                      </li>
                    ))}
                  </ol>
                </TabsContent>

                <TabsContent value="definitions">
                  <dl className="divide-y divide-border rounded-md border border-border">
                    {summary.key_definitions?.map((def, i) => (
                      <div key={i} className="px-4 py-3">
                        <dt className="mb-1 font-semibold text-foreground">
                          <span className="marker">{def.term}</span>
                        </dt>
                        <dd className="text-sm leading-relaxed text-muted-foreground">{def.definition}</dd>
                      </div>
                    ))}
                  </dl>
                </TabsContent>

                <TabsContent value="facts">
                  <ul className="max-w-prose space-y-2.5">
                    {summary.important_facts?.map((fact, i) => (
                      <li key={i} className="flex gap-3 text-[15px] leading-relaxed">
                        <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                        <span className="text-foreground">{fact}</span>
                      </li>
                    ))}
                  </ul>
                </TabsContent>

                <TabsContent value="revision">
                  <div className="rounded-md border border-border bg-muted/50 p-4">
                    <p className="max-w-prose whitespace-pre-line text-[15px] leading-relaxed text-foreground">{summary.quick_revision}</p>
                  </div>
                </TabsContent>
              </Tabs>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
