'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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
