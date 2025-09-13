-- Add is_temporary column to project_shortlist table
ALTER TABLE public.project_shortlist 
ADD COLUMN is_temporary boolean NOT NULL DEFAULT false;