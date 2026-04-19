import Link from 'next/link'
import LanguageToggle from './LanguageToggle'

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E8E4DC]">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/politiko-logo.svg" alt="Politiko" className="h-8 w-auto" />
        </Link>

        <nav className="flex items-center gap-1">
          <Link href="/profiles" className="text-sm text-[#4A4540] hover:text-[#1B2A4A] px-3 py-1.5 rounded hover:bg-[#F4F2EE] transition-colors font-medium">
            Profiles
          </Link>
          <Link href="/compare" className="text-sm text-[#4A4540] hover:text-[#1B2A4A] px-3 py-1.5 rounded hover:bg-[#F4F2EE] transition-colors font-medium">
            Compare
          </Link>
          <Link href="/methodology" className="text-sm text-[#4A4540] hover:text-[#1B2A4A] px-3 py-1.5 rounded hover:bg-[#F4F2EE] transition-colors font-medium hidden sm:block">
            How It Works
          </Link>
          <Link href="/petition" className="text-sm text-[#4A4540] hover:text-[#1B2A4A] px-3 py-1.5 rounded hover:bg-[#F4F2EE] transition-colors font-medium hidden sm:block">
            Request
          </Link>
          <Link href="/forum" className="text-sm text-[#4A4540] hover:text-[#1B2A4A] px-3 py-1.5 rounded hover:bg-[#F4F2EE] transition-colors font-medium hidden sm:block">
            Forum
          </Link>
          <LanguageToggle />
          <Link href="/login" className="ml-2 text-sm bg-[#1B2A4A] hover:bg-[#243761] text-white font-semibold px-4 py-1.5 rounded transition-colors">
            Admin
          </Link>
        </nav>

      </div>
    </header>
  )
}
