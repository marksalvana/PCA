-- ============================================================
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Forum posts table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.forum_posts (
  id           uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_name  text        NOT NULL CHECK (char_length(author_name) >= 2),
  content      text        NOT NULL CHECK (char_length(content) >= 10),
  category     text        NOT NULL DEFAULT 'general'
               CHECK (category IN ('suggestion', 'feedback', 'question', 'bug_report', 'general')),
  user_id      uuid        REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  is_pinned    boolean     NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "forum_posts_select" ON public.forum_posts;
DROP POLICY IF EXISTS "forum_posts_insert" ON public.forum_posts;
DROP POLICY IF EXISTS "forum_posts_delete" ON public.forum_posts;

CREATE POLICY "forum_posts_select" ON public.forum_posts
  FOR SELECT USING (true);

CREATE POLICY "forum_posts_insert" ON public.forum_posts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "forum_posts_delete" ON public.forum_posts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- 2. Civic trust score auto-update trigger
-- ============================================================
-- Automatically recalculates politicians.civic_trust_score
-- whenever a civic_trust_rating is inserted or updated.
-- Rating 1–5 is scaled to 0–100 (multiply avg by 20).

CREATE OR REPLACE FUNCTION public.update_civic_trust_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.politicians
  SET civic_trust_score = (
    SELECT ROUND(AVG(rating) * 20)
    FROM public.civic_trust_ratings
    WHERE politician_id = NEW.politician_id
  )
  WHERE id = NEW.politician_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_rating_change ON public.civic_trust_ratings;

CREATE TRIGGER on_rating_change
  AFTER INSERT OR UPDATE ON public.civic_trust_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_civic_trust_score();


-- 3. Auto-create user_profiles row when a new auth user signs up
-- ============================================================
-- Without this, the civic_trust_ratings FK (user_id → user_profiles.id)
-- fails for newly-signed-up users who haven't been manually inserted.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name, role, bio, contribution_count, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    'public',
    NULL,
    0,
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
