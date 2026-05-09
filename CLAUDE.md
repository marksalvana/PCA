# PH Profile Compare — Project Context for Claude Code

## What This App Is

A civic tech platform for the Philippines. Citizens struggle to evaluate political candidates objectively, leading to poor electoral outcomes. This app lets users compare politicians side-by-side using verified, sourced data — styled like a game character stat comparison (think Street Fighter vs screen, not a boring table).

The core value proposition: **every data point has a source, every profile has a named vetter, and scores are derived from official benchmarks — not opinions.**

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend + API | Next.js 15 (App Router) | Mobile-first, SSR for SEO, server actions for forms |
| Database + Auth | Supabase (PostgreSQL + RLS) | Built-in auth, row-level security enforces roles, realtime for future use |
| Styling | Tailwind CSS | Mobile-first utility classes, fast iteration |
| Hosting | Vercel | Native Next.js deployment, auto-deploy on push |
| Language | TypeScript (strict) | Long-term maintainability, catches bugs early |

The developer has a Laravel background — they understand migrations, RLS/policies, and MVC patterns. Map Next.js concepts to these where helpful.

---

## User Roles (enforced at DB level via Supabase RLS)

- **admin** — creates and edits politician profiles and all sub-records
- **vetter** — reviews draft profiles, approves/flags individual data points, cannot create
- **public** — views published profiles, submits civic trust ratings, petitions for new profiles
- **anonymous** — same as public but cannot rate; can petition with email only

Role is stored in `public.user_profiles.role`. RLS policies on every table enforce this — the database itself is the authority, not just the app.

---

## Database Tables (see schema.sql for full DDL)

| Table | Purpose |
|---|---|
| `user_profiles` | Extends Supabase auth.users, stores role + attribution data |
| `politicians` | Core profile record — slug, name, position, status, scores |
| `education_records` | Per-institution records, scored via CHED accreditation |
| `track_records` | Positions held + COA audit findings + legislative stats |
| `legal_records` | Pending cases, convictions, acquittals |
| `achievements` | Verified accomplishments with source URLs |
| `net_worth_records` | SALN-sourced annual net worth data |
| `vetting_records` | Immutable audit trail — who vetted what and when |
| `civic_trust_ratings` | Community sentiment (1–5), one per user per politician |
| `petitions` | Public requests for new profiles |
| `scoring_benchmarks` | Reference table: CHED accreditation scores, COA finding scores |

**Critical rule: every `education_records`, `track_records`, `legal_records`, `achievements`, and `net_worth_records` row REQUIRES `source_url` and `source_label`. Never make these nullable or optional in forms.**

---

## Scoring Logic

### Objective Score (0–100, computed server-side)

Stored in `politicians.objective_score`. Computed by the `compute_objective_score(politician_id)` Postgres function. Only verified records count.

- **30%** — average `institution_score` from verified education records
- **70%** — average `performance_score` from verified track records
- **Legal penalty** — -10 per pending case, -20 per conviction (clamped to 0 minimum)

### Institution Score (education)

Derived from `scoring_benchmarks` table using `ched_accreditation` value:
- Deregulated: 100 | Autonomous: 95 | Level IV: 85 | Level III: 70 | Level II: 55 | Level I: 40 | Foreign: 90 | Unaccredited: 20

### Performance Score (track record)

Derived from `coa_finding` value:
- Unqualified (clean): 100 | Qualified: 60 | Adverse: 20 | Disclaimer: 10

### Civic Trust Score (0–100, community)

Stored in `politicians.civic_trust_score`. Average of all `civic_trust_ratings.rating` values, scaled from 1–5 to 0–100. **This is kept visually separate from the objective score at all times.** Never blend these two numbers.

---

## App Structure (Next.js App Router)

```
src/
  app/
    (public)/               # Routes accessible to all
      page.tsx              # Landing/home — search + featured profiles
      profiles/
        page.tsx            # Browse all published politicians
        [slug]/
          page.tsx          # Individual profile view
      compare/
        page.tsx            # Side-by-side comparison tool
      petition/
        page.tsx            # Submit a profile request
    (auth)/
      login/page.tsx
      signup/page.tsx
    (admin)/                # Protected — admin + vetter only
      layout.tsx            # Auth guard middleware
      dashboard/page.tsx
      profiles/
        new/page.tsx        # Create new politician profile
        [id]/
          edit/page.tsx
          records/page.tsx  # Add education/track/legal/achievements
      vetting/
        page.tsx            # Vetting queue
        [id]/page.tsx       # Review a specific profile
    api/
      profiles/route.ts
      compare/route.ts
  components/
    profiles/
      ProfileCard.tsx       # Single profile stat card (game-style)
      ProfileStatBar.tsx    # Individual stat bar with score
      LegalBadge.tsx        # Red badge for pending/convicted cases
      AttributionFooter.tsx # Who created and vetted this profile
    comparison/
      CompareSelector.tsx   # Pick two politicians to compare
      CompareGrid.tsx       # Side-by-side comparison layout
      StatDuel.tsx          # Single attribute comparison row
    vetting/
      VettingQueue.tsx
      RecordReviewCard.tsx
    ui/
      ScoreBadge.tsx
      SourceLink.tsx        # Always visible — link to source URL
  lib/
    supabase/
      client.ts             # Browser client
      server.ts             # Server client (use in Server Components)
    scoring.ts              # compute scores, format for display
    utils.ts
  types/
    database.ts             # All TypeScript types matching schema
  middleware.ts             # Supabase auth session refresh
```

---

## Next.js Patterns to Follow

**Server Components by default.** Only add `'use client'` when you need interactivity (onClick, useState, useEffect). Data fetching always happens in Server Components using the server Supabase client.

```typescript
// CORRECT — Server Component data fetch
import { createClient } from '@/lib/supabase/server'

export default async function ProfilePage({ params }: { params: { slug: string } }) {
  const supabase = await createClient()
  const { data: politician } = await supabase
    .from('politicians')
    .select('*, education_records(*), track_records(*), legal_records(*)')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single()
  // render...
}
```

**Server Actions for mutations** (create/update profile records, submit petitions, submit ratings). No separate API routes for simple CRUD.

**Mobile-first Tailwind.** Write base styles for mobile, use `md:` and `lg:` prefixes to adjust for larger screens. Never write desktop-first styles.

---

## Design Principles

**Game character stat card aesthetic.** Think clean, bold, scannable. Each politician has a card with:
- Profile photo (circular, prominent)
- Name + current position
- Score bars per attribute (like HP/MP bars in RPGs)
- Color coding: green (good), amber (neutral/unknown), red (concerning)
- Legal record badges — red, prominent, cannot be hidden or minimized

**Comparison view** splits the screen into two columns (stacked on mobile, side-by-side on tablet+). Each attribute row shows both values simultaneously so the eye can scan differences instantly.

**Attribution is always visible.** Every published profile shows "Created by [name] · Vetted by [names]" at the bottom. This is non-negotiable — it's the trust mechanism.

**Civic Trust Score is always visually distinct** from the Objective Score. Use different colors, labels, and placement. Never let a reader confuse community sentiment with factual scoring.

---

## Key Business Rules (never violate these in code)

1. A profile cannot be published unless at least one vetter has approved it
2. Every sub-record (education, track, legal, achievement) must have `source_url` before saving
3. `vetting_records` is append-only — never delete or update vetting history
4. `civic_trust_ratings` is one-per-user-per-politician (enforced by DB unique constraint)
5. Legal records with status `pending` or `convicted` always display prominently — never hide or deprioritize them
6. The objective score is computed server-side only — never let the client compute or override it
7. Admins manage profiles, vetters review them. A vetter cannot create or edit profile data, only approve/flag

---

## Data Import

For MVP, politician data is imported manually via JSON files (scraped offline from government sites, Wikipedia API, etc.). The import format matches the database schema. Priority sources:

1. COMELEC official records
2. Senate / Congress of the Philippines official sites
3. COA (Commission on Audit) for track record / audit findings
4. Sandiganbayan / Supreme Court for legal records
5. Wikipedia API (not scraping — use the API)
6. SALN records for net worth

**Do not use LinkedIn** — they actively block scraping and the data is self-reported.

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=          # From Supabase Settings > API
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # From Supabase Settings > API

# Cloudflare Turnstile — bot defense for signup/login + public forms
NEXT_PUBLIC_TURNSTILE_SITE_KEY=    # From Cloudflare > Turnstile > Site key
TURNSTILE_SECRET_KEY=              # From Cloudflare > Turnstile > Secret key
                                   # Also configured in Supabase Auth > Captcha
                                   # so signup/login go through CAPTCHA.
                                   # If unset, the verifier auto-bypasses with a
                                   # console warning (dev mode).
```

---

## Current Build State

- [x] Database schema written (`schema.sql`) — needs to be run in Supabase SQL Editor
- [x] Supabase client utilities (`src/lib/supabase/client.ts`, `server.ts`)
- [x] TypeScript types (`src/types/database.ts`)
- [ ] Next.js middleware (auth session refresh)
- [ ] Folder structure scaffolded
- [ ] Profile display page
- [ ] Comparison feature
- [ ] Admin profile creation
- [ ] Vetting workflow
- [ ] Public petition form

## MVP Scope

20 high-profile Philippine politicians. Proof of concept before scaling. Quality over quantity — one wrong fact on a controversial profile kills credibility before it's built.

V2 (not now): civilian candidate profiles — non-politicians who are qualified but lack money/machinery. Essentially a civic talent discovery platform.

---

## Commands

```bash
npm run dev       # Start local dev server (Turbopack)
npm run build     # Production build
npm run lint      # ESLint check
```
