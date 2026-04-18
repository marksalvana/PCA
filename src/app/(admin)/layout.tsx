import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminNav from '@/components/ui/AdminNav'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>()

  const allowedRoles = ['admin', 'vetter', 'superadmin']
  if (!profile || !allowedRoles.includes(profile.role)) {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen bg-[#0a0f1c] text-white">
      <AdminNav role={profile.role as import('@/types/database').UserRole} />
      <main className="flex-1 p-6 md:p-8 overflow-auto">{children}</main>
    </div>
  )
}
