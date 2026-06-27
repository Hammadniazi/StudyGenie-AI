'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { Flashcard, Quiz, QuizQuestion } from '@/types'

// ── Seed data (single source of truth for mock content) ──────────────────────

const SEED_FLASHCARDS: Flashcard[] = [
  { id: '1', user_id: '', question: 'What is the powerhouse of the cell?', answer: 'The mitochondria. It produces ATP through cellular respiration, providing energy for all cellular processes.', difficulty: 'easy', topic_tag: 'Cell Biology', is_saved: true, created_at: '' },
  { id: '2', user_id: '', question: 'Describe the process of DNA replication.', answer: 'DNA replication is a semi-conservative process where the double helix unwinds, each strand acts as a template, and DNA polymerase synthesizes new complementary strands using free nucleotides.', difficulty: 'hard', topic_tag: 'Genetics', is_saved: false, created_at: '' },
  { id: '3', user_id: '', question: 'What is the difference between mitosis and meiosis?', answer: 'Mitosis produces 2 genetically identical diploid cells for growth/repair. Meiosis produces 4 genetically unique haploid cells for sexual reproduction.', difficulty: 'medium', topic_tag: 'Cell Division', is_saved: true, created_at: '' },
  { id: '4', user_id: '', question: "What is Mendel's Law of Segregation?", answer: "During gamete formation, allele pairs segregate so that each gamete receives only one allele from each pair. This ensures genetic variation in offspring.", difficulty: 'medium', topic_tag: 'Genetics', is_saved: false, created_at: '' },
  { id: '5', user_id: '', question: 'What is the role of RNA polymerase?', answer: "RNA polymerase transcribes DNA into RNA by reading the template strand 3' to 5' and synthesizing RNA in the 5' to 3' direction.", difficulty: 'hard', topic_tag: 'Protein Synthesis', is_saved: false, created_at: '' },
  { id: '6', user_id: '', question: 'Define osmosis.', answer: 'Osmosis is the passive movement of water molecules through a semi-permeable membrane from an area of lower solute concentration to higher solute concentration.', difficulty: 'easy', topic_tag: 'Cell Biology', is_saved: true, created_at: '' },
]

const SEED_QUIZ: Quiz = {
  id: 'seed-1',
  user_id: '',
  title: 'Biology Fundamentals Quiz',
  difficulty: 'medium',
  created_at: '',
  questions: [
    { id: 'q1', question: 'What organelle is responsible for producing ATP in eukaryotic cells?', type: 'multiple_choice', options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi apparatus'], correct_answer: 'Mitochondria', explanation: 'Mitochondria produce ATP through cellular respiration, earning the nickname "powerhouse of the cell".', topic_tag: 'Cell Biology' },
    { id: 'q2', question: 'DNA replication is a semi-conservative process.', type: 'true_false', options: ['True', 'False'], correct_answer: 'True', explanation: 'DNA replication is semi-conservative — each new double helix contains one original strand and one new strand.', topic_tag: 'Genetics' },
    { id: 'q3', question: 'What protein carries oxygen in red blood cells?', type: 'multiple_choice', options: ['Insulin', 'Hemoglobin', 'Albumin', 'Keratin'], correct_answer: 'Hemoglobin', explanation: 'Hemoglobin is the iron-containing protein in red blood cells that binds and transports oxygen.', topic_tag: 'Biochemistry' },
    { id: 'q4', question: 'How many chromosomes do human somatic cells typically have?', type: 'short_answer', correct_answer: '46', explanation: 'Human somatic (non-reproductive) cells contain 46 chromosomes arranged in 23 pairs.', topic_tag: 'Genetics' },
    { id: 'q5', question: 'Photosynthesis occurs in the mitochondria.', type: 'true_false', options: ['True', 'False'], correct_answer: 'False', explanation: 'Photosynthesis occurs in chloroplasts, not mitochondria.', topic_tag: 'Cell Biology' },
  ],
}

// ── Context types ─────────────────────────────────────────────────────────────

type RawFlashcard = Pick<Flashcard, 'question' | 'answer' | 'difficulty' | 'topic_tag'>
type RawQuestion = Omit<QuizQuestion, 'id'>

interface StudyDataContextValue {
  flashcards: Flashcard[]
  quizzes: Quiz[]
  addFlashcards: (cards: RawFlashcard[]) => void
  addQuiz: (title: string, difficulty: Quiz['difficulty'], questions: RawQuestion[]) => void
  toggleSaveFlashcard: (id: string) => void
}

const StudyDataContext = createContext<StudyDataContextValue | null>(null)

// ── Provider ──────────────────────────────────────────────────────────────────

export function StudyDataProvider({ children }: { children: ReactNode }) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>(SEED_FLASHCARDS)
  const [quizzes, setQuizzes] = useState<Quiz[]>([SEED_QUIZ])

  const addFlashcards = useCallback((cards: RawFlashcard[]) => {
    const formatted: Flashcard[] = cards.map((c) => ({
      id: uuidv4(),
      user_id: '',
      question: c.question ?? '',
      answer: c.answer ?? '',
      difficulty: c.difficulty ?? 'medium',
      topic_tag: c.topic_tag ?? 'General',
      is_saved: false,
      created_at: new Date().toISOString(),
    }))
    setFlashcards((prev) => [...formatted, ...prev])
  }, [])

  const addQuiz = useCallback((title: string, difficulty: Quiz['difficulty'], questions: RawQuestion[]) => {
    const quiz: Quiz = {
      id: uuidv4(),
      user_id: '',
      title,
      difficulty,
      created_at: new Date().toISOString(),
      questions: questions.map((q) => ({ ...q, id: uuidv4() })),
    }
    setQuizzes((prev) => [quiz, ...prev])
  }, [])

  const toggleSaveFlashcard = useCallback((id: string) => {
    setFlashcards((prev) => prev.map((c) => (c.id === id ? { ...c, is_saved: !c.is_saved } : c)))
  }, [])

  return (
    <StudyDataContext.Provider value={{ flashcards, quizzes, addFlashcards, addQuiz, toggleSaveFlashcard }}>
      {children}
    </StudyDataContext.Provider>
  )
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useStudyData() {
  const ctx = useContext(StudyDataContext)
  if (!ctx) throw new Error('useStudyData must be used within StudyDataProvider')
  return ctx
}
