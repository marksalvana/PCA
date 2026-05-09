'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { submitReply } from '@/lib/actions/forum'

type Props = {
  postId: string
  /** Set when this composer is replying to an existing reply */
  parentReplyId?: string | null
  /** Pre-fill the name field if the viewer is signed in */
  defaultAuthorName?: string
  /** Called when the user cancels (closes the composer) */
  onCancel?: () => void
  /** Called after a successful submission so the parent can hide the composer */
  onSubmitted?: () => void
}

export default function ReplyComposer({
  postId,
  parentReplyId = null,
  defaultAuthorName = '',
  onCancel,
  onSubmitted,
}: Props) {
  const [authorName, setAuthorName] = useState(defaultAuthorName)
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const formData = new FormData()
      formData.set('post_id', postId)
      if (parentReplyId) formData.set('parent_reply_id', parentReplyId)
      formData.set('author_name', authorName)
      formData.set('content', content)
      const result = await submitReply(formData)
      if ('error' in result) {
        setError(result.error)
        return
      }
      setContent('')
      onSubmitted?.()
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 rounded-lg p-3 mt-2">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded mb-2">
          {error}
        </div>
      )}
      <div className="flex flex-col gap-2">
        <input
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="Your name"
          required
          minLength={2}
          className="w-full bg-white border border-slate-200 focus:border-[#1B2A4A] focus:ring-2 focus:ring-[#1B2A4A]/10 rounded-md px-2.5 py-1.5 text-xs outline-none"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={parentReplyId ? 'Write a reply…' : 'Add a reply to this post…'}
          required
          minLength={5}
          rows={2}
          className="w-full bg-white border border-slate-200 focus:border-[#1B2A4A] focus:ring-2 focus:ring-[#1B2A4A]/10 rounded-md px-2.5 py-1.5 text-xs outline-none resize-none"
          autoFocus
        />
      </div>
      <div className="flex items-center justify-end gap-1.5 mt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-2.5 py-1 rounded transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={pending}
          className="text-xs font-bold bg-[#1B2A4A] hover:bg-[#243761] disabled:opacity-50 text-white px-3 py-1 rounded transition-colors"
        >
          {pending ? 'Posting…' : 'Reply'}
        </button>
      </div>
    </form>
  )
}
