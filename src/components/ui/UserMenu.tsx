'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { UserRole } from '@/types/database'

type Props = {
  displayName: string
  email: string
  role: UserRole
  unreadCount: number
}

type MenuItem = {
  href: string
  label: string
  description?: string
  /** Roles that should see this item; if empty, everyone sees it. */
  roles?: UserRole[]
}

const ITEMS: MenuItem[] = [
  // Always-visible
  { href: '/me', label: 'Profile dashboard', description: 'Your activity, notifications, settings' },

  // Backend tools — visible per role
  { href: '/dashboard',                       label: 'Admin dashboard',         description: 'Site-wide overview',                roles: ['admin', 'superadmin'] },
  { href: '/admin/profiles',                  label: 'Manage profiles',         description: 'Browse and edit politiko profiles', roles: ['admin', 'superadmin', 'contributor'] },
  { href: '/admin/profiles/new',              label: '＋ New profile',          description: 'Add a politiko profile',            roles: ['admin', 'superadmin', 'contributor'] },
  { href: '/vetting',                         label: 'Vetting queue',           description: 'Verify submitted records',          roles: ['admin', 'superadmin', 'vetter'] },
  { href: '/admin/submissions',               label: 'Submissions queue',       description: 'Review citizen submissions',        roles: ['admin', 'superadmin', 'vetter', 'contributor'] },
  { href: '/admin/contributor-applications',  label: 'Contributor applications', description: 'Approve new contributors',          roles: ['admin', 'superadmin'] },

  // Become-a-X paths for members
  { href: '/contributor-apply', label: 'Apply as contributor', description: 'Help submit records and profiles', roles: ['member'] },
  { href: '/vetter-apply',      label: 'Apply as vetter',      description: 'Help verify records',              roles: ['member'] },
]

const ROLE_BADGE: Record<UserRole, { label: string; className: string }> = {
  admin:       { label: 'Admin',       className: 'bg-blue-50 text-blue-700 border-blue-200' },
  superadmin:  { label: 'Super Admin', className: 'bg-purple-50 text-purple-700 border-purple-200' },
  vetter:      { label: 'Vetter',      className: 'bg-amber-50 text-amber-700 border-amber-200' },
  contributor: { label: 'Contributor', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  member:      { label: 'Member',      className: 'bg-slate-50 text-slate-600 border-slate-200' },
  public:      { label: 'Member',      className: 'bg-slate-50 text-slate-600 border-slate-200' },
}

function avatarColor(name: string) {
  const colors = ['bg-blue-600', 'bg-indigo-600', 'bg-purple-600', 'bg-teal-600', 'bg-emerald-600', 'bg-orange-600', 'bg-rose-600']
  const code = name.charCodeAt(0) || 0
  return colors[code % colors.length]
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function UserMenu({ displayName, email, role, unreadCount }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Close on outside click + Escape
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  const visibleItems = ITEMS.filter((it) => !it.roles || it.roles.includes(role))
  const badge = ROLE_BADGE[role] ?? ROLE_BADGE.member

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-2 pr-2 pl-1 py-1 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-[#F4F2EE] transition-colors group"
      >
        <span className={`relative w-8 h-8 rounded-full ${avatarColor(displayName)} text-white text-xs font-black flex items-center justify-center`}>
          {initials(displayName)}
          {unreadCount > 0 && (
            <span
              aria-label={`${unreadCount} unread notifications`}
              className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border border-white"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </span>
        <span className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-slate-700">
          {displayName.split(/\s+/)[0]}
          <svg
            width="10"
            height="10"
            viewBox="0 0 12 12"
            aria-hidden
            className={`transition-transform ${open ? 'rotate-180' : ''}`}
          >
            <path d="M3 4.5 L6 8 L9 4.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-full right-0 mt-2 w-72 bg-white border border-[#E8E4DC] rounded-xl shadow-lg overflow-hidden z-50"
        >
          {/* Identity header */}
          <div className="px-4 pt-4 pb-3 border-b border-[#E8E4DC]">
            <p className="text-sm font-bold text-slate-900 truncate">{displayName}</p>
            <p className="text-xs text-slate-500 truncate font-mono">{email}</p>
            <span className={`inline-block text-[10px] font-bold uppercase tracking-widest border px-1.5 py-0.5 rounded-md mt-2 ${badge.className}`}>
              {badge.label}
            </span>
          </div>

          {/* Items */}
          <ul className="py-1">
            {visibleItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block px-4 py-2 hover:bg-[#F4F2EE] transition-colors"
                  role="menuitem"
                  onClick={() => setOpen(false)}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-[#1B2A4A]">{item.label}</span>
                    {item.href === '/me' && unreadCount > 0 && (
                      <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </span>
                  {item.description && (
                    <span className="block text-xs text-slate-500 mt-0.5">{item.description}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>

          {/* Sign out */}
          <div className="border-t border-[#E8E4DC]">
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
              role="menuitem"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
