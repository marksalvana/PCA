'use client'

import Link from 'next/link'
import { useLanguage } from '@/components/LanguageProvider'

export default function FooterContent() {
  const { t } = useLanguage()

  return (
    <footer className="bg-[#1B2A4A] text-[#FBF5EB] py-12 mt-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">

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
          <div className="text-center text-xs text-[#FBF5EB]/45 label-mono leading-loose">
            <p>{t('footer_sourced')}</p>
            <p>{t('footer_vetted')}</p>
          </div>

          {/* Links */}
          <div className="flex gap-5 text-xs text-[#FBF5EB]/50">
            <Link href="/profiles" className="hover:text-[#FBF5EB] transition-colors">Profiles</Link>
            <Link href="/compare" className="hover:text-[#FBF5EB] transition-colors">Compare</Link>
            <Link href="/petition" className="hover:text-[#FBF5EB] transition-colors">Request Profile</Link>
            <Link href="/forum" className="hover:text-[#FBF5EB] transition-colors">Forum</Link>
          </div>

        </div>

        <div className="mt-8 pt-6 border-t border-white/10 text-[#FBF5EB]/30 text-xs label-mono">
          Public Sans · Space Grotesk · DM Mono · #1B2A4A · #FBF5EB · #C8304B
        </div>
      </div>
    </footer>
  )
}
