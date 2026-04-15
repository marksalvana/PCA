-- ============================================================
-- PH Profile Compare - Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- USERS (extends Supabase auth.users)
-- ============================================================
create table public.user_profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text not null,
  role text not null default 'public' check (role in ('admin', 'vetter', 'public')),
  bio text,
  contribution_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- POLITICIANS (main profile record)
-- ============================================================
create table public.politicians (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null, -- URL-friendly: "bongbong-marcos"
  full_name text not null,
  preferred_name text, -- "BBM", "Leni"
  photo_url text,
  birth_date date,
  birth_place text,
  current_position text, -- "President of the Philippines"
  party_affiliation text,
  region text, -- which region they represent
  is_incumbent boolean not null default false,
  is_candidate boolean not null default false, -- running in upcoming election
  status text not null default 'draft' check (status in ('draft', 'under_review', 'published', 'flagged')),
  objective_score numeric(5,2), -- computed score 0-100 based on benchmarks
  civic_trust_score numeric(5,2), -- community sentiment score 0-100
  created_by uuid references public.user_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- EDUCATION RECORDS
-- ============================================================
create table public.education_records (
  id uuid primary key default uuid_generate_v4(),
  politician_id uuid references public.politicians(id) on delete cascade not null,
  institution text not null,
  degree text, -- "Bachelor of Laws", "BS Economics"
  field_of_study text,
  year_started integer,
  year_ended integer,
  is_completed boolean not null default true,
  -- Objective scoring basis (CHED accreditation)
  ched_accreditation text check (ched_accreditation in (
    'level_1', 'level_2', 'level_3', 'level_4',
    'autonomous', 'deregulated', 'unaccredited', 'foreign', 'unknown'
  )),
  institution_score numeric(5,2), -- 0-100 derived from ched_accreditation
  -- Source requirement (MANDATORY)
  source_url text not null,
  source_label text not null, -- "Official University Records", "Wikipedia"
  -- Attribution
  created_by uuid references public.user_profiles(id),
  is_verified boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- TRACK RECORD (positions held, COA findings)
-- ============================================================
create table public.track_records (
  id uuid primary key default uuid_generate_v4(),
  politician_id uuid references public.politicians(id) on delete cascade not null,
  position text not null, -- "Senator", "Governor of Ilocos Norte"
  start_date date,
  end_date date, -- null if current
  is_current boolean not null default false,
  -- COA audit findings (where applicable)
  coa_finding text check (coa_finding in (
    'unqualified', -- clean opinion (best)
    'qualified',
    'adverse',
    'disclaimer', -- worst
    'not_applicable',
    'unknown'
  )),
  -- Legislative performance (for legislators)
  attendance_rate numeric(5,2), -- percentage 0-100
  bills_authored integer,
  bills_passed integer,
  -- COA/performance score derived from above
  performance_score numeric(5,2), -- 0-100
  notes text,
  -- Source requirement (MANDATORY)
  source_url text not null,
  source_label text not null,
  -- Attribution
  created_by uuid references public.user_profiles(id),
  is_verified boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- LEGAL RECORDS (pending cases, convictions)
-- ============================================================
create table public.legal_records (
  id uuid primary key default uuid_generate_v4(),
  politician_id uuid references public.politicians(id) on delete cascade not null,
  case_title text not null,
  case_type text not null check (case_type in (
    'criminal', 'civil', 'administrative', 'electoral'
  )),
  status text not null check (status in (
    'pending', 'convicted', 'acquitted', 'dismissed', 'ongoing_appeal'
  )),
  court text, -- "Sandiganbayan", "Supreme Court"
  charge text, -- "Plunder", "Graft and Corruption"
  filing_date date,
  resolution_date date,
  resolution_summary text,
  -- Source requirement (MANDATORY)
  source_url text not null,
  source_label text not null,
  -- Attribution
  created_by uuid references public.user_profiles(id),
  is_verified boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ACHIEVEMENTS
-- ============================================================
create table public.achievements (
  id uuid primary key default uuid_generate_v4(),
  politician_id uuid references public.politicians(id) on delete cascade not null,
  title text not null, -- "Authored the Universal Health Care Act"
  description text,
  category text check (category in (
    'legislation', 'infrastructure', 'social_program',
    'award', 'international', 'economic', 'other'
  )),
  year integer,
  impact_scope text check (impact_scope in (
    'national', 'regional', 'local'
  )),
  -- Source requirement (MANDATORY)
  source_url text not null,
  source_label text not null,
  -- Attribution
  created_by uuid references public.user_profiles(id),
  is_verified boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- NET WORTH (SALN data)
-- ============================================================
create table public.net_worth_records (
  id uuid primary key default uuid_generate_v4(),
  politician_id uuid references public.politicians(id) on delete cascade not null,
  year integer not null,
  declared_net_worth numeric(20,2), -- in PHP
  assets numeric(20,2),
  liabilities numeric(20,2),
  source_url text not null, -- SALN source
  source_label text not null,
  created_by uuid references public.user_profiles(id),
  is_verified boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- VETTING RECORDS (audit trail)
-- ============================================================
create table public.vetting_records (
  id uuid primary key default uuid_generate_v4(),
  politician_id uuid references public.politicians(id) on delete cascade not null,
  vetter_id uuid references public.user_profiles(id) not null,
  action text not null check (action in ('approved', 'flagged', 'rejected', 'requested_correction')),
  notes text,
  -- Which specific record was vetted (all nullable — profile-level if all null)
  education_record_id uuid references public.education_records(id),
  track_record_id uuid references public.track_records(id),
  legal_record_id uuid references public.legal_records(id),
  achievement_id uuid references public.achievements(id),
  vetted_at timestamptz not null default now()
);

-- ============================================================
-- CIVIC TRUST RATINGS (community sentiment — separate from objective score)
-- ============================================================
create table public.civic_trust_ratings (
  id uuid primary key default uuid_generate_v4(),
  politician_id uuid references public.politicians(id) on delete cascade not null,
  user_id uuid references public.user_profiles(id) not null,
  rating integer not null check (rating between 1 and 5),
  created_at timestamptz not null default now(),
  -- One rating per user per politician
  unique(politician_id, user_id)
);

-- ============================================================
-- PETITIONS (public requests for profiles)
-- ============================================================
create table public.petitions (
  id uuid primary key default uuid_generate_v4(),
  politician_name text not null,
  current_position text,
  reason text,
  requested_by uuid references public.user_profiles(id), -- null if anonymous
  requester_email text, -- for anonymous requesters
  status text not null default 'pending' check (status in (
    'pending', 'accepted', 'rejected', 'already_exists'
  )),
  admin_notes text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

-- ============================================================
-- SCORING BENCHMARKS (reference table for objective scoring)
-- ============================================================
create table public.scoring_benchmarks (
  id uuid primary key default uuid_generate_v4(),
  category text not null, -- 'education_ched', 'coa_finding'
  key text not null,       -- 'autonomous', 'unqualified'
  score numeric(5,2) not null, -- 0-100
  label text not null,     -- human-readable label
  description text,
  unique(category, key)
);

-- Seed CHED accreditation scores
insert into public.scoring_benchmarks (category, key, score, label, description) values
  ('education_ched', 'deregulated', 100, 'Deregulated', 'Highest CHED status'),
  ('education_ched', 'autonomous', 95, 'Autonomous', 'Near-highest CHED status'),
  ('education_ched', 'level_4', 85, 'Level IV', 'Level IV CHED accreditation'),
  ('education_ched', 'level_3', 70, 'Level III', 'Level III CHED accreditation'),
  ('education_ched', 'level_2', 55, 'Level II', 'Level II CHED accreditation'),
  ('education_ched', 'level_1', 40, 'Level I', 'Level I CHED accreditation'),
  ('education_ched', 'unaccredited', 20, 'Unaccredited', 'No CHED accreditation'),
  ('education_ched', 'foreign', 90, 'Foreign Institution', 'Recognized foreign university'),
  ('education_ched', 'unknown', 30, 'Unknown', 'Accreditation status unverified');

-- Seed COA finding scores
insert into public.scoring_benchmarks (category, key, score, label, description) values
  ('coa_finding', 'unqualified', 100, 'Unqualified (Clean)', 'Clean COA opinion — no material misstatements'),
  ('coa_finding', 'qualified', 60, 'Qualified', 'Some issues found but not pervasive'),
  ('coa_finding', 'adverse', 20, 'Adverse', 'Material misstatements found'),
  ('coa_finding', 'disclaimer', 10, 'Disclaimer', 'Auditors unable to obtain evidence'),
  ('coa_finding', 'not_applicable', 50, 'Not Applicable', 'No COA audit relevant to this role'),
  ('coa_finding', 'unknown', 30, 'Unknown', 'COA data not found');

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table public.user_profiles enable row level security;
alter table public.politicians enable row level security;
alter table public.education_records enable row level security;
alter table public.track_records enable row level security;
alter table public.legal_records enable row level security;
alter table public.achievements enable row level security;
alter table public.net_worth_records enable row level security;
alter table public.vetting_records enable row level security;
alter table public.civic_trust_ratings enable row level security;
alter table public.petitions enable row level security;
alter table public.scoring_benchmarks enable row level security;

-- Public can read published politicians
create policy "Public can view published politicians"
  on public.politicians for select
  using (status = 'published');

-- Admins and vetters can view all politicians
create policy "Admins and vetters can view all politicians"
  on public.politicians for select
  using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid()
      and role in ('admin', 'vetter')
    )
  );

-- Only admins can insert/update politicians
create policy "Admins can insert politicians"
  on public.politicians for insert
  with check (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update politicians"
  on public.politicians for update
  using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Public can read education/track/legal/achievements for published politicians
create policy "Public can view education of published politicians"
  on public.education_records for select
  using (
    exists (
      select 1 from public.politicians
      where id = politician_id and status = 'published'
    )
  );

create policy "Public can view track records of published politicians"
  on public.track_records for select
  using (
    exists (
      select 1 from public.politicians
      where id = politician_id and status = 'published'
    )
  );

create policy "Public can view legal records of published politicians"
  on public.legal_records for select
  using (
    exists (
      select 1 from public.politicians
      where id = politician_id and status = 'published'
    )
  );

create policy "Public can view achievements of published politicians"
  on public.achievements for select
  using (
    exists (
      select 1 from public.politicians
      where id = politician_id and status = 'published'
    )
  );

create policy "Public can view net worth of published politicians"
  on public.net_worth_records for select
  using (
    exists (
      select 1 from public.politicians
      where id = politician_id and status = 'published'
    )
  );

-- Admins can insert/update all records
create policy "Admins can insert education records"
  on public.education_records for insert
  with check (
    exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update education records"
  on public.education_records for update
  using (
    exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can insert track records"
  on public.track_records for insert
  with check (
    exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can insert legal records"
  on public.legal_records for insert
  with check (
    exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can insert achievements"
  on public.achievements for insert
  with check (
    exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can insert net worth records"
  on public.net_worth_records for insert
  with check (
    exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
  );

-- Vetters can view all records (including drafts)
create policy "Vetters can view all education records"
  on public.education_records for select
  using (
    exists (select 1 from public.user_profiles where id = auth.uid() and role in ('admin', 'vetter'))
  );

create policy "Vetters can view all track records"
  on public.track_records for select
  using (
    exists (select 1 from public.user_profiles where id = auth.uid() and role in ('admin', 'vetter'))
  );

create policy "Vetters can view all legal records"
  on public.legal_records for select
  using (
    exists (select 1 from public.user_profiles where id = auth.uid() and role in ('admin', 'vetter'))
  );

create policy "Vetters can view all achievements"
  on public.achievements for select
  using (
    exists (select 1 from public.user_profiles where id = auth.uid() and role in ('admin', 'vetter'))
  );

-- Vetters can update verification status
create policy "Vetters can verify education records"
  on public.education_records for update
  using (
    exists (select 1 from public.user_profiles where id = auth.uid() and role in ('admin', 'vetter'))
  );

create policy "Vetters can verify track records"
  on public.track_records for update
  using (
    exists (select 1 from public.user_profiles where id = auth.uid() and role in ('admin', 'vetter'))
  );

create policy "Vetters can verify legal records"
  on public.legal_records for update
  using (
    exists (select 1 from public.user_profiles where id = auth.uid() and role in ('admin', 'vetter'))
  );

create policy "Vetters can verify achievements"
  on public.achievements for update
  using (
    exists (select 1 from public.user_profiles where id = auth.uid() and role in ('admin', 'vetter'))
  );

-- Vetting records: vetters can insert, all staff can view
create policy "Vetters can insert vetting records"
  on public.vetting_records for insert
  with check (
    exists (select 1 from public.user_profiles where id = auth.uid() and role in ('admin', 'vetter'))
  );

create policy "Staff can view vetting records"
  on public.vetting_records for select
  using (
    exists (select 1 from public.user_profiles where id = auth.uid() and role in ('admin', 'vetter'))
  );

-- Public vetting records visible for published politicians (transparency)
create policy "Public can see vetting attribution for published politicians"
  on public.vetting_records for select
  using (
    exists (
      select 1 from public.politicians
      where id = politician_id and status = 'published'
    )
  );

-- Civic trust ratings: authenticated users can rate, all can view
create policy "Authenticated users can rate"
  on public.civic_trust_ratings for insert
  with check (auth.uid() is not null);

create policy "Users can update their own rating"
  on public.civic_trust_ratings for update
  using (user_id = auth.uid());

create policy "Anyone can view civic trust ratings"
  on public.civic_trust_ratings for select
  using (true);

-- Petitions: anyone can insert, admins can manage
create policy "Anyone can submit a petition"
  on public.petitions for insert
  with check (true);

create policy "Admins can view and update petitions"
  on public.petitions for select
  using (
    exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update petitions"
  on public.petitions for update
  using (
    exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
  );

-- Scoring benchmarks are public read
create policy "Anyone can read scoring benchmarks"
  on public.scoring_benchmarks for select
  using (true);

-- User profiles: users can view all (for attribution), only update their own
create policy "Anyone can view user profiles"
  on public.user_profiles for select
  using (true);

create policy "Users can update their own profile"
  on public.user_profiles for update
  using (id = auth.uid());

-- ============================================================
-- AUTO-CREATE USER PROFILE ON SIGNUP
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, display_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    'public'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- HELPER FUNCTION: compute objective score for a politician
-- (call this after adding/verifying records)
-- ============================================================
create or replace function public.compute_objective_score(p_politician_id uuid)
returns numeric as $$
declare
  edu_score numeric := 0;
  track_score numeric := 0;
  legal_penalty numeric := 0;
  final_score numeric;
begin
  -- Average education score (from verified records only)
  select coalesce(avg(institution_score), 50)
  into edu_score
  from public.education_records
  where politician_id = p_politician_id and is_verified = true;

  -- Average track record performance score (verified only)
  select coalesce(avg(performance_score), 50)
  into track_score
  from public.track_records
  where politician_id = p_politician_id and is_verified = true;

  -- Legal penalty: -10 per pending case, -20 per conviction
  select coalesce(
    sum(case
      when status = 'pending' then -10
      when status = 'convicted' then -20
      else 0
    end), 0)
  into legal_penalty
  from public.legal_records
  where politician_id = p_politician_id and is_verified = true;

  -- Weighted average: 30% education, 70% track record, then apply legal penalty
  final_score := (edu_score * 0.3) + (track_score * 0.7) + legal_penalty;

  -- Clamp to 0-100
  final_score := greatest(0, least(100, final_score));

  -- Update the politician record
  update public.politicians
  set objective_score = final_score, updated_at = now()
  where id = p_politician_id;

  return final_score;
end;
$$ language plpgsql security definer;
