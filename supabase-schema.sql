-- StudyGenie AI — Supabase Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Users (extends Supabase auth.users) ──
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Study Materials ──
CREATE TABLE IF NOT EXISTS public.study_materials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  file_url TEXT,
  file_type TEXT CHECK (file_type IN ('pdf', 'text', 'manual')) DEFAULT 'manual',
  subject TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX ON public.study_materials(user_id);

-- ── AI Summaries ──
CREATE TABLE IF NOT EXISTS public.summaries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  material_id UUID REFERENCES public.study_materials(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  executive_summary TEXT NOT NULL,
  learning_objectives JSONB DEFAULT '[]',
  key_definitions JSONB DEFAULT '[]',
  important_facts JSONB DEFAULT '[]',
  quick_revision TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX ON public.summaries(user_id);
CREATE INDEX ON public.summaries(material_id);

-- ── Flashcards ──
CREATE TABLE IF NOT EXISTS public.flashcards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  material_id UUID REFERENCES public.study_materials(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  topic_tag TEXT DEFAULT 'General',
  is_saved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX ON public.flashcards(user_id);
CREATE INDEX ON public.flashcards(material_id);

-- ── Quizzes ──
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  material_id UUID REFERENCES public.study_materials(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  questions JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX ON public.quizzes(user_id);

-- ── Quiz Results ──
CREATE TABLE IF NOT EXISTS public.quiz_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  answers JSONB DEFAULT '[]',
  weak_areas JSONB DEFAULT '[]',
  completed_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX ON public.quiz_results(user_id);
CREATE INDEX ON public.quiz_results(quiz_id);

-- ── Study Plans ──
CREATE TABLE IF NOT EXISTS public.study_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  exam_date DATE NOT NULL,
  daily_hours NUMERIC(3,1) NOT NULL,
  daily_plan JSONB DEFAULT '[]',
  weekly_plan JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX ON public.study_plans(user_id);

-- ── Topic Mastery ──
CREATE TABLE IF NOT EXISTS public.topic_mastery (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  topic TEXT NOT NULL,
  mastery_percentage INTEGER DEFAULT 0 CHECK (mastery_percentage BETWEEN 0 AND 100),
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, topic)
);
CREATE INDEX ON public.topic_mastery(user_id);

-- ── User Analytics ──
CREATE TABLE IF NOT EXISTS public.user_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  study_streak INTEGER DEFAULT 0,
  total_study_sessions INTEGER DEFAULT 0,
  total_topics_learned INTEGER DEFAULT 0,
  exam_readiness_score INTEGER DEFAULT 0,
  xp_points INTEGER DEFAULT 0,
  badges JSONB DEFAULT '[]',
  last_study_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Tutor Sessions ──
CREATE TABLE IF NOT EXISTS public.tutor_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  material_id UUID REFERENCES public.study_materials(id) ON DELETE SET NULL,
  messages JSONB DEFAULT '[]',
  topic TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX ON public.tutor_sessions(user_id);

-- ── Row Level Security ──
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: users can only see/modify their own data
CREATE POLICY "users_own_profiles" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "users_own_materials" ON public.study_materials FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_summaries" ON public.summaries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_flashcards" ON public.flashcards FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_quizzes" ON public.quizzes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_quiz_results" ON public.quiz_results FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_study_plans" ON public.study_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_topic_mastery" ON public.topic_mastery FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_analytics" ON public.user_analytics FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_tutor_sessions" ON public.tutor_sessions FOR ALL USING (auth.uid() = user_id);

-- ── Auto-create profile on signup ──
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');

  INSERT INTO public.user_analytics (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
