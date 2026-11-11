'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Notice = { kind: 'error' | 'success' | 'info'; text: string } | null

export default function LoginPage() {
  const router = useRouter()
  const emailRef = useRef<HTMLInputElement>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<Notice>(null)
  const [emailHint, setEmailHint] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setNotice(null)

    if (!isSupabaseConfigured()) {
      setError('Sign-in isn’t set up on this server yet. You can still continue without an account.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  async function handleForgotPassword() {
    setError(null)
    setNotice(null)
    setEmailHint(null)

    if (!email.trim()) {
      setEmailHint('Enter your email above and we’ll send you a reset link.')
      emailRef.current?.focus()
      return
    }

    if (!isSupabaseConfigured()) {
      setNotice({ kind: 'info', text: 'Password reset isn’t available because sign-in isn’t set up on this server.' })
      return
    }

    setResetting(true)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/login`,
    })
    setResetting(false)

    if (error) {
      setError(error.message)
      return
    }
    setNotice({ kind: 'success', text: `If an account exists for ${email.trim()}, a reset link is on its way.` })
  }

  return (
    <Card className="p-6 sm:p-8">
      <div className="mb-7">
        <h1 className="font-display text-[1.75rem] font-semibold tracking-tight text-foreground">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to pick up where you left off.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5" noValidate={false}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            ref={emailRef}
            id="email"
            type="email"
            inputMode="email"
            placeholder="you@university.edu"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (emailHint) setEmailHint(null)
            }}
            required
            autoComplete="email"
            aria-describedby={emailHint ? 'email-hint' : undefined}
          />
          {emailHint && (
            <p id="email-hint" className="text-sm text-warning" role="status">
              {emailHint}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={resetting}
              className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-sm px-1 text-sm text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
            >
              {resetting && <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />}
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="pr-12"
            />
            <button
              type="button"
              aria-label="Show password"
              aria-pressed={showPassword}
              className="absolute right-1 top-1/2 grid size-9 -translate-y-1/2 cursor-pointer place-items-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => setShowPassword((s) => !s)}
            >
              {showPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
            </button>
          </div>
        </div>

        <label className="flex w-fit cursor-pointer items-center gap-2.5 text-sm text-foreground">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="size-4 cursor-pointer accent-[var(--primary)]"
          />
          Keep me signed in
        </label>

        {error && (
          <div role="alert" className="flex gap-2 rounded-md border border-danger/30 bg-danger-soft p-3 text-sm text-danger">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {notice && (
          <div
            role="status"
            className={
              notice.kind === 'success'
                ? 'flex gap-2 rounded-md border border-success/30 bg-success-soft p-3 text-sm text-success'
                : 'flex gap-2 rounded-md border border-border bg-muted p-3 text-sm text-muted-foreground'
            }
          >
            {notice.kind === 'success' ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            ) : (
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            )}
            <span>{notice.text}</span>
          </div>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={loading} aria-busy={loading}>
          {loading && <Loader2 className="animate-spin" aria-hidden="true" />}
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>

      <Button asChild variant="outline" size="lg" className="w-full">
        <Link href="/dashboard">Continue without an account</Link>
      </Button>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New here?{' '}
        <Link href="/register" className="font-medium text-primary underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>
    </Card>
  )
}
