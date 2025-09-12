-- Create unified candidates table for centralized storage
CREATE TABLE public.candidates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  candidate_id TEXT NOT NULL, -- External candidate ID from search API
  basic_data JSONB NOT NULL DEFAULT '{}',
  detailed_data JSONB DEFAULT '{}',
  first_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data_completeness_score INTEGER DEFAULT 0,
  has_detailed_contacts BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, candidate_id)
);

-- Enable RLS for candidates table
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for candidates
CREATE POLICY "Users can view their own candidates" 
ON public.candidates 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own candidates" 
ON public.candidates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own candidates" 
ON public.candidates 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own candidates" 
ON public.candidates 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create candidate relationships table for tracking connections
CREATE TABLE public.candidate_relationships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  candidate_uuid UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL, -- 'project_shortlist', 'sequence_active', 'sequence_completed', 'contact_revealed'
  related_object_id UUID NOT NULL,
  related_object_data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(candidate_uuid, relationship_type, related_object_id)
);

-- Enable RLS for candidate_relationships table
ALTER TABLE public.candidate_relationships ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for candidate_relationships
CREATE POLICY "Users can view their own candidate relationships" 
ON public.candidate_relationships 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own candidate relationships" 
ON public.candidate_relationships 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own candidate relationships" 
ON public.candidate_relationships 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own candidate relationships" 
ON public.candidate_relationships 
FOR DELETE 
USING (auth.uid() = user_id);

-- Migrate existing data from project_shortlist to candidates
INSERT INTO public.candidates (user_id, candidate_id, basic_data, first_seen_at, last_updated_at)
SELECT DISTINCT 
  user_id, 
  candidate_id, 
  candidate_snapshot,
  added_at,
  added_at
FROM public.project_shortlist
ON CONFLICT (user_id, candidate_id) DO UPDATE SET
  basic_data = EXCLUDED.basic_data,
  last_updated_at = EXCLUDED.last_updated_at;

-- Create relationships for existing shortlist entries
INSERT INTO public.candidate_relationships (user_id, candidate_uuid, relationship_type, related_object_id, related_object_data, created_at)
SELECT 
  ps.user_id,
  c.id,
  'project_shortlist',
  ps.project_id,
  jsonb_build_object(
    'project_name', p.name,
    'added_at', ps.added_at
  ),
  ps.added_at
FROM public.project_shortlist ps
JOIN public.candidates c ON c.user_id = ps.user_id AND c.candidate_id = ps.candidate_id
LEFT JOIN public.projects p ON p.id = ps.project_id;

-- Merge detailed data from candidate_details into candidates
UPDATE public.candidates 
SET 
  detailed_data = cd.detailed_data,
  has_detailed_contacts = TRUE,
  data_completeness_score = 100,
  last_updated_at = cd.updated_at
FROM public.candidate_details cd
WHERE candidates.user_id = cd.user_id 
  AND candidates.candidate_id = cd.candidate_id::text;

-- Create relationships for contact reveals
INSERT INTO public.candidate_relationships (user_id, candidate_uuid, relationship_type, related_object_id, related_object_data, created_at)
SELECT 
  cd.user_id,
  c.id,
  'contact_revealed',
  cd.project_id,
  jsonb_build_object(
    'revealed_at', cd.created_at,
    'project_id', cd.project_id
  ),
  cd.created_at
FROM public.candidate_details cd
JOIN public.candidates c ON c.user_id = cd.user_id AND c.candidate_id = cd.candidate_id::text
ON CONFLICT (candidate_uuid, relationship_type, related_object_id) DO NOTHING;

-- Create relationships for sequence recipients
INSERT INTO public.candidate_relationships (user_id, candidate_uuid, relationship_type, related_object_id, related_object_data, created_at, status)
SELECT 
  sr.user_id,
  c.id,
  CASE 
    WHEN sr.status = 'active' THEN 'sequence_active'
    WHEN sr.status = 'completed' THEN 'sequence_completed'
    ELSE 'sequence_' || sr.status
  END,
  sr.sequence_id,
  jsonb_build_object(
    'enrolled_at', sr.enrolled_at,
    'current_template_index', sr.current_template_index,
    'next_send_at', sr.next_send_at,
    'completed_at', sr.completed_at
  ),
  sr.enrolled_at,
  sr.status
FROM public.sequence_recipients sr
JOIN public.candidates c ON c.user_id = sr.user_id AND c.candidate_id = sr.candidate_id
ON CONFLICT (candidate_uuid, relationship_type, related_object_id) DO NOTHING;

-- Add candidate_uuid column to project_shortlist (keep for backwards compatibility temporarily)
ALTER TABLE public.project_shortlist ADD COLUMN candidate_uuid UUID REFERENCES public.candidates(id);

-- Update candidate_uuid references
UPDATE public.project_shortlist ps
SET candidate_uuid = c.id
FROM public.candidates c
WHERE c.user_id = ps.user_id AND c.candidate_id = ps.candidate_id;

-- Add candidate_uuid column to sequence_recipients
ALTER TABLE public.sequence_recipients ADD COLUMN candidate_uuid UUID REFERENCES public.candidates(id);

-- Update candidate_uuid references for sequence_recipients
UPDATE public.sequence_recipients sr
SET candidate_uuid = c.id
FROM public.candidates c
WHERE c.user_id = sr.user_id AND c.candidate_id = sr.candidate_id;

-- Create triggers to automatically maintain candidate relationships

-- Function to upsert candidate and create relationship
CREATE OR REPLACE FUNCTION public.upsert_candidate_and_relationship()
RETURNS TRIGGER AS $$
DECLARE
  candidate_uuid UUID;
BEGIN
  -- For project_shortlist inserts, upsert candidate and create relationship
  IF TG_TABLE_NAME = 'project_shortlist' THEN
    -- Upsert candidate
    INSERT INTO public.candidates (user_id, candidate_id, basic_data, first_seen_at, last_updated_at)
    VALUES (NEW.user_id, NEW.candidate_id, NEW.candidate_snapshot, NEW.added_at, NEW.added_at)
    ON CONFLICT (user_id, candidate_id) DO UPDATE SET
      basic_data = EXCLUDED.basic_data,
      last_updated_at = EXCLUDED.last_updated_at
    RETURNING id INTO candidate_uuid;
    
    -- Update candidate_uuid in the shortlist record
    NEW.candidate_uuid = candidate_uuid;
    
    -- Create relationship
    INSERT INTO public.candidate_relationships (user_id, candidate_uuid, relationship_type, related_object_id, related_object_data, created_at)
    VALUES (
      NEW.user_id,
      candidate_uuid,
      'project_shortlist',
      NEW.project_id,
      jsonb_build_object('added_at', NEW.added_at),
      NEW.added_at
    )
    ON CONFLICT (candidate_uuid, relationship_type, related_object_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for project_shortlist
CREATE TRIGGER upsert_candidate_shortlist_trigger
  BEFORE INSERT ON public.project_shortlist
  FOR EACH ROW
  EXECUTE FUNCTION public.upsert_candidate_and_relationship();

-- Function to handle relationship cleanup on delete
CREATE OR REPLACE FUNCTION public.cleanup_candidate_relationship()
RETURNS TRIGGER AS $$
BEGIN
  -- Remove relationship when shortlist entry is deleted
  IF TG_TABLE_NAME = 'project_shortlist' THEN
    UPDATE public.candidate_relationships 
    SET ended_at = now(), status = 'ended'
    WHERE candidate_uuid = OLD.candidate_uuid 
      AND relationship_type = 'project_shortlist'
      AND related_object_id = OLD.project_id;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for cleanup
CREATE TRIGGER cleanup_candidate_shortlist_trigger
  AFTER DELETE ON public.project_shortlist
  FOR EACH ROW
  EXECUTE FUNCTION public.cleanup_candidate_relationship();

-- Create indexes for performance
CREATE INDEX idx_candidates_user_id ON public.candidates(user_id);
CREATE INDEX idx_candidates_candidate_id ON public.candidates(candidate_id);
CREATE INDEX idx_candidates_last_updated ON public.candidates(last_updated_at DESC);
CREATE INDEX idx_candidate_relationships_candidate_uuid ON public.candidate_relationships(candidate_uuid);
CREATE INDEX idx_candidate_relationships_type ON public.candidate_relationships(relationship_type);
CREATE INDEX idx_candidate_relationships_status ON public.candidate_relationships(status);

-- Create function to update updated_at timestamp
CREATE TRIGGER update_candidates_updated_at
  BEFORE UPDATE ON public.candidates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();