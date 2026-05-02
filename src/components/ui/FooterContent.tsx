'use client'

import Link from 'next/link'
import { useLanguage } from '@/components/LanguageProvider'

export default function FooterContent() {
  const { t } = useLanguage()

  return (
    <footer className="bg-[#1B2A4A] text-[#FBF5EB] py-12 mt-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <svg viewBox="0 0 148 50" width="24" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 25 Q74 3 145 25 Q74 47 3 25 Z" stroke="#FBF5EB" strokeWidth="5" fill="none" strokeLinejoin="round"/>
                <circle cx="74" cy="25" r="11" fill="#FBF5EB"/>
                <polyline points="68,25 72,29 81,19" fill="none" stroke="#C8304B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="font-bold text-lg text-[#FBF5EB]" style={{ fontFamily: "'Public Sans', system-ui, sans-serif", letterSpacing: '-0.03em' }}>Politiko</span>
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
