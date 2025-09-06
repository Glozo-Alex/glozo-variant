-- Add foreign key constraints to establish proper relationships
ALTER TABLE public.global_template_emails 
ADD CONSTRAINT fk_global_template_emails_global_template_id 
FOREIGN KEY (global_template_id) REFERENCES public.global_templates(id) ON DELETE CASCADE;

ALTER TABLE public.global_template_schedules 
ADD CONSTRAINT fk_global_template_schedules_global_template_email_id 
FOREIGN KEY (global_template_email_id) REFERENCES public.global_template_emails(id) ON DELETE CASCADE;

-- Add foreign key constraint for email_sequences linking to global_templates
ALTER TABLE public.email_sequences 
ADD CONSTRAINT fk_email_sequences_global_template_id 
FOREIGN KEY (global_template_id) REFERENCES public.global_templates(id) ON DELETE SET NULL;