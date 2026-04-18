import Link from 'next/link'
import type { UserRole } from '@/types/database'

const links = [
  { href: '/dashboard',       label: 'Dashboard',     roles: ['admin', 'vetter', 'superadmin'] },
  { href: '/admin/profiles',  label: 'Profiles',      roles: ['admin', 'superadmin'] },
  { href: '/admin/profiles/new', label: '+ New Profile', roles: ['admin', 'superadmin'] },
  { href: '/vetting',         label: 'Vetting Queue', roles: ['vetter', 'superadmin'] },
  { href: '/profiles',        label: '← Public Site', roles: ['admin', 'vetter', 'superadmin'] },
]

const roleLabel: Record<UserRole, string> = {
  admin:      'Admin',
  vetter:     'Vetter',
  superadmin: 'Super Admin',
  public:     'Public',
}

export default function AdminNav({ role }: { role: UserRole }) {
  const visible = links.filter((l) => l.roles.includes(role))

  return (
    <aside className="w-52 shrink-0 bg-[#111827] border-r border-white/10 p-4 hidden md:flex flex-col gap-1">
      <div className="mb-4 px-2">
        <div className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-1">
          {roleLabel[role] ?? role}
        </div>
        <div className={`text-xs px-2 py-0.5 rounded-full inline-block font-semibold ${
          role === 'superadmin' ? 'bg-purple-500/20 text-purple-300' :
          role === 'admin'      ? 'bg-blue-500/20 text-blue-300' :
          'bg-amber-500/20 text-amber-300'
        }`}>
          {roleLabel[role]}
        </div>
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
