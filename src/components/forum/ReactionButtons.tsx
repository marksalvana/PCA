'use client'

import { useOptimistic, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { ReactionType } from '@/types/database'

type ToggleResult = { success: true } | { error: string }
type ToggleAction = (targetId: string, reaction: ReactionType) => Promise<ToggleResult>

type Props = {
  /** ID of the thing being reacted to — a forum post id or a forum reply id */
  targetId: string
  likeCount: number
  dislikeCount: number
  /** Current user's existing reaction on this target, or null if none */
  userReaction: ReactionType | null
  /** Whether the viewer is signed in. When false, buttons send to /login. */
  isLoggedIn: boolean
  /** Server action that handles the toggle (toggleReaction or toggleReplyReaction) */
  onToggle: ToggleAction
  /** Path to redirect anonymous users back to after sign-in. Defaults to /forum. */
  loginNext?: string
  /** Pixel size for the icon. Defaults to 16; replies use 14 for tighter spacing. */
  iconSize?: number
}

type ReactionState = {
  likeCount: number
  dislikeCount: number
  userReaction: ReactionType | null
}

/**
 * Pure reducer that mirrors the server action's state transitions.
 * Used by useOptimistic to flip the UI immediately on click; the
 * server-confirmed state replaces it once router.refresh() returns.
 */
function reactionReducer(state: ReactionState, action: ReactionType): ReactionState {
  const isLiked = state.userReaction === 'like'
  const isDisliked = state.userReaction === 'dislike'

  if (action === 'like') {
    if (isLiked) {
      return { ...state, likeCount: state.likeCount - 1, userReaction: null }
    }
    if (isDisliked) {
      return {
        likeCount: state.likeCount + 1,
        dislikeCount: state.dislikeCount - 1,
        userReaction: 'like',
      }
    }
    return { ...state, likeCount: state.likeCount + 1, userReaction: 'like' }
  }
  // action === 'dislike' — symmetric
  if (isDisliked) {
    return { ...state, dislikeCount: state.dislikeCount - 1, userReaction: null }
  }
  if (isLiked) {
    return {
      likeCount: state.likeCount - 1,
      dislikeCount: state.dislikeCount + 1,
      userReaction: 'dislike',
    }
  }
  return { ...state, dislikeCount: state.dislikeCount + 1, userReaction: 'dislike' }
}

export default function ReactionButtons({
  targetId,
  likeCount,
  dislikeCount,
  userReaction,
  isLoggedIn,
  onToggle,
  loginNext = '/forum',
  iconSize = 16,
}: Props) {
  const [, startTransition] = useTransition()
  const router = useRouter()
  const [optimistic, applyOptimistic] = useOptimistic<ReactionState, ReactionType>(
    { likeCount, dislikeCount, userReaction },
    reactionReducer,
  )

  function handle(reaction: ReactionType) {
    if (!isLoggedIn) {
      router.push(`/login?next=${encodeURIComponent(loginNext)}`)
      return
    }
    startTransition(async () => {
      applyOptimistic(reaction)
      const result = await onToggle(targetId, reaction)
      if ('error' in result) {
        alert(result.error)
      }
      router.refresh()
    })
  }

  const likeActive = optimistic.userReaction === 'like'
  const dislikeActive = optimistic.userReaction === 'dislike'

  return (
    <div className="flex items-center gap-2">
      <ReactionButton
        kind="like"
        active={likeActive}
        count={optimistic.likeCount}
        loggedIn={isLoggedIn}
        iconSize={iconSize}
        onClick={() => handle('like')}
      />
      <ReactionButton
        kind="dislike"
        active={dislikeActive}
        count={optimistic.dislikeCount}
        loggedIn={isLoggedIn}
        iconSize={iconSize}
        onClick={() => handle('dislike')}
      />
      {!isLoggedIn && (
        <span className="text-[11px] text-slate-400 italic">Sign in to react</span>
      )}
    </div>
  )
}

function ReactionButton({
  kind,
  active,
  count,
  loggedIn,
  iconSize,
  onClick,
}: {
  kind: ReactionType
  active: boolean
  count: number
  loggedIn: boolean
  iconSize: number
  onClick: () => void
}) {
  const isLike = kind === 'like'
  // Active state: solid filled background. Inactive: subtle outline.
  // Hover hint pulls toward the active color so users see the affordance.
  const activeStyles = isLike
    ? 'bg-green-600 text-white border-green-600 shadow-sm'
    : 'bg-rose-600 text-white border-rose-600 shadow-sm'
  const idleStyles = isLike
    ? 'bg-white text-slate-600 border-slate-200 hover:border-green-300 hover:text-green-700 hover:bg-green-50/50'
    : 'bg-white text-slate-600 border-slate-200 hover:border-rose-300 hover:text-rose-700 hover:bg-rose-50/50'

  return (
    <button
      type="button"
      onClick={onClick}
      title={loggedIn ? (active ? `Remove ${kind}` : isLike ? 'Like this post' : 'Dislike this post') : 'Sign in to react'}
      aria-pressed={active}
      aria-label={`${isLike ? 'Like' : 'Dislike'} (${count})`}
      className={`group inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border transition-all duration-150 active:scale-95 ${
        active ? activeStyles : idleStyles
      }`}
    >
      {/* Lucide thumbs-up / thumbs-down. Stroke-only when idle, filled-with-currentColor when active. */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-transform duration-150 group-active:scale-90"
        aria-hidden
      >
        {isLike ? (
          <>
            <path d="M7 10v12" />
            <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H7V10l4-7c.6-.27 1.4-.27 2 0a2 2 0 0 1 .92 2l-.92 1.88Z" />
          </>
        ) : (
          <>
            <path d="M17 14V2" />
            <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H17v12l-4 7c-.6.27-1.4.27-2 0a2 2 0 0 1-.92-2l.92-1.88Z" />
          </>
        )}
      </svg>
      <span className="tabular-nums">{count}</span>
    </button>
  )
}
