'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { translations, type Language, type TranslationKey } from '@/lib/i18n'

type LanguageContextValue = {
  lang: Language
  t: (key: TranslationKey) => string
  toggle: () => void
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  t: (key) => translations.en[key],
  toggle: () => {},
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('en')

  useEffect(() => {
    const stored = localStorage.getItem('pca_lang')
    if (stored === 'en' || stored === 'fil') setLang(stored)
  }, [])

  function toggle() {
    const next: Language = lang === 'en' ? 'fil' : 'en'
    setLang(next)
    localStorage.setItem('pca_lang', next)
  }

  function t(key: TranslationKey): string {
    return translations[lang][key]
  }

  return (
    <LanguageContext.Provider value={{ lang, t, toggle }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
