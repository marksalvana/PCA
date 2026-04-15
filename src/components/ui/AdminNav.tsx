import Link from 'next/link'
import type { UserRole } from '@/types/database'

const links = [
  { href: '/dashboard', label: 'Dashboard', roles: ['admin', 'vetter'] },
  { href: '/admin/profiles', label: 'Profiles', roles: ['admin'] },
  { href: '/vetting', label: 'Vetting Queue', roles: ['admin', 'vetter'] },
  { href: '/profiles', label: '← Public Site', roles: ['admin', 'vetter'] },
]

export default function AdminNav({ role }: { role: UserRole }) {
  const visible = links.filter((l) => l.roles.includes(role))

  return (
    <aside className="w-48 shrink-0 bg-[#111827] border-r border-white/10 p-4 hidden md:flex flex-col gap-1">
      <div className="text-xs font-bold text-gray-600 uppercase tracking-widest px-2 mb-3">
        Admin
      </div>
      {visible.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="text-sm text-gray-400 hover:text-white px-2 py-1.5 rounded hover:bg-white/5 transition-colors"
        >
          {l.label}
        </Link>
      ))}
    </aside>
  )
}
