import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'StudyGenie AI — Your AI Study Companion',
  description:
    'StudyGenie AI uses cutting-edge AI to generate summaries, flashcards, quizzes, study plans, and personalized tutoring from your study materials.',
  keywords: ['AI study', 'flashcards', 'quiz generator', 'study planner', 'AI tutor'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
