'use client'

import { useState } from 'react'
import { useLens } from './LensProvider'
import { isCanonicalLens } from '@/lib/scoring'

type Props = {
  slugA: string
  slugB: string
}

export default function ShareLensButton({ slugA, slugB }: Props) {
  const { lens, hydrated } = useLens()
  const [copied, setCopied] = useState(false)

  if (!hydrated) return null

  const canonical = isCanonicalLens(lens)

  async function handleShare() {
    const params = new URLSearchParams({
      a: slugA,
      b: slugB,
      edu: String(Math.round(lens.edu * 100)),
      track: String(Math.round(lens.track * 100)),
      ach: String(Math.round(lens.achievement * 100)),
      awards: String(Math.round(lens.awards * 100)),
    })
    const url = `${window.location.origin}/compare/lens?${params.toString()}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Clipboard unavailable — fall back to opening the URL in a new tab
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={canonical}
      title={canonical ? 'Adjust the lens sliders to share a custom view' : 'Copy a shareable link to this view'}
      className="text-xs font-bold border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg transition-colors"
    >
      {copied ? '✓ Link copied' : 'Share this lens →'}
    </button>
  )
}
