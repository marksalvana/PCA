'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ReactionType } from '@/types/database'

export async function submitForumPost(formData: FormData) {
  const authorName = (formData.get('author_name') as string | null)?.trim()
  const content = (formData.get('content') as string | null)?.trim()
  const category = (formData.get('category') as string | null) ?? 'general'

  if (!authorName || authorName.length < 2) {
    return { error: 'Please enter your name (at least 2 characters).' }
  }
  if (!content || content.length < 10) {
    return { error: 'Please write a message (at least 10 characters).' }
  }

  const validCategories = ['suggestion', 'feedback', 'question', 'bug_report', 'general']
  if (!validCategories.includes(category)) {
    return { error: 'Invalid category.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // forum_posts is added via migration; cast required until Supabase reflects the new table
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('forum_posts').insert({
    author_name: authorName,
    content,
    category,
    user_id: user?.id ?? null,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/forum')
  return { success: true }
}

/**
 * Toggle a like/dislike reaction on a forum post.
 *
 * State transitions:
 *   - no existing reaction + click like     → INSERT like
 *   - no existing reaction + click dislike  → INSERT dislike
 *   - existing like + click like            → DELETE (toggle off)
 *   - existing like + click dislike         → UPDATE to dislike (switch)
 *   - existing dislike + click dislike      → DELETE (toggle off)
 *   - existing dislike + click like         → UPDATE to like (switch)
 *
 * Authentication required. Anonymous users get a clear error so the UI
 * can prompt them to sign in.
 */
export async function toggleReaction(postId: string, reaction: ReactionType) {
  if (reaction !== 'like' && reaction !== 'dislike') {
    return { error: 'Invalid reaction.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Sign in to react to posts.' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data: existing } = await db
    .from('forum_reactions')
    .select('id, reaction')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    if (existing.reaction === reaction) {
      // Same reaction clicked again — toggle off
      const { error } = await db.from('forum_reactions').delete().eq('id', existing.id)
      if (error) return { error: error.message }
    } else {
      // Different reaction — switch
      const { error } = await db.from('forum_reactions').update({ reaction }).eq('id', existing.id)
      if (error) return { error: error.message }
    }
  } else {
    // No existing reaction — insert
    const { error } = await db.from('forum_reactions').insert({
      post_id: postId,
      user_id: user.id,
      reaction,
    })
    if (error) return { error: error.message }
  }

  revalidatePath('/forum')
  return { success: true }
}
