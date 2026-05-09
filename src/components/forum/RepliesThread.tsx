'use client'

import { useState } from 'react'
import { toggleReplyReaction } from '@/lib/actions/forum'
import ReactionButtons from './ReactionButtons'
import ReplyComposer from './ReplyComposer'
import type { ForumReply, ReactionType } from '@/types/database'

export type ReplyWithReactions = ForumReply & {
  likeCount: number
  dislikeCount: number
  userReaction: ReactionType | null
}

type Props = {
  postId: string
  replies: ReplyWithReactions[]
  isLoggedIn: boolean
  defaultAuthorName?: string
}

const MAX_DEPTH = 2  // 0,1,2 — three levels deep

/**
 * Renders all replies for a single post as a recursive thread. Bulk
 * children are pre-fetched (replies prop); we just bucket them by
 * parent_reply_id and render. Depth-based indentation; "Reply" button
 * hidden once we hit MAX_DEPTH.
 */
export default function RepliesThread({ postId, replies, isLoggedIn, defaultAuthorName }: Props) {
  // Bucket replies by their parent (null parent = top-level on the post)
  const childrenByParent = new Map<string | null, ReplyWithReactions[]>()
  for (const r of replies) {
    const key = r.parent_reply_id
    const existing = childrenByParent.get(key)
    if (existing) existing.push(r)
    else childrenByParent.set(key, [r])
  }
  // Sort each bucket oldest-first so threads read top-to-bottom in time order
  for (const arr of childrenByParent.values()) {
    arr.sort((a, b) => a.created_at.localeCompare(b.created_at))
  }

  const topLevel = childrenByParent.get(null) ?? []
  if (topLevel.length === 0) {
    return null
  }

  return (
    <ul className="mt-3 pt-3 border-t border-slate-100 space-y-2">
      {topLevel.map((r) => (
        <ReplyNode
          key={r.id}
          reply={r}
          postId={postId}
          childrenByParent={childrenByParent}
          isLoggedIn={isLoggedIn}
          defaultAuthorName={defaultAuthorName}
        />
      ))}
    </ul>
  )
}

function ReplyNode({
  reply,
  postId,
  childrenByParent,
  isLoggedIn,
  defaultAuthorName,
}: {
  reply: ReplyWithReactions
  postId: string
  childrenByParent: Map<string | null, ReplyWithReactions[]>
  isLoggedIn: boolean
  defaultAuthorName?: string
}) {
  const [composerOpen, setComposerOpen] = useState(false)
  const children = childrenByParent.get(reply.id) ?? []
  const canReply = reply.depth < MAX_DEPTH

  // Indent visually based on depth using a left border
  const indentClass = reply.depth === 0
    ? ''
    : reply.depth === 1
      ? 'ml-3 sm:ml-5 pl-3 border-l-2 border-slate-100'
      : 'ml-3 sm:ml-5 pl-3 border-l-2 border-slate-100'

  return (
    <li className={indentClass}>
      <div className="bg-slate-50/60 border border-slate-100 rounded-lg p-3">
        <div className="flex items-start justify-between gap-3 mb-1">
          <span className="text-xs font-bold text-slate-800">{reply.author_name}</span>
          <time className="text-[10px] text-slate-400 shrink-0">
            {new Date(reply.created_at).toLocaleDateString('en-PH', {
              year: 'numeric', month: 'short', day: 'numeric',
            })}
          </time>
        </div>
        <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">{reply.content}</p>
        <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-slate-100/80 flex-wrap">
          <ReactionButtons
            targetId={reply.id}
            likeCount={reply.likeCount}
            dislikeCount={reply.dislikeCount}
            userReaction={reply.userReaction}
            isLoggedIn={isLoggedIn}
            onToggle={toggleReplyReaction}
            iconSize={14}
          />
          {canReply && !composerOpen && (
            <button
              type="button"
              onClick={() => setComposerOpen(true)}
              className="text-xs font-semibold text-slate-500 hover:text-[#1B2A4A] px-2 py-1 rounded transition-colors"
            >
              Reply
            </button>
          )}
          {!canReply && children.length === 0 && (
            <span className="text-[10px] text-slate-400 italic">Maximum depth reached</span>
          )}
        </div>

        {composerOpen && (
          <ReplyComposer
            postId={postId}
            parentReplyId={reply.id}
            defaultAuthorName={defaultAuthorName}
            onCancel={() => setComposerOpen(false)}
            onSubmitted={() => setComposerOpen(false)}
          />
        )}
      </div>

      {children.length > 0 && (
        <ul className="mt-2 space-y-2">
          {children.map((child) => (
            <ReplyNode
              key={child.id}
              reply={child}
              postId={postId}
              childrenByParent={childrenByParent}
              isLoggedIn={isLoggedIn}
              defaultAuthorName={defaultAuthorName}
            />
          ))}
        </ul>
      )}
    </li>
  )
}
