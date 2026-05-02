'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import LanguageToggle from './LanguageToggle'

const links = [
  { href: '/profiles', label: 'Profiles' },
  { href: '/compare', label: 'Compare' },
  { href: '/methodology', label: 'How It Works' },
  { href: '/petition', label: 'Request' },
  { href: '/forum', label: 'Forum' },
  { href: '/about', label: 'About' },
]

export default function Nav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E8E4DC]">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/politiko-logo.svg" alt="Politiko" className="h-8 w-auto" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-[#4A4540] hover:text-[#1B2A4A] px-3 py-1.5 rounded hover:bg-[#F4F2EE] transition-colors font-medium"
            >
              {link.label}
            </Link>
          ))}
          <LanguageToggle />
          <Link
            href="/login"
            className="ml-2 text-sm bg-[#1B2A4A] hover:bg-[#243761] text-white font-semibold px-4 py-1.5 rounded transition-colors"
          >
            Admin
          </Link>
        </nav>

        {/* Mobile controls */}
        <div className="md:hidden flex items-center gap-2">
          <LanguageToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="p-2 -mr-2 text-[#1B2A4A] hover:bg-[#F4F2EE] rounded transition-colors"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {open ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {open && (
        <div
          id="mobile-menu"
          className="md:hidden border-t border-[#E8E4DC] bg-white shadow-sm"
        >
          <nav className="max-w-5xl mx-auto px-4 py-3 flex flex-col">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-base text-[#4A4540] hover:text-[#1B2A4A] hover:bg-[#F4F2EE] px-3 py-3 rounded transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="mt-2 text-center text-sm bg-[#1B2A4A] hover:bg-[#243761] text-white font-semibold px-4 py-2.5 rounded transition-colors"
            >
              Admin
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
