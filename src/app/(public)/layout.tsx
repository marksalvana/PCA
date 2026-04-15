import Nav from '@/components/ui/Nav'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Nav />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-slate-200 bg-white py-10 mt-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <span className="font-black text-[#0038a8] text-lg">PH<span className="text-[#fcd116]" style={{WebkitTextStroke: '1px #d97706'}}>Compare</span></span>
              <p className="text-slate-400 text-xs mt-1">Civic data platform for Philippine voters.</p>
            </div>
            <div className="text-center text-xs text-slate-400">
              <p>All data sourced from official public records.</p>
              <p>Every profile vetted by named contributors.</p>
            </div>
            <div className="flex gap-4 text-xs text-slate-400">
              <a href="/profiles" className="hover:text-[#0038a8]">Profiles</a>
              <a href="/compare" className="hover:text-[#0038a8]">Compare</a>
              <a href="/petition" className="hover:text-[#0038a8]">Request Profile</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
