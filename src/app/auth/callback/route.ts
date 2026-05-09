import { NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Handles the PKCE code exchange after email confirmation / OAuth redirect.
// Supabase redirects here with ?code=… after a user clicks their confirmation email.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Send unverified users through phone OTP before they can use the app.
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('phone_verified')
          .eq('id', user.id)
          .single<{ phone_verified: boolean }>()
        if (profile && !profile.phone_verified) {
          return NextResponse.redirect(`${origin}/verify-phone`)
        }
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // If anything fails, send them to an error page or login
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
