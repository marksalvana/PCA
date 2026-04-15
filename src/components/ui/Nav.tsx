import Link from 'next/link'

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-black text-[#0038a8] tracking-tight text-lg">
          PH<span className="text-[#fcd116]" style={{WebkitTextStroke: '0.5px #d97706'}}>Compare</span>
        </Link>
        <nav className="flex items-center gap-1">
          <Link href="/profiles" className="text-sm text-slate-600 hover:text-[#0038a8] px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors font-medium">
            Profiles
          </Link>
          <Link href="/compare" className="text-sm text-slate-600 hover:text-[#0038a8] px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors font-medium">
            Compare
          </Link>
          <Link href="/petition" className="text-sm text-slate-600 hover:text-[#0038a8] px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors font-medium hidden sm:block">
            Request
          </Link>
          <Link href="/login" className="ml-2 text-sm bg-[#0038a8] hover:bg-blue-800 text-white font-semibold px-4 py-1.5 rounded-lg transition-colors">
            Admin
          </Link>
        </nav>
      </div>
    </header>
  )
}
