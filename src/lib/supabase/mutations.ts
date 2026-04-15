/**
 * Returns a Supabase browser client cast for mutation operations.
 * We bypass the strict generic typing here because our hand-written Database
 * type is a simplified stub — reads (Server Components) use the full typed
 * client, mutations use this helper until we regenerate types via Supabase CLI.
 */
import { createBrowserClient } from '@supabase/ssr'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = ReturnType<typeof createBrowserClient<any>>

export function getMutationClient(): AnySupabase {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
