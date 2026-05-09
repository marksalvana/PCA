import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import PhoneVerifyForm from '@/components/auth/PhoneVerifyForm'

export const metadata = { title: 'Verify your phone — Politiko' }

/**
 * Phone verification gate. Reached after email confirmation when
 * user_profiles.phone_verified is still false. Once verified, future
 * logins skip this page (auth callback redirects straight to /dashboard).
 */
export default async function VerifyPhonePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('phone_verified')
    .eq('id', user.id)
    .single<{ phone_verified: boolean }>()

  if (profile?.phone_verified) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-white">Verify your phone</h1>
          <p className="text-gray-400 text-sm mt-2 leading-relaxed">
            Politiko keeps the platform trustworthy by limiting accounts to
            real, verified people. We&apos;ll send a one-time code to your
            mobile number.
          </p>
        </div>
        <Suspense>
          <PhoneVerifyForm />
        </Suspense>
      </div>
    </div>
  )
}
