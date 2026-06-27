import { Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen gradient-bg flex">
      {/* Left decorative panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-12 overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-purple-600/20 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-blue-600/20 blur-3xl" />

        <div className="relative z-10 text-center">
          <Link href="/" className="inline-flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <span className="text-2xl font-bold text-foreground">StudyGenie AI</span>
          </Link>

          <h2 className="text-4xl font-bold mb-4 gradient-text leading-tight">
            Study Smarter,<br />Not Harder
          </h2>
          <p className="text-muted-foreground text-lg max-w-sm mx-auto leading-relaxed">
            Transform any study material into flashcards, quizzes, summaries, and personalized study plans — instantly.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4 max-w-xs mx-auto">
            {['AI Summaries', 'Smart Quizzes', 'Flashcards', 'Study Plans'].map((item) => (
              <div key={item} className="glass rounded-lg px-3 py-2 text-sm text-center text-muted-foreground border border-border">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: auth form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile brand — links home */}
          <div className="lg:hidden flex items-center gap-2 mb-6 justify-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <span className="font-bold text-lg">StudyGenie AI</span>
            </Link>
          </div>
          {/* Back to home — visible on all screen sizes */}
          <div className="mb-4">
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
              Back to home
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
