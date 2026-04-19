import Link from 'next/link'
import LanguageToggle from './LanguageToggle'

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 bg-[#1B2A4A] text-[#FBF5EB]">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Logo — eye mark + wordmark in cream */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight" style={{ fontFamily: "'Public Sans', system-ui, sans-serif", letterSpacing: '-0.03em' }}>
          <svg viewBox="0 0 148 50" width="28" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 25 Q74 3 145 25 Q74 47 3 25 Z" stroke="#FBF5EB" strokeWidth="5" fill="none" strokeLinejoin="round"/>
            <circle cx="74" cy="25" r="11" fill="#FBF5EB"/>
            <polyline points="68,25 72,29 81,19" fill="none" stroke="#C8304B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[#FBF5EB]">Politiko</span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link href="/profiles" className="text-sm text-[#FBF5EB]/70 hover:text-[#FBF5EB] px-3 py-1.5 rounded hover:bg-white/10 transition-colors font-medium">
            Profiles
          </Link>
          <Link href="/compare" className="text-sm text-[#FBF5EB]/70 hover:text-[#FBF5EB] px-3 py-1.5 rounded hover:bg-white/10 transition-colors font-medium">
            Compare
          </Link>
          <Link href="/methodology" className="text-sm text-[#FBF5EB]/70 hover:text-[#FBF5EB] px-3 py-1.5 rounded hover:bg-white/10 transition-colors font-medium hidden sm:block">
            How It Works
          </Link>
          <Link href="/petition" className="text-sm text-[#FBF5EB]/70 hover:text-[#FBF5EB] px-3 py-1.5 rounded hover:bg-white/10 transition-colors font-medium hidden sm:block">
            Request
          </Link>
          <Link href="/forum" className="text-sm text-[#FBF5EB]/70 hover:text-[#FBF5EB] px-3 py-1.5 rounded hover:bg-white/10 transition-colors font-medium hidden sm:block">
            Forum
          </Link>
          <LanguageToggle />
          <Link href="/login" className="ml-2 text-sm bg-[#C8304B] hover:bg-[#b52840] text-white font-semibold px-4 py-1.5 rounded transition-colors">
            Admin
          </Link>
        </nav>

      </div>
    </header>
  )
}
