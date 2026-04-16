'use client'

import { useLanguage } from '@/components/LanguageProvider'

export default function LanguageToggle() {
  const { t, toggle } = useLanguage()

  return (
    <button
      onClick={toggle}
      className="text-xs font-bold text-slate-500 hover:text-[#0038a8] border border-slate-200 hover:border-[#0038a8] px-2.5 py-1 rounded-lg transition-colors"
      aria-label="Switch language"
    >
      {t('nav_lang_toggle')}
    </button>
  )
}
