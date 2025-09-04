-- Add session_id column to projects table to store chat session IDs
ALTER TABLE public.projects 
ADD COLUMN session_id TEXT DEFAULT '';

-- Add comment for documentation
COMMENT ON COLUMN public.projects.session_id IS 'Chat session ID for API continuity between requests';