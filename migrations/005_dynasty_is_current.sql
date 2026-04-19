-- ============================================================
-- Add is_current to dynasty_connections
-- ============================================================
-- Run this in the Supabase SQL Editor.

ALTER TABLE public.dynasty_connections
  ADD COLUMN IF NOT EXISTS is_current boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN public.dynasty_connections.is_current IS
  'true = family member is currently holding political office; false = former officeholder only';
