import { AppLayout } from '@/components/layout/app-layout'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AppRootLayout({ children }: { children: React.ReactNode }) {
  let userEmail: string | undefined
  let userName: string | undefined
  let xp = 0

  try {
    const supabase = await createClient()
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        userEmail = user.email ?? undefined
        userName = user.user_metadata?.full_name ?? undefined
      }
    }
  } catch {
    // Supabase not configured — continue as guest
  }

  return (
    <AppLayout userEmail={userEmail} userName={userName} xp={xp}>
      {children}
    </AppLayout>
  )
}
