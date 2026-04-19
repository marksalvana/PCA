-- ============================================================
-- VETTER APPLICATIONS
-- ============================================================
-- Run this in the Supabase SQL Editor.

create table if not exists public.vetter_applications (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  email text not null,
  background text not null,          -- 'researcher' | 'journalist' | 'educator' | 'fact_checker' | 'legal' | 'government' | 'other'
  motivation text not null,          -- why they want to be a vetter
  profile_url text,                  -- optional LinkedIn / professional URL
  public_display_consent boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  admin_notes text,
  created_at timestamptz not null default now()
);

-- Row-level security
alter table public.vetter_applications enable row level security;

-- Anyone (including anonymous) can submit an application
create policy "Anyone can submit a vetter application"
  on public.vetter_applications for insert
  with check (true);

-- Admins and superadmins can read all applications
create policy "Admins can view vetter applications"
  on public.vetter_applications for select
  using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and role in ('admin', 'superadmin')
    )
  );

-- Admins and superadmins can update status / add notes
create policy "Admins can update vetter applications"
  on public.vetter_applications for update
  using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and role in ('admin', 'superadmin')
    )
  );
