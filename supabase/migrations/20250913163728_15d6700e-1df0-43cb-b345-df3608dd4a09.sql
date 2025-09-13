-- Restructure candidates table to be the single source of truth
-- Add new columns for CRM functionality
ALTER TABLE public.candidates 
ADD COLUMN IF NOT EXISTS contact_details_requested_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS contact_details_available BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_interaction_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS interaction_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_candidates_user_contact_requested 
  ON public.candidates(user_id, contact_details_requested_at) 
  WHERE contact_details_requested_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_candidates_user_status 
  ON public.candidates(user_id, status);

CREATE INDEX IF NOT EXISTS idx_candidates_user_interaction 
  ON public.candidates(user_id, last_interaction_at DESC);

CREATE INDEX IF NOT EXISTS idx_candidates_tags 
  ON public.candidates USING GIN(tags);

-- Create a function to update interaction tracking
CREATE OR REPLACE FUNCTION public.update_candidate_interaction()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_interaction_at = NOW();
  NEW.interaction_count = COALESCE(OLD.interaction_count, 0) + 1;
  NEW.last_updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic interaction tracking
DROP TRIGGER IF EXISTS update_candidate_interaction_trigger ON public.candidates;
CREATE TRIGGER update_candidate_interaction_trigger
  BEFORE UPDATE ON public.candidates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_candidate_interaction();

-- Drop the candidate_details table as it's no longer needed
-- But first, check if it exists and migrate any data
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'candidate_details' AND table_schema = 'public') THEN
    -- Migrate data from candidate_details to candidates if any exists
    UPDATE public.candidates 
    SET detailed_data = COALESCE(candidates.detailed_data, '{}') || cd.detailed_data,
        last_interaction_at = GREATEST(candidates.last_updated_at, cd.updated_at)
    FROM public.candidate_details cd
    WHERE candidates.candidate_id::text = cd.candidate_id::text 
      AND candidates.user_id = cd.user_id;
    
    -- Drop the table
    DROP TABLE public.candidate_details;
  END IF;
END $$;