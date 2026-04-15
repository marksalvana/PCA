-- ============================================================
-- Migration 001: Political Dynasty Support
-- Run in Supabase SQL Editor
-- ============================================================

-- Add dynasty fields to politicians
ALTER TABLE public.politicians
  ADD COLUMN IF NOT EXISTS dynasty_name text,
  ADD COLUMN IF NOT EXISTS dynasty_generation integer; -- 1=patriarch, 2=child, 3=grandchild

-- Dynasty connections table (links family members in politics)
CREATE TABLE IF NOT EXISTS public.dynasty_connections (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  politician_id uuid REFERENCES public.politicians(id) ON DELETE CASCADE NOT NULL,
  related_name text NOT NULL,           -- name of the family member
  relationship text NOT NULL,           -- "Father", "Mother", "Sibling", "Spouse", "Child"
  position_held text,                   -- their political position
  in_dataset boolean NOT NULL DEFAULT false,
  related_slug text,                    -- slug if in_dataset = true
  source_url text NOT NULL,
  source_label text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS for dynasty_connections
ALTER TABLE public.dynasty_connections ENABLE ROW LEVEL SECURITY;

-- Drop policies if they already exist (makes migration safe to re-run)
DROP POLICY IF EXISTS "Public can view dynasty connections" ON public.dynasty_connections;
DROP POLICY IF EXISTS "Admins can insert dynasty connections" ON public.dynasty_connections;
DROP POLICY IF EXISTS "Admins can update dynasty connections" ON public.dynasty_connections;
DROP POLICY IF EXISTS "Staff can view all dynasty connections" ON public.dynasty_connections;

-- Anyone can read dynasty connections for published politicians
CREATE POLICY "Public can view dynasty connections"
  ON public.dynasty_connections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.politicians
      WHERE id = politician_id AND status = 'published'
    )
  );

-- Admins can manage dynasty connections
CREATE POLICY "Admins can insert dynasty connections"
  ON public.dynasty_connections FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update dynasty connections"
  ON public.dynasty_connections FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Vetters and admins can view all
CREATE POLICY "Staff can view all dynasty connections"
  ON public.dynasty_connections FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN ('admin', 'vetter'))
  );
