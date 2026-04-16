export type Language = 'en' | 'fil'

export const translations = {
  en: {
    // Nav
    nav_profiles: 'Profiles',
    nav_compare: 'Compare',
    nav_how_it_works: 'How It Works',
    nav_request: 'Request',
    nav_lang_toggle: 'Filipino',

    // Hero
    hero_badge: '🇵🇭 For Filipino Voters',
    hero_title_line1: "Who are you",
    hero_title_line2: "really voting for?",
    hero_subtitle: "Compare politicians using real data from official records — not rumors, not propaganda.",
    hero_cta_profiles: 'Browse Profiles →',
    hero_cta_compare: 'Compare Two',

    // Stats
    stats_profiled: 'Politicians Profiled',
    stats_sourced: 'Sourced Data',
    stats_opinions: 'Opinions',

    // Featured section
    featured_title: 'Featured Profiles',
    featured_subtitle: 'Ranked by objective score',
    featured_view_all: 'View all →',

    // Red flags section
    flagged_title: 'Lowest Objective Scores',
    flagged_subtitle: 'Based on verified records, legal penalties applied',

    // How it works
    how_title: 'How does it work?',
    how_sources_title: 'Official Sources Only',
    how_sources_desc: 'COMELEC, COA, Senate, Congress, Sandiganbayan. Every data point links back to the source.',
    how_scoring_title: 'Objective Scoring',
    how_scoring_desc: "Scores are computed from CHED accreditation levels and COA audit findings — not our opinion.",
    how_vetters_title: 'Named Vetters',
    how_vetters_desc: 'Every profile is reviewed by named contributors. The audit trail is public and permanent.',

    // Score explainer
    score_title: 'What do the scores mean?',
    score_subtitle: 'Two scores are shown — never mix them up.',
    score_os_label: 'Objective Score (0–∞)',
    score_os_desc: 'Computed from CHED accreditation (education) + COA audit findings (performance). Legal cases deduct points.',
    score_os_tag: 'This is fact-based.',
    score_ct_label: 'Community Trust (0–100)',
    score_ct_desc: 'Average of verified citizen ratings (1–5 stars). Reflects public sentiment.',
    score_ct_tag: 'This is opinion — shown separately.',

    // CTA
    cta_title: "Don't know who you're voting for?",
    cta_subtitle: "Don't vote for the name. Vote for the record.",
    cta_compare: 'Compare now →',
    cta_request: 'Request a Profile',

    // Footer
    footer_tagline: 'Civic data platform for Philippine voters.',
    footer_sourced: 'All data sourced from official public records.',
    footer_vetted: 'Every profile vetted by named contributors.',

    // Profiles page
    profiles_title: 'All Profiles',
    profiles_sourced_suffix: '— sourced from official records',
    profiles_empty: 'No published profiles yet.',

    // Profile card
    card_incumbent: 'Incumbent',
    card_candidate: 'Candidate',
    card_objective_score: 'Objective Score',
    card_community_trust: 'Community Trust',
    card_rate: 'Rate this politician →',
    card_no_data: 'Insufficient verified data',
    card_legal_flag: 'Legal Case',
  },

  fil: {
    // Nav
    nav_profiles: 'Mga Profile',
    nav_compare: 'Ihambing',
    nav_how_it_works: 'Paano Gumagana',
    nav_request: 'Humiling',
    nav_lang_toggle: 'English',

    // Hero
    hero_badge: '🇵🇭 Para sa mga Pilipinong Botante',
    hero_title_line1: "Sino talaga ang",
    hero_title_line2: "iboboto mo?",
    hero_subtitle: "Ihambing ang mga pulitiko gamit ang totoong datos mula sa opisyal na rekord — hindi tsismis, hindi propaganda.",
    hero_cta_profiles: 'Tingnan ang mga Profile →',
    hero_cta_compare: 'Ikumpara ang Dalawa',

    // Stats
    stats_profiled: 'Pulitikong Naka-profile',
    stats_sourced: 'Datos mula sa Rekord',
    stats_opinions: 'Opinyon',

    // Featured section
    featured_title: 'Mga Tampok na Profile',
    featured_subtitle: 'Nakahanay ayon sa objective score',
    featured_view_all: 'Tingnan lahat →',

    // Red flags section
    flagged_title: 'Pinakamababang Objective Score',
    flagged_subtitle: 'Batay sa mga verified na rekord, kasama ang legal na parusa',

    // How it works
    how_title: 'Paano gumagana ito?',
    how_sources_title: 'Opisyal na Pinagkukunan Lamang',
    how_sources_desc: 'COMELEC, COA, Senado, Kongreso, Sandiganbayan. Bawat datos ay may link sa pinagmulan.',
    how_scoring_title: 'Layuning Pagmamarka',
    how_scoring_desc: "Ang mga marka ay kinukuha mula sa CHED accreditation at COA audit — hindi opinyon.",
    how_vetters_title: 'Mga Pinangalanang Tagasuri',
    how_vetters_desc: 'Bawat profile ay sinuri ng mga pinangalanang kontribyutor. Ang audit trail ay pampubliko at permanente.',

    // Score explainer
    score_title: 'Ano ang ibig sabihin ng Score?',
    score_subtitle: 'Dalawang score ang ipinapakita — huwag pagsamahin ang dalawa.',
    score_os_label: 'Objective Score (0–∞)',
    score_os_desc: 'Kinukuha mula sa CHED accreditation (edukasyon) + COA audit (performance). Ang mga legal na kaso ay nagbabawas ng puntos.',
    score_os_tag: 'Ito ay batay sa katotohanan.',
    score_ct_label: 'Tiwala ng Komunidad (0–100)',
    score_ct_desc: 'Average ng mga verified na rating ng mamamayan (1–5 bituin). Sumasalamin sa pananaw ng publiko.',
    score_ct_tag: 'Ito ay opinyon — ipinapakita nang hiwalay.',

    // CTA
    cta_title: "Hindi mo kilala ang iboboto mo?",
    cta_subtitle: "Huwag botuhin ang pangalan. Botuhin ang rekord.",
    cta_compare: 'Ikumpara ngayon →',
    cta_request: 'Humiling ng Profile',

    // Footer
    footer_tagline: 'Plataporma ng datos sibiko para sa mga botanteng Pilipino.',
    footer_sourced: 'Lahat ng datos mula sa opisyal na pampublikong rekord.',
    footer_vetted: 'Bawat profile ay sinuri ng mga pinangalanang kontribyutor.',

    // Profiles page
    profiles_title: 'Lahat ng Profile',
    profiles_sourced_suffix: '— mula sa opisyal na rekord',
    profiles_empty: 'Wala pang naka-publish na profile.',

    // Profile card
    card_incumbent: 'Kasalukuyang Opisyal',
    card_candidate: 'Kandidato',
    card_objective_score: 'Objective Score',
    card_community_trust: 'Tiwala ng Komunidad',
    card_rate: 'I-rate ang pulitikong ito →',
    card_no_data: 'Kulang ang verified na datos',
    card_legal_flag: 'May Kaso',
  },
} as const

export type TranslationKey = keyof typeof translations.en
