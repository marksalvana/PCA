'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toggleReaction } from '@/lib/actions/forum'
import type { ReactionType } from '@/types/database'

type Props = {
  postId: string
  likeCount: number
  dislikeCount: number
  /** Current user's existing reaction on this post, or null if none */
  userReaction: ReactionType | null
  /** Whether the viewer is signed in. When false, buttons prompt sign-in instead of reacting. */
  isLoggedIn: boolean
}

export default function ReactionButtons({
  postId,
  likeCount,
  dislikeCount,
  userReaction,
  isLoggedIn,
}: Props) {
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  function handle(reaction: ReactionType) {
    if (!isLoggedIn) {
      // Send to login with a return path back to /forum
      router.push('/login?next=/forum')
      return
    }
    startTransition(async () => {
      const result = await toggleReaction(postId, reaction)
      if ('error' in result) {
        // Surface a minimal alert; we keep it small to avoid overwhelming the post UI
        alert(result.error)
      }
      // Server action calls revalidatePath('/forum'), so a refresh re-fetches counts
      router.refresh()
    })
  }

  const likeActive = userReaction === 'like'
  const dislikeActive = userReaction === 'dislike'

  return (
    <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100">
      <button
        type="button"
        onClick={() => handle('like')}
        disabled={pending}
        title={isLoggedIn ? (likeActive ? 'Remove like' : 'Like') : 'Sign in to react'}
        className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
          likeActive
            ? 'bg-green-50 text-green-700 border-green-200'
            : 'bg-white text-slate-500 border-slate-200 hover:border-green-200 hover:text-green-700'
        }`}
        aria-pressed={likeActive}
        aria-label={`Like${likeCount > 0 ? `, ${likeCount} so far` : ''}`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill={likeActive ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M7 10v12" />
          <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H7V10l4-7c.6-.27 1.4-.27 2 0a2 2 0 0 1 .92 2l-.92 1.88Z" />
        </svg>
        <span className="tabular-nums">{likeCount}</span>
      </button>

      <button
        type="button"
        onClick={() => handle('dislike')}
        disabled={pending}
        title={isLoggedIn ? (dislikeActive ? 'Remove dislike' : 'Dislike') : 'Sign in to react'}
        className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
          dislikeActive
            ? 'bg-red-50 text-red-700 border-red-200'
            : 'bg-white text-slate-500 border-slate-200 hover:border-red-200 hover:text-red-700'
        }`}
        aria-pressed={dislikeActive}
        aria-label={`Dislike${dislikeCount > 0 ? `, ${dislikeCount} so far` : ''}`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill={dislikeActive ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M17 14V2" />
          <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H17v12l-4 7c-.6.27-1.4.27-2 0a2 2 0 0 1-.92-2l.92-1.88Z" />
        </svg>
        <span className="tabular-nums">{dislikeCount}</span>
      </button>

      {!isLoggedIn && (
        <span className="text-[10px] text-slate-400 ml-1">Sign in to react</span>
      )}
    </div>
  )
}
