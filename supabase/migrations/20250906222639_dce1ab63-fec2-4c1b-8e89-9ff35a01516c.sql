-- Add project_id column to email_sequences table
ALTER TABLE public.email_sequences 
ADD COLUMN project_id UUID REFERENCES public.projects(id);

-- Add index for better performance when filtering by project
CREATE INDEX idx_email_sequences_project_id ON public.email_sequences(project_id);

-- Add index for user_id and project_id combination for efficient filtering
CREATE INDEX idx_email_sequences_user_project ON public.email_sequences(user_id, project_id);