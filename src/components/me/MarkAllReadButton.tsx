'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { markAllNotificationsRead } from '@/lib/actions/notifications'

export default function MarkAllReadButton() {
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const result = await markAllNotificationsRead()
          if ('error' in result) alert(result.error)
          router.refresh()
        })
      }}
      className="text-xs font-bold text-slate-500 hover:text-[#1B2A4A] border border-slate-200 hover:border-[#1B2A4A] px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50"
    >
      {pending ? 'Marking…' : 'Mark all as read'}
    </button>
  )
}
