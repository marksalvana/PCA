-- ============================================================
-- Migration 015: Profile pictures for the 6 politicians added in 014
-- Run in Supabase SQL Editor AFTER migration 014.
--
-- All photo URLs sourced from Wikimedia Commons via the Wikipedia REST
-- summary API (en.wikipedia.org/api/rest_v1/page/summary/{title}).
-- These are the canonical infobox photos on each politician's Wikipedia
-- article — same source as the rest of their seeded profile data.
--
-- upload.wikimedia.org is already allowlisted in next.config.ts so
-- next/image can fetch + optimize them at render time.
--
-- Ronald Llamas has no infobox photo on Wikipedia and no other reliably
-- public-domain image was identifiable; left NULL — profile page falls
-- back to the initials avatar.
-- ============================================================

UPDATE public.politicians
SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Mark_A._Villar%2C_Senate_portrait_2025.png'
WHERE slug = 'mark-villar';

UPDATE public.politicians
SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Camille_A._Villar%2C_Senate_portrait_2025.png'
WHERE slug = 'camille-villar';

UPDATE public.politicians
SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/1/16/Ombudsman_Jesus_Crispin_Remulla_Portrait_%28cropped2%29.jpg'
WHERE slug = 'boying-remulla';

UPDATE public.politicians
SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/0/0f/DILG_Secretary_Jonvic_Remulla_%28cropped%29.jpg'
WHERE slug = 'jonvic-remulla';

UPDATE public.politicians
SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Mayor_of_Taguig_Maria_Laarni_%22Lani%22_Lopez_Cayetano.png'
WHERE slug = 'lani-cayetano';

-- Ronald Llamas: no Wikipedia infobox photo on file.
-- Leaving photo_url NULL; profile page uses initials avatar fallback.
