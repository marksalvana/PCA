'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { NotificationType } from '@/types/database'

type ActionResult = { success: true } | { error: string }

/**
 * Insert a notification for a target user. Called from other server
 * actions (not directly from the client) — typically when something
 * about that user's submission, application, or record changes.
 *
 * Failures here are non-fatal: the parent action shouldn't roll back
 * its work just because the notification couldn't be queued. Returns
 * an error result for diagnostics; callers usually ignore it.
 */
export async function notifyUser(input: {
  userId: string
  type: NotificationType
  title: string
  body?: string | null
  linkUrl?: string | null
}): Promise<ActionResult> {
  if (!input.userId) return { error: 'Missing userId.' }
  if (!input.title.trim()) return { error: 'Missing notification title.' }

  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { error } = await db.from('notifications').insert({
    user_id: input.userId,
    type: input.type,
    title: input.title,
    body: input.body ?? null,
    link_url: input.linkUrl ?? null,
  })
  if (error) return { error: error.message }
  return { success: true }
}

/**
 * Mark a notification as read. Authenticated users can only mark their
 * own; RLS enforces this independently.
 */
export async function markNotificationRead(notificationId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in.' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { error } = await db
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/me')
  return { success: true }
}

/**
 * Mark all unread notifications for the current user as read.
 */
export async function markAllNotificationsRead(): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in.' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { error } = await db
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .is('read_at', null)

  if (error) return { error: error.message }
  revalidatePath('/me')
  return { success: true }
}
