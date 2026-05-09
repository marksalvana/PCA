'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { checkRateLimit, keyForUser, rateLimitError } from '@/lib/anti-abuse/rate-limit'
import type { ReactionType } from '@/types/database'

export async function submitForumPost(formData: FormData) {
  const content = (formData.get('content') as string | null)?.trim()
  const category = (formData.get('category') as string | null) ?? 'general'

  if (!content || content.length < 10) {
    return { error: 'Please write a message (at least 10 characters).' }
  }

  const validCategories = ['suggestion', 'feedback', 'question', 'bug_report', 'general']
  if (!validCategories.includes(category)) {
    return { error: 'Invalid category.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Sign in to post.' }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('display_name, phone_verified')
    .eq('id', user.id)
    .single<{ display_name: string; phone_verified: boolean }>()
  if (!profile?.phone_verified) {
    return { error: 'Verify your phone number to post.' }
  }

  // Rate limit: 5 posts per hour per user.
  const rl = checkRateLimit(keyForUser(user.id, 'forum-post'), { limit: 5, windowSec: 3600 })
  if (!rl.ok) return { error: rateLimitError(rl, 'posts') }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('forum_posts').insert({
    author_name: profile.display_name,
    content,
    category,
    user_id: user.id,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/forum')
  return { success: true }
}

/**
 * Submit a reply (or nested reply) to a forum post.
 *
 * - When parent_reply_id is null/empty, this is a top-level reply at
 *   depth=0.
 * - When parent_reply_id is set, depth = parent.depth + 1. Maximum depth
 *   is 1 (i.e. 2 levels: post → reply → nested-reply). The action rejects
 *   anything beyond that, with a DB CHECK as defense.
 * - Requires phone-verified auth (legacy anonymous posting removed in
 *   migration 019). author_name is auto-filled from the user's
 *   user_profiles.display_name.
 */
export async function submitReply(formData: FormData) {
  const postId = (formData.get('post_id') as string | null)?.trim()
  const parentReplyId = (formData.get('parent_reply_id') as string | null)?.trim() || null
  const content = (formData.get('content') as string | null)?.trim()

  if (!postId) return { error: 'Missing post.' }
  if (!content || content.length < 5) {
    return { error: 'Please write a reply (at least 5 characters).' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Sign in to reply.' }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('display_name, phone_verified')
    .eq('id', user.id)
    .single<{ display_name: string; phone_verified: boolean }>()
  if (!profile?.phone_verified) {
    return { error: 'Verify your phone number to reply.' }
  }

  // Rate limit: 10 replies per hour per user.
  const rl = checkRateLimit(keyForUser(user.id, 'forum-reply'), { limit: 10, windowSec: 3600 })
  if (!rl.ok) return { error: rateLimitError(rl, 'replies') }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  // Compute depth — 0 if top-level, parent.depth + 1 otherwise.
  let depth = 0
  if (parentReplyId) {
    const { data: parent, error: parentErr } = await db
      .from('forum_replies')
      .select('depth, post_id')
      .eq('id', parentReplyId)
      .maybeSingle()
    if (parentErr || !parent) {
      return { error: 'Parent reply not found.' }
    }
    if (parent.post_id !== postId) {
      return { error: 'Parent reply belongs to a different post.' }
    }
    if (parent.depth >= 1) {
      return { error: 'Replies can only nest one level deep.' }
    }
    depth = parent.depth + 1
  }

  const { error } = await db.from('forum_replies').insert({
    post_id: postId,
    parent_reply_id: parentReplyId,
    depth,
    user_id: user.id,
    author_name: profile.display_name,
    content,
  })

  if (error) return { error: error.message }

  revalidatePath('/forum')
  return { success: true }
}

/**
 * Toggle a like/dislike reaction on a forum reply. Same state-transition
 * shape as toggleReaction, just hitting forum_reply_reactions instead of
 * forum_reactions.
 */
export async function toggleReplyReaction(
  replyId: string,
  reaction: ReactionType,
): Promise<{ success: true } | { error: string }> {
  if (reaction !== 'like' && reaction !== 'dislike') {
    return { error: 'Invalid reaction.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Sign in to react to replies.' }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('phone_verified')
    .eq('id', user.id)
    .single<{ phone_verified: boolean }>()
  if (!profile?.phone_verified) {
    return { error: 'Verify your phone number to react.' }
  }

  // Rate limit: 100 reactions per hour per user.
  const rl = checkRateLimit(keyForUser(user.id, 'forum-react'), { limit: 100, windowSec: 3600 })
  if (!rl.ok) return { error: rateLimitError(rl, 'reactions') }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data: existing } = await db
    .from('forum_reply_reactions')
    .select('id, reaction')
    .eq('reply_id', replyId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    if (existing.reaction === reaction) {
      const { error } = await db.from('forum_reply_reactions').delete().eq('id', existing.id)
      if (error) return { error: error.message }
    } else {
      const { error } = await db.from('forum_reply_reactions').update({ reaction }).eq('id', existing.id)
      if (error) return { error: error.message }
    }
  } else {
    const { error } = await db.from('forum_reply_reactions').insert({
      reply_id: replyId,
      user_id: user.id,
      reaction,
    })
    if (error) return { error: error.message }
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
export async function toggleReaction(
  postId: string,
  reaction: ReactionType,
): Promise<{ success: true } | { error: string }> {
  if (reaction !== 'like' && reaction !== 'dislike') {
    return { error: 'Invalid reaction.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Sign in to react to posts.' }
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('phone_verified')
    .eq('id', user.id)
    .single<{ phone_verified: boolean }>()
  if (!profile?.phone_verified) {
    return { error: 'Verify your phone number to react.' }
  }

  // Rate limit: 100 reactions per hour per user.
  const rl = checkRateLimit(keyForUser(user.id, 'forum-react'), { limit: 100, windowSec: 3600 })
  if (!rl.ok) return { error: rateLimitError(rl, 'reactions') }

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
