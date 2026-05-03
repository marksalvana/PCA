'use client'

import Link from 'next/link'
import Logo from './Logo'
import { useLanguage } from '@/components/LanguageProvider'

export default function FooterContent() {
  const { t } = useLanguage()

  return (
    <footer className="bg-[#1B2A4A] text-[#FBF5EB] py-12 mt-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">

          {/* Brand */}
          <div>
            <div className="mb-2">
              <Logo variant="light" height={32} />
            </div>
            <p className="text-[#FBF5EB]/50 text-xs label-mono">{t('footer_tagline')}</p>
          </div>

          {/* Meta */}
          <div className="text-xs text-[#FBF5EB]/45 label-mono leading-loose md:text-center">
            <p>{t('footer_sourced')}</p>
            <p>{t('footer_vetted')}</p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-x-5 gap-y-2 text-xs text-[#FBF5EB]/50 sm:flex sm:flex-wrap">
            <Link href="/profiles" className="hover:text-[#FBF5EB] transition-colors">Profiles</Link>
            <Link href="/compare" className="hover:text-[#FBF5EB] transition-colors">Compare</Link>
            <Link href="/petition" className="hover:text-[#FBF5EB] transition-colors">Request Profile</Link>
            <Link href="/vetter-apply" className="hover:text-[#FBF5EB] transition-colors">Become a Vetter</Link>
            <Link href="/forum" className="hover:text-[#FBF5EB] transition-colors">Forum</Link>
            <Link href="/about" className="hover:text-[#FBF5EB] transition-colors">About</Link>
            <Link href="/support" className="hover:text-[#FBF5EB] transition-colors">Support</Link>
          </div>

        </div>
      </div>
    </footer>
  )
}
