'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Bot,
  Trophy,
  CreditCard,
  Calendar,
  BarChart3,
  Target,
  Sparkles,
  ArrowRight,
  Zap,
  BookOpen,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const features = [
  {
    icon: Bot,
    title: 'AI Tutor',
    description: 'Chat with an intelligent tutor that adapts to your learning style and guides you step by step.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
  },
  {
    icon: Trophy,
    title: 'Quiz Generator',
    description: 'Auto-generate multiple choice, true/false, and short answer quizzes from any material.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10 border-yellow-500/20',
  },
  {
    icon: CreditCard,
    title: 'Smart Flashcards',
    description: 'AI-created flashcards with spaced repetition to maximize retention and recall.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
  },
  {
    icon: Calendar,
    title: 'Study Planner',
    description: 'Personalized study schedules with smart task distribution based on your exam date.',
    color: 'text-green-400',
    bg: 'bg-green-500/10 border-green-500/20',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'Track study hours, quiz accuracy, streaks, and topic mastery with beautiful charts.',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/20',
  },
  {
    icon: Target,
    title: 'Weak Area Detection',
    description: 'AI identifies your weak spots and focuses your study sessions where you need it most.',
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
  },
]

const stats = [
  { icon: Zap, value: '10x', label: 'Faster Learning', color: 'text-yellow-400' },
  { icon: BookOpen, value: '95%', label: 'Retention Rate', color: 'text-blue-400' },
  { icon: Users, value: 'AI', label: 'Powered Tutor', color: 'text-purple-400' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
}

export default function LandingPage() {
  return (
    <div className="min-h-screen gradient-bg text-foreground">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <span className="font-bold text-lg">StudyGenie AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-6 pt-20 pb-32 max-w-7xl mx-auto text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-[300px] h-[300px] rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="relative z-10"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-primary/20 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Powered by Google Gemini AI
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight mb-6"
          >
            The AI Study Companion{' '}
            <span className="gradient-text">That Actually Works</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Upload your study materials and instantly get AI-powered summaries, flashcards,
            quizzes, personalized study plans, and a 24/7 AI tutor — all in one place.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="gap-2 px-8">
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="gap-2 px-8">
                Explore as Guest
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="px-6 pb-20 max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
          {stats.map(({ icon: Icon, value, label, color }) => (
            <motion.div
              key={label}
              variants={fadeUp}
              className="glass rounded-2xl p-8 text-center border border-border"
            >
              <Icon className={`w-8 h-8 mx-auto mb-3 ${color}`} />
              <div className={`text-5xl font-extrabold mb-2 ${color}`}>{value}</div>
              <div className="text-muted-foreground font-medium">{label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-6 py-20 max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything you need to ace your exams</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Six powerful AI tools working together to make studying smarter, not harder.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, description, color, bg }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="glass rounded-2xl p-6 border border-border hover:border-primary/20 transition-colors cursor-default"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl border ${bg} mb-4`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="max-w-3xl mx-auto text-center glass rounded-3xl p-12 border border-primary/20"
        >
          <Sparkles className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="text-4xl font-bold mb-4">Ready to study smarter?</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Join thousands of students using StudyGenie AI to learn faster and retain more.
          </p>
          <Link href="/register">
            <Button size="lg" className="gap-2 px-10">
              Start for Free <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 text-center text-muted-foreground text-sm">
        <p>© 2025 StudyGenie AI. Built with Next.js and Google Gemini AI.</p>
      </footer>
    </div>
  )
}
