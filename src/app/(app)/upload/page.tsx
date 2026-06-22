'use client'

import { useState, useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, X, Sparkles, CreditCard, Trophy, BookOpen, Target, Hash, ClipboardList } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/components/ui/use-toast'
import type { Summary } from '@/types'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [manualText, setManualText] = useState('')
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [analyzing, setAnalyzing] = useState(false)
  const [summary, setSummary] = useState<Summary | null>(null)
  // The actual content sent to AI — reused for flashcard/quiz generation
  const analyzedContent = useRef<string>('')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const f = acceptedFiles[0]
    if (!f) return
    setFile(f)
    setTitle(f.name.replace(/\.[^/.]+$/, ''))
    simulateUploadProgress()
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'text/plain': ['.txt'] },
    maxFiles: 1,
    onDropRejected: () => {
      toast({ title: 'Invalid file type', description: 'Please upload a PDF or TXT file.', variant: 'destructive' })
    },
  })

  function simulateUploadProgress() {
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress((p) => {
        if (p >= 100) { clearInterval(interval); return 100 }
        return p + 20
      })
    }, 200)
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
      // For PDFs, send to server for parsing
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
    let content = manualText.trim()

    if (!content && file) {
      try {
        content = await readFileContent(file)
      } catch {
        toast({ title: 'Could not read file', description: 'Please paste the content manually instead.', variant: 'destructive' })
        return
      }
    }

    if (!content) {
      toast({ title: 'No content', description: 'Please upload a file or enter text.', variant: 'destructive' })
      return
    }

    analyzedContent.current = content

    setAnalyzing(true)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, title, subject }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setSummary({ id: '', material_id: '', user_id: '', created_at: '', ...data })
      toast({ title: 'Analysis complete!', description: 'Your material has been analyzed.' })
    } catch (err) {
      toast({ title: 'Analysis failed', description: String(err), variant: 'destructive' })
    } finally {
      setAnalyzing(false)
    }
  }

  async function handleGenerateFlashcards() {
    const content = analyzedContent.current || manualText.trim()
    if (!content) {
      toast({ title: 'No content', description: 'Analyze your material first.', variant: 'destructive' })
      return
    }
    try {
      const res = await fetch('/api/flashcards/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, count: 10 }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      toast({ title: `${Array.isArray(data) ? data.length : 10} flashcards generated!`, description: 'Check the Flashcards page.' })
    } catch (e) {
      toast({ title: 'Failed to generate flashcards', description: String(e), variant: 'destructive' })
    }
  }

  async function handleGenerateQuiz() {
    const content = analyzedContent.current || manualText.trim()
    if (!content) {
      toast({ title: 'No content', description: 'Analyze your material first.', variant: 'destructive' })
      return
    }
    try {
      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, difficulty: 'medium', count: 10 }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      toast({ title: 'Quiz generated!', description: 'Check the Quizzes page.' })
    } catch (e) {
      toast({ title: 'Failed to generate quiz', description: String(e), variant: 'destructive' })
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Upload area */}
      <Card className="glass border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            Upload Study Material
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-secondary/30'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            {file ? (
              <div className="flex items-center justify-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{file.name}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null); setUploadProgress(0); analyzedContent.current = '' }}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : isDragActive ? (
              <p className="text-primary font-medium">Drop it here!</p>
            ) : (
              <>
                <p className="text-foreground font-medium mb-1">Drag & drop a file here</p>
                <p className="text-muted-foreground text-sm">or click to browse — PDF, TXT supported</p>
              </>
            )}
          </div>

          {file && uploadProgress < 100 && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Reading file...</p>
              <Progress value={uploadProgress} />
            </div>
          )}

          {file?.type === 'application/pdf' && (
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Badge variant="outline" className="text-xs">PDF</Badge>
              PDF content will be extracted automatically when you click Analyze.
            </p>
          )}

          {/* Or manual text */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs text-muted-foreground"><span className="bg-card px-2">or enter text manually</span></div>
          </div>

          <Textarea
            placeholder="Paste your study notes, textbook content, or any material here..."
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            className="min-h-[120px]"
          />

          {/* Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input placeholder="e.g. Biology Chapter 5" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Subject</Label>
              <Input placeholder="e.g. Biology" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
          </div>

          <Button onClick={handleAnalyze} disabled={analyzing} className="w-full gap-2" size="lg">
            {analyzing ? (
              <>
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Analyzing with AI...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Analyze Material
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Analysis results */}
      <AnimatePresence>
        {(analyzing || summary) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="glass border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  AI Analysis Results
                </CardTitle>
                {summary && (
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="gap-2" onClick={handleGenerateFlashcards}>
                      <CreditCard className="w-3.5 h-3.5" />
                      Generate Flashcards
                    </Button>
                    <Button size="sm" variant="outline" className="gap-2" onClick={handleGenerateQuiz}>
                      <Trophy className="w-3.5 h-3.5" />
                      Generate Quiz
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {analyzing ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ) : summary ? (
                  <Tabs defaultValue="summary">
                    <TabsList className="mb-4 flex-wrap h-auto gap-1">
                      <TabsTrigger value="summary" className="gap-1.5"><BookOpen className="w-3.5 h-3.5" />Summary</TabsTrigger>
                      <TabsTrigger value="objectives" className="gap-1.5"><Target className="w-3.5 h-3.5" />Objectives</TabsTrigger>
                      <TabsTrigger value="definitions" className="gap-1.5"><Hash className="w-3.5 h-3.5" />Definitions</TabsTrigger>
                      <TabsTrigger value="facts" className="gap-1.5"><ClipboardList className="w-3.5 h-3.5" />Key Facts</TabsTrigger>
                      <TabsTrigger value="revision">Quick Revision</TabsTrigger>
                    </TabsList>

                    <TabsContent value="summary">
                      <p className="text-sm text-foreground leading-relaxed">{summary.executive_summary}</p>
                    </TabsContent>

                    <TabsContent value="objectives">
                      <ul className="space-y-2">
                        {summary.learning_objectives?.map((obj, i) => (
                          <li key={i} className="flex gap-2 text-sm">
                            <span className="text-primary font-bold shrink-0">{i + 1}.</span>
                            <span className="text-foreground">{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </TabsContent>

                    <TabsContent value="definitions">
                      <div className="space-y-3">
                        {summary.key_definitions?.map((def, i) => (
                          <div key={i} className="p-3 rounded-lg bg-secondary/50 border border-border">
                            <p className="text-sm font-semibold text-primary mb-1">{def.term}</p>
                            <p className="text-sm text-muted-foreground">{def.definition}</p>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="facts">
                      <ul className="space-y-2">
                        {summary.important_facts?.map((fact, i) => (
                          <li key={i} className="flex gap-2 text-sm">
                            <span className="text-yellow-400 shrink-0">•</span>
                            <span className="text-foreground">{fact}</span>
                          </li>
                        ))}
                      </ul>
                    </TabsContent>

                    <TabsContent value="revision">
                      <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{summary.quick_revision}</p>
                      </div>
                    </TabsContent>
                  </Tabs>
                ) : null}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
