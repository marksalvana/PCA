import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — must call getUser() to keep session alive
  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Protect admin routes — must be signed in
  if (path.startsWith('/admin') ||
      path.startsWith('/dashboard') ||
      path.startsWith('/vetting')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  // Phone-verification gate. When the viewer is signed in but hasn't
  // completed Phone OTP, hold them on /verify-phone (and the bare
  // minimum routes needed to get there or sign out). Public pages
  // remain readable so visitors who aren't signed in aren't affected.
  if (user) {
    const ALLOW_UNVERIFIED = [
      '/verify-phone',
      '/auth/callback',
      '/login',
      '/signup',
      '/logout',
    ]
    const isAllowed = ALLOW_UNVERIFIED.some((p) => path === p || path.startsWith(`${p}/`))
    const isApiRoute = path.startsWith('/api/')
    const isAssetRoute = path.startsWith('/_next/') || path.startsWith('/auth/')

    if (!isAllowed && !isApiRoute && !isAssetRoute) {
      // Cheap check: only fetch the profile when the path isn't
      // already an auth/asset route. Avoids a SELECT on every static
      // asset request.
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('phone_verified')
        .eq('id', user.id)
        .maybeSingle<{ phone_verified: boolean }>()

      if (profile && !profile.phone_verified) {
        const url = request.nextUrl.clone()
        url.pathname = '/verify-phone'
        url.search = ''
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
