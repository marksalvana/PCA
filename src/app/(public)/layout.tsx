import Nav from '@/components/ui/Nav'
import { LanguageProvider } from '@/components/LanguageProvider'
import FooterContent from '@/components/ui/FooterContent'
import { LensProvider } from '@/components/lens/LensProvider'
import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/types/database'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  // Fetch the auth user + role + unread notification count once at the
  // layout level so Nav can render the right control (Login button vs
  // UserMenu) without a hydration flash.
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userBundle: {
    id: string
    email: string
    displayName: string
    role: UserRole
    unreadCount: number
  } | null = null

  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('display_name, role')
      .eq('id', user.id)
      .maybeSingle<{ display_name: string; role: UserRole }>()

    // Unread notifications — count via head:true to avoid pulling rows
    const { count: unread } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .is('read_at', null)

    userBundle = {
      id: user.id,
      email: user.email ?? '',
      displayName: profile?.display_name ?? user.email?.split('@')[0] ?? 'You',
      role: (profile?.role ?? 'member') as UserRole,
      unreadCount: unread ?? 0,
    }
  }

  return (
    <LanguageProvider>
      <LensProvider>
        <div className="flex flex-col min-h-screen bg-[#FBF5EB]">
          <Nav user={userBundle} />
          <main className="flex-1">{children}</main>
          <FooterContent />
        </div>
      </LensProvider>
    </LanguageProvider>
  )
}
