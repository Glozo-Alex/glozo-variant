-- Update edge function to handle session-based searches
-- Make project_id nullable for temporary searches
ALTER TABLE searches ALTER COLUMN project_id DROP NOT NULL;