import Link from 'next/link'

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0f]/90 backdrop-blur border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-black text-white tracking-tight">
          PH<span className="text-[#fcd116]">Compare</span>
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            href="/profiles"
            className="text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-md hover:bg-white/5 transition-colors"
          >
            Profiles
          </Link>
          <Link
            href="/compare"
            className="text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-md hover:bg-white/5 transition-colors"
          >
            Compare
          </Link>
          <Link
            href="/petition"
            className="text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-md hover:bg-white/5 transition-colors hidden sm:block"
          >
            Request Profile
          </Link>
          <Link
            href="/login"
            className="ml-2 text-sm bg-white/10 hover:bg-white/20 text-white font-semibold px-3 py-1.5 rounded-md transition-colors"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  )
}
