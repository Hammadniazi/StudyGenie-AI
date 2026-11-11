'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type FieldErrors = { password?: string; confirmPassword?: string }

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [success, setSuccess] = useState(false)

  function validate(): FieldErrors {
    const errs: FieldErrors = {}
    if (password.length < 8) errs.password = 'Use at least 8 characters.'
    if (confirmPassword && password !== confirmPassword) errs.confirmPassword = 'This doesn’t match the password above.'
    if (!confirmPassword) errs.confirmPassword = 'Type your password again to confirm it.'
    return errs
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const errs = validate()
    setFieldErrors(errs)
    if (errs.password) {
      document.getElementById('password')?.focus()
      return
    }
    if (errs.confirmPassword) {
      document.getElementById('confirmPassword')?.focus()
      return
    }

    if (!isSupabaseConfigured()) {
      setError('Account sign-up isn’t set up on this server yet. You can still continue without an account.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setTimeout(() => router.push('/dashboard'), 1500)
  }

  return (
    <Card className="p-6 sm:p-8">
      <div className="mb-7">
        <h1 className="font-display text-[1.75rem] font-semibold tracking-tight text-foreground">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Keep your flashcards, quizzes and plan across devices.</p>
      </div>

      {success ? (
        <div role="status" className="flex gap-3 rounded-md border border-success/30 bg-success-soft p-4 text-success">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-medium">Account created</p>
            <p className="mt-0.5 text-sm">Taking you to your overview…</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleRegister} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="fullName">Name</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              inputMode="email"
              placeholder="you@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (fieldErrors.password) setFieldErrors((f) => ({ ...f, password: undefined }))
                }}
                onBlur={() => password && setFieldErrors((f) => ({ ...f, password: validate().password }))}
                required
                autoComplete="new-password"
                className="pr-12"
                aria-invalid={!!fieldErrors.password}
                aria-describedby="password-hint"
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
            <p id="password-hint" className={fieldErrors.password ? 'text-sm text-danger' : 'text-sm text-muted-foreground'}>
              {fieldErrors.password ?? 'At least 8 characters'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                if (fieldErrors.confirmPassword) setFieldErrors((f) => ({ ...f, confirmPassword: undefined }))
              }}
              onBlur={() =>
                confirmPassword && setFieldErrors((f) => ({ ...f, confirmPassword: validate().confirmPassword }))
              }
              required
              autoComplete="new-password"
              aria-invalid={!!fieldErrors.confirmPassword}
              aria-describedby={fieldErrors.confirmPassword ? 'confirm-error' : undefined}
            />
            {fieldErrors.confirmPassword && (
              <p id="confirm-error" className="text-sm text-danger">
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          {error && (
            <div role="alert" className="flex gap-2 rounded-md border border-danger/30 bg-danger-soft p-3 text-sm text-danger">
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={loading} aria-busy={loading}>
            {loading && <Loader2 className="animate-spin" aria-hidden="true" />}
            {loading ? 'Creating account…' : 'Create account'}
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </Card>
  )
}
