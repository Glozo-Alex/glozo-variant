-- Add is_temporary field to projects table
ALTER TABLE public.projects 
ADD COLUMN is_temporary boolean NOT NULL DEFAULT false;

-- Create index for efficient cleanup of temporary projects
CREATE INDEX idx_projects_is_temporary_created_at 
ON public.projects (is_temporary, created_at) 
WHERE is_temporary = true;