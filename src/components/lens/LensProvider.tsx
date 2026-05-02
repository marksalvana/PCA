'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { DEFAULT_LENS, clampLens, isCanonicalLens, type Lens } from '@/lib/scoring'

const STORAGE_KEY = 'politiko.lens.v1'

type LensContextValue = {
  lens: Lens
  setLens: (next: Lens) => void
  reset: () => void
  isCanonical: boolean
  hydrated: boolean
}

const LensContext = createContext<LensContextValue | null>(null)

function readStoredLens(): Lens {
  if (typeof window === 'undefined') return DEFAULT_LENS
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_LENS
    const parsed = JSON.parse(raw) as Partial<Lens>
    return clampLens(parsed)
  } catch {
    return DEFAULT_LENS
  }
}

export function LensProvider({ children }: { children: React.ReactNode }) {
  // SSR/initial render uses DEFAULT_LENS so server and first-client render match;
  // localStorage value is hydrated in a useEffect after mount.
  const [lens, setLensState] = useState<Lens>(DEFAULT_LENS)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setLensState(readStoredLens())
    setHydrated(true)
  }, [])

  const setLens = useCallback((next: Lens) => {
    const clamped = clampLens(next)
    setLensState(clamped)
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(clamped))
      } catch {
        // localStorage unavailable (private mode, quota) — silently ignore
      }
    }
  }, [])

  const reset = useCallback(() => setLens(DEFAULT_LENS), [setLens])

  const value = useMemo<LensContextValue>(() => ({
    lens,
    setLens,
    reset,
    isCanonical: isCanonicalLens(lens),
    hydrated,
  }), [lens, setLens, reset, hydrated])

  return <LensContext.Provider value={value}>{children}</LensContext.Provider>
}

export function useLens(): LensContextValue {
  const ctx = useContext(LensContext)
  if (!ctx) {
    throw new Error('useLens must be used within LensProvider')
  }
  return ctx
}
