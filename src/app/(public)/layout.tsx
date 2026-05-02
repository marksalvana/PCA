import Nav from '@/components/ui/Nav'
import { LanguageProvider } from '@/components/LanguageProvider'
import FooterContent from '@/components/ui/FooterContent'
import { LensProvider } from '@/components/lens/LensProvider'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <LensProvider>
        <div className="flex flex-col min-h-screen bg-[#FBF5EB]">
          <Nav />
          <main className="flex-1">{children}</main>
          <FooterContent />
        </div>
      </LensProvider>
    </LanguageProvider>
  )
}
