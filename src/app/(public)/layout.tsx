import Nav from '@/components/ui/Nav'
import { LanguageProvider } from '@/components/LanguageProvider'
import FooterContent from '@/components/ui/FooterContent'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Nav />
        <main className="flex-1">{children}</main>
        <FooterContent />
      </div>
    </LanguageProvider>
  )
}
