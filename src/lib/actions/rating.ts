'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitRating(politicianId: string, slug: string, rating: number) {
  if (rating < 1 || rating > 5) {
    return { error: 'Rating must be between 1 and 5.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to rate.' }
  }

  // Phone-verified gate — RLS will also reject, but we surface a clearer
  // message at the action layer.
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('phone_verified')
    .eq('id', user.id)
    .single<{ phone_verified: boolean }>()
  if (!profile?.phone_verified) {
    return { error: 'Verify your phone number before rating.' }
  }

  // Supabase SSR client has a known type-threading issue with write operations;
  // the runtime query is correct, the cast is safe here.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { error } = await db
    .from('civic_trust_ratings')
    .upsert(
      { politician_id: politicianId, user_id: user.id, rating },
      { onConflict: 'politician_id,user_id' }
    )

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/profiles/${slug}`)
  return { success: true }
}
