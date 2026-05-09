'use client'

import { useState } from 'react'
import { toggleReaction } from '@/lib/actions/forum'
import ReactionButtons from './ReactionButtons'
import ReplyComposer from './ReplyComposer'
import type { ReactionType } from '@/types/database'

type Props = {
  postId: string
  likeCount: number
  dislikeCount: number
  userReaction: ReactionType | null
  isLoggedIn: boolean
  /** Number of top-level replies on this post, used in the "X replies" hint */
  replyCount: number
}

/**
 * Footer bar under each forum post — reactions on the left, "Reply" toggle
 * on the right, and an inline ReplyComposer when toggled open. Lives in
 * the forum page just below the post body.
 */
export default function PostFooter({
  postId,
  likeCount,
  dislikeCount,
  userReaction,
  isLoggedIn,
  replyCount,
}: Props) {
  const [composerOpen, setComposerOpen] = useState(false)

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-slate-100 flex-wrap">
        <ReactionButtons
          targetId={postId}
          likeCount={likeCount}
          dislikeCount={dislikeCount}
          userReaction={userReaction}
          isLoggedIn={isLoggedIn}
          onToggle={toggleReaction}
        />
        <div className="flex items-center gap-3">
          {replyCount > 0 && (
            <span className="text-xs text-slate-400">{replyCount} {replyCount === 1 ? 'reply' : 'replies'}</span>
          )}
          {!composerOpen && (
            <button
              type="button"
              onClick={() => setComposerOpen(true)}
              className="text-xs font-bold text-[#1B2A4A] bg-blue-50 hover:bg-blue-100 border border-blue-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              Reply
            </button>
          )}
        </div>
      </div>
      {composerOpen && (
        <ReplyComposer
          postId={postId}
          onCancel={() => setComposerOpen(false)}
          onSubmitted={() => setComposerOpen(false)}
        />
      )}
    </div>
  )
}
