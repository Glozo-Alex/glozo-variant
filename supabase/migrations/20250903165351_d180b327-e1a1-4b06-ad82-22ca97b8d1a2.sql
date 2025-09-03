
-- Add a column to store the full API JSON response for each search
ALTER TABLE public.searches
  ADD COLUMN IF NOT EXISTS raw_response jsonb NULL;
