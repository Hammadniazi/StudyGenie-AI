'use client'

import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, Heart, FileUp, Layers, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge, difficultyVariant } from '@/components/ui/badge'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { EmptyState, ExampleNotice } from '@/components/empty-state'
import { useStudyData, isExample } from '@/contexts/study-data-context'
import { cn } from '@/lib/utils'
import type { Flashcard } from '@/types'

function FlipCard({
  card,
  onToggleSave,
  onFirstFlip,
}: {
  card: Flashcard
  onToggleSave: (id: string) => void
  onFirstFlip: () => void
}) {
  const [flipped, setFlipped] = useState(false)

  function handleFlip() {
    if (!flipped) onFirstFlip()
    setFlipped((f) => !f)
  }

  return (
    <div className="relative" style={{ perspective: '1200px' }}>
      {/* The whole card is one real button; the save control is a sibling, not nested inside it. */}
      <button
        type="button"
        onClick={handleFlip}
        aria-pressed={flipped}
        className="group block w-full cursor-pointer rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <span className="sr-only">{flipped ? 'Showing answer. Press to show question.' : 'Showing question. Press to reveal answer.'}</span>
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
          style={{ transformStyle: 'preserve-3d', position: 'relative', minHeight: '200px' }}
        >
          {/* Front */}
          <div
            aria-hidden={flipped}
            className="absolute inset-0 flex flex-col rounded-lg border border-border bg-card p-5 shadow-sm transition-colors group-hover:border-border-strong"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="flex items-center gap-2 pr-10">
              <Badge variant={difficultyVariant[card.difficulty]}>{card.difficulty}</Badge>
              <span className="truncate text-xs text-muted-foreground">{card.topic_tag}</span>
            </div>
            <p className="flex flex-1 items-center py-4 font-display text-lg font-medium leading-snug text-foreground">
              {card.question}
            </p>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <RotateCw className="size-3" aria-hidden="true" />
              Tap to see the answer
            </p>
          </div>

          {/* Back */}
          <div
            aria-hidden={!flipped}
            className="absolute inset-0 flex flex-col rounded-lg border border-primary/40 bg-primary-soft p-5"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <p className="font-mono text-[11px] font-medium uppercase tracking-wider text-primary">Answer</p>
            <p className="flex flex-1 items-center py-3 text-[15px] leading-relaxed text-foreground">{card.answer}</p>
          </div>
        </motion.div>
      </button>

      <button
        type="button"
        onClick={() => onToggleSave(card.id)}
        aria-pressed={card.is_saved}
        aria-label={card.is_saved ? 'Remove from saved' : 'Save card'}
        className={cn(
          'absolute right-2.5 top-2.5 z-10 grid size-9 cursor-pointer place-items-center rounded-md transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          card.is_saved ? 'text-danger hover:bg-danger-soft' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
      >
        <Heart className={cn('size-4', card.is_saved && 'fill-current')} aria-hidden="true" />
      </button>
    </div>
  )
}

export default function FlashcardsPage() {
  const { flashcards, toggleSaveFlashcard, logActivity } = useStudyData()
  const [search, setSearch] = useState('')
  const [filterDifficulty, setFilterDifficulty] = useState('all')
  const [savedOnly, setSavedOnly] = useState(false)
  const reviewLogged = useRef(false)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return flashcards.filter((c) => {
      const matchSearch =
        !q ||
        c.question.toLowerCase().includes(q) ||
        c.answer.toLowerCase().includes(q) ||
        c.topic_tag.toLowerCase().includes(q)
      const matchDifficulty = filterDifficulty === 'all' || c.difficulty === filterDifficulty
      return matchSearch && matchDifficulty && (!savedOnly || c.is_saved)
    })
  }, [flashcards, search, filterDifficulty, savedOnly])

  const onlyExamples = flashcards.length > 0 && flashcards.every((c) => isExample(c.id))
  const hasFilters = search !== '' || filterDifficulty !== 'all' || savedOnly
  const savedCount = flashcards.filter((c) => c.is_saved).length

  function handleFirstFlip() {
    if (reviewLogged.current) return
    reviewLogged.current = true
    logActivity('review', 'Reviewed flashcards')
  }

  function clearFilters() {
    setSearch('')
    setFilterDifficulty('all')
    setSavedOnly(false)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-6 sm:px-6 lg:py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight">Your flashcards</h2>
          <p className="tabular mt-1 text-sm text-muted-foreground">
            {flashcards.length} cards · {savedCount} saved
          </p>
        </div>
        <Button asChild>
          <Link href="/upload">
            <FileUp aria-hidden="true" />
            Make cards from notes
          </Link>
        </Button>
      </div>

      {onlyExamples && (
        <ExampleNotice>
          These are example cards so you can try flipping them. Add your own notes to make a deck from your material.
        </ExampleNotice>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Label htmlFor="card-search" className="sr-only">Search flashcards</Label>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            id="card-search"
            type="search"
            placeholder="Search questions, answers or topics"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
            <SelectTrigger className="w-full sm:w-40" aria-label="Filter by difficulty">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All difficulties</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={savedOnly ? 'secondary' : 'outline'}
            aria-pressed={savedOnly}
            onClick={() => setSavedOnly((s) => !s)}
            className="shrink-0"
          >
            <Heart className={cn(savedOnly && 'fill-current text-danger')} aria-hidden="true" />
            Saved
          </Button>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? 'card' : 'cards'} shown
      </p>

      {flashcards.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No flashcards yet"
          description="Add your notes, summarise them, then choose “Make flashcards”."
          action={
            <Button asChild size="sm">
              <Link href="/upload">Add material</Link>
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No cards match those filters"
          description={hasFilters ? 'Try a different search term or difficulty.' : undefined}
          action={
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((card) => (
            <li key={card.id}>
              <FlipCard card={card} onToggleSave={toggleSaveFlashcard} onFirstFlip={handleFirstFlip} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
