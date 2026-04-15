import Nav from '@/components/ui/Nav'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Nav />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-white/10 py-8 text-center text-sm text-gray-500">
        <p>PH Profile Compare — civic data platform for Philippine voters.</p>
        <p className="mt-1">All data sourced from official public records. Every profile vetted by named contributors.</p>
      </footer>
    </div>
  )
}
