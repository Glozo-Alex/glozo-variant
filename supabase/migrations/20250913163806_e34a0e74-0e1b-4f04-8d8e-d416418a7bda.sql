-- Add new columns for CRM functionality to candidates table
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