import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import ForumForm from './ForumForm'
import PostFooter from '@/components/forum/PostFooter'
import RepliesThread, { type ReplyWithReactions } from '@/components/forum/RepliesThread'
import type { ForumReply, ReactionType } from '@/types/database'

export const metadata = { title: 'Community Forum — Politiko' }

type ForumPost = {
  id: string
  author_name: string
  content: string
  category: string
  is_pinned: boolean
  created_at: string
}

type ReactionRow = {
  post_id: string
  user_id: string
  reaction: ReactionType
}

type ReplyReactionRow = {
  reply_id: string
  user_id: string
  reaction: ReactionType
}

const CATEGORY_LABELS: Record<string, string> = {
  suggestion: 'Suggestion',
  feedback:   'Feedback',
  question:   'Question',
  bug_report: 'Bug Report',
  general:    'General',
}

const CATEGORY_COLORS: Record<string, string> = {
  suggestion: 'text-blue-700 bg-blue-50 border-blue-200',
  feedback:   'text-green-700 bg-green-50 border-green-200',
  question:   'text-amber-700 bg-amber-50 border-amber-200',
  bug_report: 'text-red-700 bg-red-50 border-red-200',
  general:    'text-slate-600 bg-slate-100 border-slate-200',
}

type SearchParams = { category?: string }

export default async function ForumPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const activeCategory = params.category ?? ''

  const supabase = await createClient()

  // forum_posts is added via migration; cast required until Supabase reflects the new table
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  let query = db
    .from('forum_posts')
    .select('id, author_name, content, category, is_pinned, created_at')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })

  if (activeCategory) {
    query = query.eq('category', activeCategory)
  }

  const { data } = await query
  const posts = (data ?? []) as ForumPost[]

  // Fetch in parallel:
  //  1. post-level reactions for the visible posts
  //  2. all replies (any depth) for the visible posts
  //  3. the auth user
  const postIds = posts.map((p) => p.id)
  const [{ data: reactionsData }, { data: repliesData }, { data: { user } }] = await Promise.all([
    postIds.length === 0
      ? Promise.resolve({ data: [] as ReactionRow[] })
      : db
          .from('forum_reactions')
          .select('post_id, user_id, reaction')
          .in('post_id', postIds),
    postIds.length === 0
      ? Promise.resolve({ data: [] as ForumReply[] })
      : db
          .from('forum_replies')
          .select('id, post_id, parent_reply_id, depth, user_id, author_name, content, created_at')
          .in('post_id', postIds)
          .order('created_at', { ascending: true }),
    supabase.auth.getUser(),
  ])
  const reactions = (reactionsData ?? []) as ReactionRow[]
  const allReplies = (repliesData ?? []) as ForumReply[]

  // Bucket post-level reaction counts + viewer's own reaction by post_id
  const reactionMap = new Map<string, { likes: number; dislikes: number; userReaction: ReactionType | null }>()
  for (const id of postIds) reactionMap.set(id, { likes: 0, dislikes: 0, userReaction: null })
  for (const r of reactions) {
    const bucket = reactionMap.get(r.post_id)
    if (!bucket) continue
    if (r.reaction === 'like') bucket.likes += 1
    else if (r.reaction === 'dislike') bucket.dislikes += 1
    if (user && r.user_id === user.id) bucket.userReaction = r.reaction
  }

  // Fetch reply-level reactions for all visible replies, then bucket
  const replyIds = allReplies.map((r) => r.id)
  const { data: replyReactionsData } = replyIds.length === 0
    ? { data: [] as ReplyReactionRow[] }
    : await db
        .from('forum_reply_reactions')
        .select('reply_id, user_id, reaction')
        .in('reply_id', replyIds)
  const replyReactions = (replyReactionsData ?? []) as ReplyReactionRow[]

  const replyReactionMap = new Map<string, { likes: number; dislikes: number; userReaction: ReactionType | null }>()
  for (const id of replyIds) replyReactionMap.set(id, { likes: 0, dislikes: 0, userReaction: null })
  for (const r of replyReactions) {
    const bucket = replyReactionMap.get(r.reply_id)
    if (!bucket) continue
    if (r.reaction === 'like') bucket.likes += 1
    else if (r.reaction === 'dislike') bucket.dislikes += 1
    if (user && r.user_id === user.id) bucket.userReaction = r.reaction
  }

  // Group replies by post_id and decorate each with its reaction counts
  const repliesByPost = new Map<string, ReplyWithReactions[]>()
  for (const r of allReplies) {
    const existing = repliesByPost.get(r.post_id) ?? []
    const counts = replyReactionMap.get(r.id) ?? { likes: 0, dislikes: 0, userReaction: null }
    existing.push({ ...r, likeCount: counts.likes, dislikeCount: counts.dislikes, userReaction: counts.userReaction })
    repliesByPost.set(r.post_id, existing)
  }

  // Look up viewer's phone_verified for the post-permission gate.
  // Author name comes from the server action (auto-filled from
  // user_profiles.display_name) so we don't need to pass it client-side.
  let viewerCanPost = false
  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('phone_verified')
      .eq('id', user.id)
      .maybeSingle<{ phone_verified: boolean }>()
    viewerCanPost = !!profile?.phone_verified
  }

  const ALL_CATEGORIES = ['suggestion', 'feedback', 'question', 'bug_report', 'general']

  function categoryHref(cat: string) {
    return cat ? `/forum?category=${cat}` : '/forum'
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-slate-900 mb-1">Community Forum</h1>
        <p className="text-slate-500 text-sm">
          Share suggestions, ask questions, or report issues. This is a space for the community.
        </p>
      </div>

      <Suspense>
        <ForumForm canPost={viewerCanPost} />
      </Suspense>

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        <a
          href={categoryHref('')}
          className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${
            !activeCategory
              ? 'bg-slate-800 text-white border-slate-800'
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
          }`}
        >
          All
        </a>
        {ALL_CATEGORIES.map((cat) => (
          <a
            key={cat}
            href={categoryHref(cat)}
            className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${
              activeCategory === cat
                ? 'bg-slate-800 text-white border-slate-800'
                : `${CATEGORY_COLORS[cat]} hover:opacity-80`
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </a>
        ))}
      </div>

      {/* Posts list */}
      {posts.length > 0 ? (
        <div className="space-y-3">
          {posts.map((post) => {
            const counts = reactionMap.get(post.id) ?? { likes: 0, dislikes: 0, userReaction: null }
            const postReplies = repliesByPost.get(post.id) ?? []
            return (
              <div key={post.id} className={`card p-4 ${post.is_pinned ? 'border-l-4 border-l-[#1B2A4A]' : ''}`}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {post.is_pinned && (
                      <span className="text-xs font-black text-[#1B2A4A]">📌 Pinned</span>
                    )}
                    <span className="text-sm font-bold text-slate-900">{post.author_name}</span>
                    <span className={`text-xs font-bold border px-2 py-0.5 rounded-md ${CATEGORY_COLORS[post.category] ?? CATEGORY_COLORS.general}`}>
                      {CATEGORY_LABELS[post.category] ?? post.category}
                    </span>
                  </div>
                  <time className="text-xs text-slate-400 shrink-0">
                    {new Date(post.created_at).toLocaleDateString('en-PH', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })}
                  </time>
                </div>
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{post.content}</p>
                <PostFooter
                  postId={post.id}
                  likeCount={counts.likes}
                  dislikeCount={counts.dislikes}
                  userReaction={counts.userReaction}
                  isLoggedIn={!!user}
                  replyCount={postReplies.length}
                />
                <RepliesThread
                  postId={post.id}
                  replies={postReplies}
                  isLoggedIn={!!user}
                />
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-20 card">
          <p className="text-slate-400 text-lg mb-1">No posts yet.</p>
          <p className="text-slate-400 text-sm">Be the first to share something!</p>
        </div>
      )}
    </div>
  )
}
