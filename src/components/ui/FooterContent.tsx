'use client'

import Link from 'next/link'
import { useLanguage } from '@/components/LanguageProvider'

export default function FooterContent() {
  const { t } = useLanguage()

  return (
    <footer className="border-t border-slate-200 bg-white py-10 mt-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-black text-[#0038a8] text-lg">PH<span className="text-[#fcd116]" style={{WebkitTextStroke: '1px #d97706'}}>Compare</span></span>
            <p className="text-slate-400 text-xs mt-1">{t('footer_tagline')}</p>
          </div>
          <div className="text-center text-xs text-slate-400">
            <p>{t('footer_sourced')}</p>
            <p>{t('footer_vetted')}</p>
          </div>
          <div className="flex gap-4 text-xs text-slate-400">
            <Link href="/profiles" className="hover:text-[#0038a8]">Profiles</Link>
            <Link href="/compare" className="hover:text-[#0038a8]">Compare</Link>
            <Link href="/petition" className="hover:text-[#0038a8]">Request Profile</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
