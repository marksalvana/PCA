'use client'

import { useEffect, useRef } from 'react'

/**
 * Cloudflare Turnstile widget.
 *
 * Renders the invisible/managed CAPTCHA widget and surfaces the resulting
 * token via onToken. The token is single-use and short-lived (~5 min);
 * pass it to the server (via Supabase auth `captchaToken` option for
 * signup/login, or via FormData for our own server actions).
 *
 * If NEXT_PUBLIC_TURNSTILE_SITE_KEY is unset (local dev), renders a
 * visible warning placeholder and emits a `dev-bypass` token so the form
 * doesn't get stuck. The server-side verifier also bypasses when its
 * secret isn't set, so dev flows still work end-to-end.
 */

interface TurnstileApi {
  render: (el: HTMLElement, opts: TurnstileOptions) => string
  reset: (widgetId?: string) => void
  remove: (widgetId?: string) => void
}

interface TurnstileOptions {
  sitekey: string
  callback?: (token: string) => void
  'error-callback'?: () => void
  'expired-callback'?: () => void
  'timeout-callback'?: () => void
  theme?: 'light' | 'dark' | 'auto'
  size?: 'normal' | 'compact' | 'flexible'
  appearance?: 'always' | 'execute' | 'interaction-only'
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

let scriptPromise: Promise<void> | null = null

function loadTurnstileScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('window unavailable'))
  }
  if (window.turnstile) return Promise.resolve()
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => {
      scriptPromise = null
      reject(new Error('Turnstile script failed to load'))
    }
    document.head.appendChild(script)
  })
  return scriptPromise
}

type Props = {
  onToken: (token: string) => void
  /** Visual theme of the widget. Default 'light'. */
  theme?: 'light' | 'dark' | 'auto'
  /** Action label for analytics on the Cloudflare side (optional). */
  action?: string
}

export default function TurnstileWidget({ onToken, theme = 'light' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const onTokenRef = useRef(onToken)
  onTokenRef.current = onToken

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  useEffect(() => {
    if (!siteKey) {
      // Dev mode: signal a bypass token so submit buttons enable.
      onTokenRef.current('dev-bypass')
      return
    }

    let cancelled = false
    const node = containerRef.current
    if (!node) return

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !window.turnstile || !containerRef.current) return
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (t) => onTokenRef.current(t),
          'error-callback': () => onTokenRef.current(''),
          'expired-callback': () => onTokenRef.current(''),
          theme,
        })
      })
      .catch((err) => {
        // Best-effort: if Cloudflare is down, surface a token-less state
        // so the form rejects rather than silently posts.
        console.error('[turnstile] failed to load', err)
        onTokenRef.current('')
      })

    return () => {
      cancelled = true
      if (widgetIdRef.current && window.turnstile) {
        try { window.turnstile.remove(widgetIdRef.current) } catch { /* ignore */ }
        widgetIdRef.current = null
      }
    }
  }, [siteKey, theme])

  if (!siteKey) {
    return (
      <div className="text-xs text-amber-700 italic px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
        ⚠ CAPTCHA disabled (NEXT_PUBLIC_TURNSTILE_SITE_KEY not set) — dev mode
      </div>
    )
  }

  return <div ref={containerRef} className="cf-turnstile" />
}
