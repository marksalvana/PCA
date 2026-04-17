import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import ForumForm from './ForumForm'

export const metadata = { title: 'Community Forum — PH Profile Compare' }

type ForumPost = {
  id: string
  author_name: string
  content: string
  category: string
  is_pinned: boolean
  created_at: string
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
        <ForumForm />
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
          {posts.map((post) => (
            <div key={post.id} className={`card p-4 ${post.is_pinned ? 'border-l-4 border-l-[#0038a8]' : ''}`}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {post.is_pinned && (
                    <span className="text-xs font-black text-[#0038a8]">📌 Pinned</span>
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
            </div>
          ))}
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
