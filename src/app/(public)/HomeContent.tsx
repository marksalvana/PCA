'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { useLanguage } from '@/components/LanguageProvider'

type Props = {
  featuredSlot: ReactNode
  flaggedSlot: ReactNode
  profileCount: number
}

export default function HomeContent({ featuredSlot, flaggedSlot, profileCount }: Props) {
  const { t } = useLanguage()

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-[#1B2A4A] text-white">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#fcd116]" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#ce1126]" />

        <div className="max-w-5xl mx-auto px-4 py-16 md:py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest">
            {t('hero_badge')}
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-4">
            {t('hero_title_line1')} 
            <span className="text-[#C8304B]"> {t('hero_title_line2')}</span>
          </h1>
          <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            {t('hero_subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/profiles"
              className="bg-[#C8304B] hover:bg-[#b52840] text-white font-black px-8 py-3.5 rounded-xl transition-colors text-lg shadow-lg"
            >
              {t('hero_cta_profiles')}
            </Link>
            <Link
              href="/compare"
              className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold px-8 py-3.5 rounded-xl transition-colors text-lg"
            >
              {t('hero_cta_compare')}
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 mt-10">

        {/* ── Trust strip ── */}
        <div className="grid grid-cols-3 gap-4 -mt-6 mb-14">
          {[
            { num: String(profileCount), label: t('stats_profiled') },
            { num: '100%', label: t('stats_sourced') },
            { num: '✓', label: t('stats_scoring') },
          ].map((s) => (
            <div key={s.label} className="card text-center py-4 px-2 shadow-md">
              <div className="text-2xl md:text-3xl font-black text-[#1B2A4A]">{s.num}</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Featured profiles ── */}
        <section className="mb-14">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-black text-slate-900">{t('featured_title')}</h2>
              <p className="text-sm text-slate-500">{t('featured_subtitle')}</p>
            </div>
            <Link href="/profiles" className="text-sm text-[#1B2A4A] font-semibold hover:underline">
              {t('featured_view_all')}
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredSlot}
          </div>
        </section>

        {/* ── How Politiko Works ── */}
        <section className="mb-14">
          <h2 className="text-xl font-black text-slate-900 mb-5 text-center">{t('how_title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {([
              { icon: '🏛️', titleKey: 'how_sources_title', descKey: 'how_sources_desc' },
              { icon: '⚖️', titleKey: 'how_scoring_title', descKey: 'how_scoring_desc' },
              { icon: '✅', titleKey: 'how_vetters_title', descKey: 'how_vetters_desc' },
            ] as const).map((item) => (
              <div key={item.titleKey} className="card p-5">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-slate-900 mb-1.5">{t(item.titleKey)}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{t(item.descKey)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Compare CTA section ── */}
        <section className="mb-14">
          <div className="card p-6 md:p-8 bg-[#F4F2EE] flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-xl">
              <h2 className="text-xl font-black text-slate-900 mb-2">{t('compare_title')}</h2>
              <p className="text-slate-600 text-sm leading-relaxed">{t('compare_desc')}</p>
            </div>
            <Link
              href="/compare"
              className="shrink-0 bg-[#1B2A4A] hover:bg-[#243761] text-[#FBF5EB] font-bold px-6 py-3 rounded-xl transition-colors text-sm whitespace-nowrap"
            >
              {t('compare_cta')}
            </Link>
          </div>
        </section>

        {/* ── Red flags section ── */}
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-3 h-3 rounded-full bg-red-500 dynasty-badge" />
            <div>
              <h2 className="text-xl font-black text-slate-900">{t('flagged_title')}</h2>
              <p className="text-sm text-slate-500">{t('flagged_subtitle')}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {flaggedSlot}
          </div>
        </section>

        {/* ── What the Scores Mean ── */}
        <section className="mb-14 card p-6 md:p-8 bg-[#F4F2EE]">
          <h2 className="text-xl font-black text-slate-900 mb-6">{t('score_title')}</h2>
          <div className="flex flex-col gap-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#1B2A4A] flex items-center justify-center text-white font-black text-sm shrink-0">OS</div>
              <div>
                <p className="font-bold text-slate-900 mb-0.5">{t('score_os_label')}</p>
                <p className="text-sm text-slate-500">{t('score_os_desc')}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center text-white font-black text-sm shrink-0">CT</div>
              <div>
                <p className="font-bold text-slate-900 mb-0.5">{t('score_ct_label')}</p>
                <p className="text-sm text-slate-500">{t('score_ct_desc')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── About teaser ── */}
        <section className="mb-14">
          <div className="card p-6 md:p-8 border-l-4 border-[#C8304B] flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <p className="label-mono text-[#C8304B] mb-2">Our Mission</p>
              <h2 className="text-xl font-black text-[#1B2A4A] mb-2">Built by Filipinos who are tired of the cycle.</h2>
              <p className="text-[#4A4540] text-sm leading-relaxed max-w-xl">
                Politiko is maintained by a growing group of concerned citizens — tired of poverty, misinformation, and politicians who thrive on uninformed voters. No funding. No agenda. Just facts.
              </p>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <Link
                href="/about"
                className="border-2 border-[#1B2A4A] text-[#1B2A4A] hover:bg-[#1B2A4A] hover:text-[#FBF5EB] font-bold px-6 py-3 rounded-xl transition-colors text-sm whitespace-nowrap text-center"
              >
                Read Our Story →
              </Link>
              <Link
                href="/vetter-apply"
                className="bg-[#C8304B] hover:bg-[#b52840] text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm whitespace-nowrap text-center"
              >
                Apply as a Vetter →
              </Link>
            </div>
          </div>
        </section>

        {/* ── Closing CTA ── */}
        <section className="mb-14 text-center bg-[#1B2A4A] text-white rounded-2xl p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-black mb-3">{t('cta_title')}</h2>
          <p className="text-white/70 mb-8 max-w-lg mx-auto">{t('cta_subtitle')}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/compare"
              className="bg-[#C8304B] hover:bg-[#b52840] text-white font-black px-8 py-3 rounded-xl transition-colors"
            >
              {t('cta_compare')}
            </Link>
            <Link
              href="/petition"
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
            >
              {t('cta_request')}
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
