'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Heart, HeartOff, Plus, Sparkles, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import type { Flashcard } from '@/types'
import { v4 as uuidv4 } from 'uuid'

const MOCK_FLASHCARDS: Flashcard[] = [
  { id: '1', user_id: '', question: 'What is the powerhouse of the cell?', answer: 'The mitochondria. It produces ATP through cellular respiration, providing energy for all cellular processes.', difficulty: 'easy', topic_tag: 'Cell Biology', is_saved: true, created_at: '' },
  { id: '2', user_id: '', question: 'Describe the process of DNA replication.', answer: 'DNA replication is a semi-conservative process where the double helix unwinds, each strand acts as a template, and DNA polymerase synthesizes new complementary strands using free nucleotides.', difficulty: 'hard', topic_tag: 'Genetics', is_saved: false, created_at: '' },
  { id: '3', user_id: '', question: 'What is the difference between mitosis and meiosis?', answer: 'Mitosis produces 2 genetically identical diploid cells for growth/repair. Meiosis produces 4 genetically unique haploid cells for sexual reproduction.', difficulty: 'medium', topic_tag: 'Cell Division', is_saved: true, created_at: '' },
  { id: '4', user_id: '', question: "What is Mendel's Law of Segregation?", answer: "During gamete formation, allele pairs segregate so that each gamete receives only one allele from each pair. This ensures genetic variation in offspring.", difficulty: 'medium', topic_tag: 'Genetics', is_saved: false, created_at: '' },
  { id: '5', user_id: '', question: 'What is the role of RNA polymerase?', answer: 'RNA polymerase transcribes DNA into RNA by reading the template strand 3\' to 5\' and synthesizing RNA in the 5\' to 3\' direction.', difficulty: 'hard', topic_tag: 'Protein Synthesis', is_saved: false, created_at: '' },
  { id: '6', user_id: '', question: 'Define osmosis.', answer: 'Osmosis is the passive movement of water molecules through a semi-permeable membrane from an area of lower solute concentration to higher solute concentration.', difficulty: 'easy', topic_tag: 'Cell Biology', is_saved: true, created_at: '' },
]

const difficultyColors: Record<string, string> = {
  easy: 'success',
  medium: 'secondary',
  hard: 'destructive',
}

function FlipCard({ card, onToggleSave }: { card: Flashcard; onToggleSave: (id: string) => void }) {
  const [flipped, setFlipped] = useState(false)

  return (
    <div
      className="cursor-pointer"
      style={{ perspective: '1000px' }}
      onClick={() => setFlipped((f) => !f)}
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
  const [cards, setCards] = useState<Flashcard[]>(MOCK_FLASHCARDS)
  const [search, setSearch] = useState('')
  const [filterDifficulty, setFilterDifficulty] = useState('all')
  const [generating, setGenerating] = useState(false)

  const filtered = cards.filter((c) => {
    const matchSearch = c.question.toLowerCase().includes(search.toLowerCase()) || c.topic_tag.toLowerCase().includes(search.toLowerCase())
    const matchDifficulty = filterDifficulty === 'all' || c.difficulty === filterDifficulty
    return matchSearch && matchDifficulty
  })

  function handleToggleSave(id: string) {
    setCards((prev) => prev.map((c) => c.id === id ? { ...c, is_saved: !c.is_saved } : c))
  }

  async function handleGenerate() {
    setGenerating(true)
    try {
      const res = await fetch('/api/flashcards/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'Generate flashcards about cell biology, genetics, and molecular biology.', count: 5 }),
      })
      const newCards = await res.json()
      if (Array.isArray(newCards)) {
        const formatted: Flashcard[] = newCards.map((c: Partial<Flashcard>) => ({
          id: uuidv4(),
          user_id: '',
          question: c.question ?? '',
          answer: c.answer ?? '',
          difficulty: c.difficulty ?? 'medium',
          topic_tag: c.topic_tag ?? 'General',
          is_saved: false,
          created_at: new Date().toISOString(),
        }))
        setCards((prev) => [...formatted, ...prev])
        toast({ title: `${formatted.length} new flashcards generated!` })
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
        <span>{filtered.length} cards</span>
        <span>•</span>
        <span>{cards.filter((c) => c.is_saved).length} saved</span>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <Plus className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No flashcards found</h3>
          <p className="text-muted-foreground mb-4">Generate flashcards from your study material or clear the search filter.</p>
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
                <FlipCard card={card} onToggleSave={handleToggleSave} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
