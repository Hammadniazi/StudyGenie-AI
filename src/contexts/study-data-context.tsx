'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { Flashcard, Quiz, QuizQuestion } from '@/types'

/*
 * Client-side study store. There is no database yet, so everything lives in
 * React state and is mirrored to localStorage so a refresh doesn't wipe it.
 *
 * Example content (ids starting with "example-") lets a first-time visitor try
 * flashcards and a quiz before uploading anything. It is clearly labelled as an
 * example in the UI and never counted in stats.
 */

// ── Example content ──────────────────────────────────────────────────────────

export const EXAMPLE_PREFIX = 'example-'
export const isExample = (id: string) => id.startsWith(EXAMPLE_PREFIX)

const EXAMPLE_FLASHCARDS: Flashcard[] = [
  { id: 'example-1', user_id: '', question: 'What is the powerhouse of the cell?', answer: 'The mitochondria. It produces ATP through cellular respiration, providing energy for all cellular processes.', difficulty: 'easy', topic_tag: 'Cell Biology', is_saved: false, created_at: '' },
  { id: 'example-2', user_id: '', question: 'Describe the process of DNA replication.', answer: 'DNA replication is semi-conservative: the double helix unwinds, each strand acts as a template, and DNA polymerase builds a new complementary strand from free nucleotides.', difficulty: 'hard', topic_tag: 'Genetics', is_saved: false, created_at: '' },
  { id: 'example-3', user_id: '', question: 'What is the difference between mitosis and meiosis?', answer: 'Mitosis produces 2 identical diploid cells for growth and repair. Meiosis produces 4 genetically unique haploid cells for sexual reproduction.', difficulty: 'medium', topic_tag: 'Cell Division', is_saved: false, created_at: '' },
  { id: 'example-4', user_id: '', question: "What is Mendel's Law of Segregation?", answer: 'During gamete formation the two alleles for a trait separate, so each gamete carries only one allele from each pair.', difficulty: 'medium', topic_tag: 'Genetics', is_saved: false, created_at: '' },
  { id: 'example-5', user_id: '', question: 'What is the role of RNA polymerase?', answer: "RNA polymerase transcribes DNA into RNA, reading the template strand 3' to 5' and building RNA 5' to 3'.", difficulty: 'hard', topic_tag: 'Protein Synthesis', is_saved: false, created_at: '' },
  { id: 'example-6', user_id: '', question: 'Define osmosis.', answer: 'The passive movement of water across a semi-permeable membrane from lower to higher solute concentration.', difficulty: 'easy', topic_tag: 'Cell Biology', is_saved: false, created_at: '' },
]

const EXAMPLE_QUIZ: Quiz = {
  id: 'example-quiz',
  user_id: '',
  title: 'Biology basics (example)',
  difficulty: 'medium',
  created_at: '',
  questions: [
    { id: 'q1', question: 'Which organelle produces most of the ATP in eukaryotic cells?', type: 'multiple_choice', options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi apparatus'], correct_answer: 'Mitochondria', explanation: 'Mitochondria produce ATP through cellular respiration.', topic_tag: 'Cell Biology' },
    { id: 'q2', question: 'DNA replication is a semi-conservative process.', type: 'true_false', options: ['True', 'False'], correct_answer: 'True', explanation: 'Each new double helix keeps one original strand and gains one new strand.', topic_tag: 'Genetics' },
    { id: 'q3', question: 'Which protein carries oxygen in red blood cells?', type: 'multiple_choice', options: ['Insulin', 'Hemoglobin', 'Albumin', 'Keratin'], correct_answer: 'Hemoglobin', explanation: 'Hemoglobin is the iron-containing protein that binds and transports oxygen.', topic_tag: 'Biochemistry' },
    { id: 'q4', question: 'How many chromosomes do human somatic cells typically have?', type: 'short_answer', correct_answer: '46', explanation: 'Human somatic cells contain 46 chromosomes in 23 pairs.', topic_tag: 'Genetics' },
    { id: 'q5', question: 'Photosynthesis occurs in the mitochondria.', type: 'true_false', options: ['True', 'False'], correct_answer: 'False', explanation: 'Photosynthesis happens in chloroplasts.', topic_tag: 'Cell Biology' },
  ],
}

// ── Types ────────────────────────────────────────────────────────────────────

type RawFlashcard = Pick<Flashcard, 'question' | 'answer' | 'difficulty' | 'topic_tag'>
type RawQuestion = Omit<QuizQuestion, 'id'>

export interface StudyMaterialEntry {
  id: string
  title: string
  subject?: string
  createdAt: string
}

export interface QuizAttempt {
  id: string
  quizId: string
  quizTitle: string
  correct: number
  total: number
  /** 0–100 */
  score: number
  /** Per-question outcome, used to compute topic mastery. */
  answers: Array<{ topic: string; isCorrect: boolean }>
  completedAt: string
}

export type ActivityType = 'material' | 'flashcards' | 'quiz' | 'tutor' | 'plan' | 'review'

export interface ActivityEntry {
  id: string
  type: ActivityType
  text: string
  at: string
}

export interface TopicMasteryEntry {
  topic: string
  /** 0–100 */
  mastery: number
  answered: number
}

interface StudyDataContextValue {
  /** False until localStorage has been read — render skeletons until then. */
  ready: boolean
  flashcards: Flashcard[]
  quizzes: Quiz[]
  materials: StudyMaterialEntry[]
  quizAttempts: QuizAttempt[]
  activity: ActivityEntry[]

  addMaterial: (title: string, subject?: string) => void
  addFlashcards: (cards: RawFlashcard[], source?: string) => void
  addQuiz: (title: string, difficulty: Quiz['difficulty'], questions: RawQuestion[]) => void
  recordQuizAttempt: (attempt: Omit<QuizAttempt, 'id' | 'completedAt' | 'score'>) => void
  toggleSaveFlashcard: (id: string) => void
  logActivity: (type: ActivityType, text: string) => void
  clearAll: () => void

  // Derived — from the user's own activity only (never from example content)
  stats: {
    hasOwnData: boolean
    materialsCount: number
    ownFlashcardsCount: number
    quizzesTaken: number
    /** null when no quiz has been taken */
    averageScore: number | null
    /** Consecutive days with any activity, ending today or yesterday */
    streak: number
    topicMastery: TopicMasteryEntry[]
    weakTopics: string[]
    /** Last 7 days, oldest first */
    last7Days: Array<{ date: string; label: string; actions: number }>
  }
}

const StudyDataContext = createContext<StudyDataContextValue | null>(null)

const STORAGE_KEY = 'sg-study-data-v1'

interface Persisted {
  flashcards: Flashcard[]
  quizzes: Quiz[]
  materials: StudyMaterialEntry[]
  quizAttempts: QuizAttempt[]
  activity: ActivityEntry[]
}

const initialState: Persisted = {
  flashcards: EXAMPLE_FLASHCARDS,
  quizzes: [EXAMPLE_QUIZ],
  materials: [],
  quizAttempts: [],
  activity: [],
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

function computeStreak(activity: ActivityEntry[]): number {
  if (activity.length === 0) return 0
  const days = new Set(activity.map((a) => dayKey(new Date(a.at))))
  const cursor = new Date()
  // Allow the streak to still count if the user hasn't studied yet today.
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1)
  let streak = 0
  while (days.has(dayKey(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

function computeMastery(attempts: QuizAttempt[]): TopicMasteryEntry[] {
  const byTopic = new Map<string, { correct: number; total: number }>()
  for (const a of attempts) {
    for (const ans of a.answers) {
      const t = byTopic.get(ans.topic) ?? { correct: 0, total: 0 }
      t.total++
      if (ans.isCorrect) t.correct++
      byTopic.set(ans.topic, t)
    }
  }
  return [...byTopic.entries()]
    .map(([topic, { correct, total }]) => ({
      topic,
      mastery: Math.round((correct / total) * 100),
      answered: total,
    }))
    .sort((a, b) => b.mastery - a.mastery)
}

// ── External store (localStorage-backed) ───────────────────────────────────
// useSyncExternalStore gives us the server snapshot during SSR/hydration and
// the persisted snapshot right after, without a hydration mismatch.

const store = {
  state: initialState,
  loaded: false,
  listeners: new Set<() => void>(),
}

function loadStore() {
  if (store.loaded || typeof window === 'undefined') return
  store.loaded = true
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) store.state = { ...initialState, ...(JSON.parse(raw) as Partial<Persisted>) }
  } catch {
    /* storage unavailable or corrupt — start fresh */
  }
}

function setStore(updater: (s: Persisted) => Persisted) {
  loadStore()
  store.state = updater(store.state)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store.state))
  } catch {
    /* quota or private mode — data simply won't persist */
  }
  store.listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  store.listeners.add(listener)
  // Keep tabs in sync.
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return
    store.loaded = false
    loadStore()
    listener()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    store.listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

const getSnapshot = () => {
  loadStore()
  return store.state
}
const getServerSnapshot = () => initialState
const noopSubscribe = () => () => {}

// ── Provider ─────────────────────────────────────────────────────────────────

export function StudyDataProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const ready = useSyncExternalStore(noopSubscribe, () => true, () => false)

  const pushActivity = (prev: ActivityEntry[], type: ActivityType, text: string): ActivityEntry[] =>
    [{ id: uuidv4(), type, text, at: new Date().toISOString() }, ...prev].slice(0, 200)

  const logActivity = useCallback((type: ActivityType, text: string) => {
    setStore((s) => ({ ...s, activity: pushActivity(s.activity, type, text) }))
  }, [])

  const addMaterial = useCallback((title: string, subject?: string) => {
    setStore((s) => ({
      ...s,
      materials: [{ id: uuidv4(), title, subject, createdAt: new Date().toISOString() }, ...s.materials],
      activity: pushActivity(s.activity, 'material', `Added “${title}”`),
    }))
  }, [])

  const addFlashcards = useCallback((cards: RawFlashcard[], source?: string) => {
    const now = new Date().toISOString()
    const formatted: Flashcard[] = cards.map((c) => ({
      id: uuidv4(),
      user_id: '',
      question: c.question ?? '',
      answer: c.answer ?? '',
      difficulty: c.difficulty ?? 'medium',
      topic_tag: c.topic_tag ?? 'General',
      is_saved: false,
      created_at: now,
    }))
    setStore((s) => ({
      ...s,
      flashcards: [...formatted, ...s.flashcards],
      activity: pushActivity(
        s.activity,
        'flashcards',
        `Made ${formatted.length} flashcards${source ? ` from “${source}”` : ''}`
      ),
    }))
  }, [])

  const addQuiz = useCallback(
    (title: string, difficulty: Quiz['difficulty'], questions: RawQuestion[]) => {
      const quiz: Quiz = {
        id: uuidv4(),
        user_id: '',
        title,
        difficulty,
        created_at: new Date().toISOString(),
        questions: questions.map((q) => ({ ...q, id: uuidv4() })),
      }
      setStore((s) => ({
        ...s,
        quizzes: [quiz, ...s.quizzes],
        activity: pushActivity(s.activity, 'quiz', `Created quiz “${title}”`),
      }))
    },
    []
  )

  const recordQuizAttempt = useCallback(
    (attempt: Omit<QuizAttempt, 'id' | 'completedAt' | 'score'>) => {
      // Example quiz attempts are shown to the user but never feed their stats.
      if (isExample(attempt.quizId)) return
      const score = attempt.total ? Math.round((attempt.correct / attempt.total) * 100) : 0
      setStore((s) => ({
        ...s,
        quizAttempts: [
          { ...attempt, id: uuidv4(), score, completedAt: new Date().toISOString() },
          ...s.quizAttempts,
        ],
        activity: pushActivity(
          s.activity,
          'quiz',
          `Scored ${attempt.correct}/${attempt.total} on “${attempt.quizTitle}”`
        ),
      }))
    },
    []
  )

  const toggleSaveFlashcard = useCallback((id: string) => {
    setStore((s) => ({
      ...s,
      flashcards: s.flashcards.map((c) => (c.id === id ? { ...c, is_saved: !c.is_saved } : c)),
    }))
  }, [])

  const clearAll = useCallback(() => {
    setStore(() => initialState)
  }, [])

  const stats = useMemo(() => {
    const ownCards = state.flashcards.filter((c) => !isExample(c.id))
    const attempts = state.quizAttempts
    const topicMastery = computeMastery(attempts)
    const avg = attempts.length
      ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length)
      : null

    const counts = new Map<string, number>()
    for (const a of state.activity) {
      const k = dayKey(new Date(a.at))
      counts.set(k, (counts.get(k) ?? 0) + 1)
    }
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      const key = dayKey(d)
      return {
        date: key,
        label: d.toLocaleDateString(undefined, { weekday: 'short' }),
        actions: counts.get(key) ?? 0,
      }
    })

    return {
      hasOwnData:
        state.materials.length > 0 || ownCards.length > 0 || attempts.length > 0 || state.activity.length > 0,
      materialsCount: state.materials.length,
      ownFlashcardsCount: ownCards.length,
      quizzesTaken: attempts.length,
      averageScore: avg,
      streak: computeStreak(state.activity),
      topicMastery,
      weakTopics: topicMastery.filter((t) => t.mastery < 60).map((t) => t.topic),
      last7Days,
    }
  }, [state])

  const value: StudyDataContextValue = {
    ready,
    ...state,
    addMaterial,
    addFlashcards,
    addQuiz,
    recordQuizAttempt,
    toggleSaveFlashcard,
    logActivity,
    clearAll,
    stats,
  }

  return <StudyDataContext.Provider value={value}>{children}</StudyDataContext.Provider>
}

export function useStudyData() {
  const ctx = useContext(StudyDataContext)
  if (!ctx) throw new Error('useStudyData must be used within StudyDataProvider')
  return ctx
}
