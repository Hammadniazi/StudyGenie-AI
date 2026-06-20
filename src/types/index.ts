export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
}

export interface StudyMaterial {
  id: string
  user_id: string
  title: string
  content: string
  file_url?: string
  file_type: 'pdf' | 'text' | 'manual'
  subject?: string
  created_at: string
  updated_at: string
}

export interface Summary {
  id: string
  material_id: string
  user_id: string
  executive_summary: string
  learning_objectives: string[]
  key_definitions: Array<{ term: string; definition: string }>
  important_facts: string[]
  quick_revision: string
  created_at: string
}

export interface Flashcard {
  id: string
  material_id?: string
  user_id: string
  question: string
  answer: string
  difficulty: 'easy' | 'medium' | 'hard'
  topic_tag: string
  is_saved: boolean
  created_at: string
}

export interface Quiz {
  id: string
  material_id?: string
  user_id: string
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
  questions: QuizQuestion[]
  created_at: string
}

export interface QuizQuestion {
  id: string
  question: string
  type: 'multiple_choice' | 'true_false' | 'short_answer'
  options?: string[]
  correct_answer: string
  explanation: string
  topic_tag: string
}

export interface QuizResult {
  id: string
  quiz_id: string
  user_id: string
  score: number
  total_questions: number
  answers: Array<{ question_id: string; answer: string; is_correct: boolean }>
  weak_areas: string[]
  completed_at: string
}

export interface StudyPlan {
  id: string
  user_id: string
  subject: string
  exam_date: string
  daily_hours: number
  daily_plan: PlanDay[]
  weekly_plan: PlanWeek[]
  created_at: string
}

export interface PlanDay {
  date: string
  tasks: PlanTask[]
}

export interface PlanWeek {
  week_number: number
  focus_topics: string[]
  tasks: PlanTask[]
}

export interface PlanTask {
  id: string
  title: string
  type: 'study' | 'revision' | 'quiz' | 'flashcards'
  duration_minutes: number
  topic: string
  completed: boolean
}

export interface TopicMastery {
  id: string
  user_id: string
  topic: string
  mastery_percentage: number
  last_updated: string
}

export interface UserAnalytics {
  id: string
  user_id: string
  study_streak: number
  total_study_sessions: number
  total_topics_learned: number
  exam_readiness_score: number
  xp_points: number
  badges: string[]
  last_study_date: string
  created_at: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface TutorSession {
  id: string
  user_id: string
  material_id?: string
  messages: ChatMessage[]
  topic?: string
  created_at: string
}

export interface WeeklyProgress {
  day: string
  study_hours: number
  quiz_score: number
}

export interface DashboardStats {
  total_study_sessions: number
  study_streak: number
  topics_learned: number
  exam_readiness_score: number
  xp_points: number
  badges: string[]
  topic_mastery: TopicMastery[]
  weak_areas: string[]
  weekly_progress: WeeklyProgress[]
}
