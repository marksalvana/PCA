'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import LanguageToggle from './LanguageToggle'
import Logo from './Logo'

type DropdownItem = { href: string; label: string; description?: string }
type DropdownKey = 'contribute' | 'learn'

const TOP_LEVEL = [
  { href: '/profiles', label: 'Profiles' },
  { href: '/compare',  label: 'Compare' },
  { href: '/lens',     label: 'Lens' },
] as const

const DROPDOWNS: Record<DropdownKey, { label: string; items: DropdownItem[] }> = {
  contribute: {
    label: 'Contribute',
    items: [
      { href: '/submit',       label: 'Submit a record',  description: 'Add education, track record, or achievement' },
      { href: '/petition',     label: 'Request a profile',description: 'Suggest a new politician to add' },
      { href: '/vetter-apply', label: 'Become a vetter',  description: 'Help verify submitted records' },
      { href: '/forum',        label: 'Forum',            description: 'Discuss and give feedback' },
    ],
  },
  learn: {
    label: 'Learn',
    items: [
      { href: '/methodology', label: 'How It Works', description: 'Methodology and institutional sources' },
      { href: '/about',       label: 'About',        description: 'What Politiko is and isn\'t' },
    ],
  },
}

const DROPDOWN_KEYS: DropdownKey[] = ['contribute', 'learn']

// Flat list for mobile menu — keeps order matching desktop
const MOBILE_GROUPS: { heading: string; items: { href: string; label: string }[] }[] = [
  { heading: '', items: TOP_LEVEL.map((l) => ({ href: l.href, label: l.label })) },
  ...DROPDOWN_KEYS.map((k) => ({
    heading: DROPDOWNS[k].label,
    items: DROPDOWNS[k].items.map((i) => ({ href: i.href, label: i.label })),
  })),
]

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<DropdownKey | null>(null)
  const dropdownsRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false)
    setOpenDropdown(null)
  }, [pathname])

  // Lock body scroll while mobile menu is open
  useEffect(() => {
    if (!mobileOpen) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  // Close any open dropdown on outside click or Escape
  useEffect(() => {
    if (!openDropdown) return
    function handleClick(e: MouseEvent) {
      if (dropdownsRef.current && !dropdownsRef.current.contains(e.target as Node)) {
        setOpenDropdown(null)
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenDropdown(null)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [openDropdown])

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E8E4DC]">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-3">

        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0" aria-label="Politiko home">
          <Logo variant="dark" height={32} />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {TOP_LEVEL.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-[#4A4540] hover:text-[#1B2A4A] px-3 py-1.5 rounded hover:bg-[#F4F2EE] transition-colors font-medium"
            >
              {link.label}
            </Link>
          ))}

          {/* Named dropdowns — Contribute, Learn */}
          <div className="flex items-center gap-1" ref={dropdownsRef}>
            {DROPDOWN_KEYS.map((key) => {
              const dd = DROPDOWNS[key]
              const isOpen = openDropdown === key
              return (
                <div key={key} className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenDropdown(isOpen ? null : key)}
                    aria-haspopup="menu"
                    aria-expanded={isOpen}
                    className={`text-sm px-3 py-1.5 rounded transition-colors font-medium inline-flex items-center gap-1 ${
                      isOpen
                        ? 'text-[#1B2A4A] bg-[#F4F2EE]'
                        : 'text-[#4A4540] hover:text-[#1B2A4A] hover:bg-[#F4F2EE]'
                    }`}
                  >
                    {dd.label}
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 12 12"
                      aria-hidden
                      className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    >
                      <path d="M3 4.5 L6 8 L9 4.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {isOpen && (
                    <div
                      role="menu"
                      className="absolute top-full right-0 mt-1 w-72 bg-white border border-[#E8E4DC] rounded-xl shadow-lg overflow-hidden"
                    >
                      <ul className="py-2">
                        {dd.items.map((item) => (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              className="block px-3 py-2 hover:bg-[#F4F2EE] transition-colors"
                              role="menuitem"
                            >
                              <span className="block text-sm font-semibold text-[#1B2A4A]">{item.label}</span>
                              {item.description && (
                                <span className="block text-xs text-slate-500 mt-0.5">{item.description}</span>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <LanguageToggle />
          <Link
            href="/login"
            className="ml-2 text-sm bg-[#1B2A4A] hover:bg-[#243761] text-white font-semibold px-4 py-1.5 rounded transition-colors"
          >
            Login / Sign Up
          </Link>
        </nav>

        {/* Mobile controls */}
        <div className="md:hidden flex items-center gap-2">
          <LanguageToggle />
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            className="p-2 -mr-2 text-[#1B2A4A] hover:bg-[#F4F2EE] rounded transition-colors"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {mobileOpen ? (
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
      {mobileOpen && (
        <div
          id="mobile-menu"
          className="md:hidden border-t border-[#E8E4DC] bg-white shadow-sm max-h-[calc(100vh-3.5rem)] overflow-y-auto"
        >
          <nav className="max-w-5xl mx-auto px-4 py-3 flex flex-col gap-1">
            {MOBILE_GROUPS.map((group) => (
              <div key={group.heading || 'top'} className={group.heading ? 'mt-3 pt-3 border-t border-[#F4F2EE]' : ''}>
                {group.heading && (
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3 mb-1">
                    {group.heading}
                  </p>
                )}
                {group.items.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block text-base text-[#4A4540] hover:text-[#1B2A4A] hover:bg-[#F4F2EE] px-3 py-2.5 rounded transition-colors font-medium"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
            <Link
              href="/login"
              className="mt-3 text-center text-sm bg-[#1B2A4A] hover:bg-[#243761] text-white font-semibold px-4 py-2.5 rounded transition-colors"
            >
              Login / Sign Up
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
