'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Heart, HeartOff, Sparkles, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import { useStudyData } from '@/contexts/study-data-context'
import type { Flashcard } from '@/types'

const difficultyColors: Record<string, string> = {
  easy: 'success',
  medium: 'secondary',
  hard: 'destructive',
}

function FlipCard({ card, onToggleSave }: { card: Flashcard; onToggleSave: (id: string) => void }) {
  const [flipped, setFlipped] = useState(false)

  function handleFlip() {
    setFlipped((f) => !f)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={flipped}
      aria-label={flipped ? `Answer: ${card.answer}` : `Question: ${card.question} — press to reveal answer`}
      className="cursor-pointer"
      style={{ perspective: '1000px' }}
      onClick={handleFlip}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), handleFlip())}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d', position: 'relative', minHeight: '180px' }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 glass rounded-xl border border-border p-5 flex flex-col justify-between"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="flex items-start justify-between gap-2">
            <Badge variant={difficultyColors[card.difficulty] as 'success' | 'secondary' | 'destructive'}>
              {card.difficulty}
            </Badge>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleSave(card.id) }}
              aria-label={card.is_saved ? 'Unsave card' : 'Save card'}
              className="text-muted-foreground hover:text-red-400 transition-colors"
            >
              {card.is_saved ? <Heart className="w-4 h-4 fill-red-400 text-red-400" /> : <HeartOff className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center py-4">
            <p className="text-center text-foreground font-medium text-sm leading-relaxed">{card.question}</p>
          </div>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">{card.topic_tag}</Badge>
            <span className="text-xs text-muted-foreground">Tap to reveal</span>
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 glass rounded-xl border border-primary/30 bg-primary/5 p-5 flex flex-col justify-center"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <p className="text-xs text-primary font-semibold mb-2 uppercase tracking-wider">Answer</p>
          <p className="text-foreground text-sm leading-relaxed">{card.answer}</p>
        </div>
      </motion.div>
    </div>
  )
}

export default function FlashcardsPage() {
  const { flashcards, addFlashcards, toggleSaveFlashcard } = useStudyData()
  const [search, setSearch] = useState('')
  const [filterDifficulty, setFilterDifficulty] = useState('all')
  const [generating, setGenerating] = useState(false)

  const filtered = flashcards.filter((c) => {
    const matchSearch = c.question.toLowerCase().includes(search.toLowerCase()) || c.topic_tag.toLowerCase().includes(search.toLowerCase())
    const matchDifficulty = filterDifficulty === 'all' || c.difficulty === filterDifficulty
    return matchSearch && matchDifficulty
  })

  async function handleGenerate() {
    setGenerating(true)
    try {
      const res = await fetch('/api/flashcards/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'Generate diverse flashcards covering science, history, mathematics, and general knowledge.', count: 5 }),
      })
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        addFlashcards(data)
        toast({ title: `${data.length} new flashcards added!` })
      }
    } catch {
      toast({ title: 'Failed to generate flashcards', variant: 'destructive' })
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search flashcards..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All difficulties</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleGenerate} disabled={generating} className="gap-2">
          {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Generate More
        </Button>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-sm text-muted-foreground">
        <span>{flashcards.length} total</span>
        <span>•</span>
        <span>{filtered.length} shown</span>
        <span>•</span>
        <span>{flashcards.filter((c) => c.is_saved).length} saved</span>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg font-semibold mb-2">No flashcards match your search</p>
          <p className="text-muted-foreground mb-4">Try a different filter or generate new ones from your study material.</p>
          <Button onClick={handleGenerate} disabled={generating} className="gap-2">
            <Sparkles className="w-4 h-4" />
            Generate Flashcards
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((card) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <FlipCard card={card} onToggleSave={toggleSaveFlashcard} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
