-- Create global templates table
CREATE TABLE public.global_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for global_templates
ALTER TABLE public.global_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for global_templates
CREATE POLICY "Users can view their own global templates" 
ON public.global_templates 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own global templates" 
ON public.global_templates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own global templates" 
ON public.global_templates 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own global templates" 
ON public.global_templates 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create global template emails table
CREATE TABLE public.global_template_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  global_template_id UUID NOT NULL,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for global_template_emails
ALTER TABLE public.global_template_emails ENABLE ROW LEVEL SECURITY;

-- Create policies for global_template_emails
CREATE POLICY "Users can view their own global template emails" 
ON public.global_template_emails 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own global template emails" 
ON public.global_template_emails 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own global template emails" 
ON public.global_template_emails 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own global template emails" 
ON public.global_template_emails 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create global template schedules table
CREATE TABLE public.global_template_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  global_template_email_id UUID NOT NULL,
  schedule_type TEXT NOT NULL DEFAULT 'delay', -- delay, specific_date, days_of_week, trigger_based
  schedule_config JSONB NOT NULL DEFAULT '{}',
  trigger_config JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for global_template_schedules
ALTER TABLE public.global_template_schedules ENABLE ROW LEVEL SECURITY;

-- Create policies for global_template_schedules
CREATE POLICY "Users can view their own global template schedules" 
ON public.global_template_schedules 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.global_template_emails gte 
    WHERE gte.id = global_template_schedules.global_template_email_id 
    AND gte.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own global template schedules" 
ON public.global_template_schedules 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.global_template_emails gte 
    WHERE gte.id = global_template_schedules.global_template_email_id 
    AND gte.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own global template schedules" 
ON public.global_template_schedules 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.global_template_emails gte 
    WHERE gte.id = global_template_schedules.global_template_email_id 
    AND gte.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own global template schedules" 
ON public.global_template_schedules 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.global_template_emails gte 
    WHERE gte.id = global_template_schedules.global_template_email_id 
    AND gte.user_id = auth.uid()
  )
);

-- Add global_template_id to email_sequences
ALTER TABLE public.email_sequences 
ADD COLUMN global_template_id UUID;

-- Add advanced scheduling fields to email_templates
ALTER TABLE public.email_templates 
ADD COLUMN schedule_type TEXT DEFAULT 'delay',
ADD COLUMN schedule_config JSONB DEFAULT '{}',
ADD COLUMN trigger_config JSONB;

-- Create trigger for updating updated_at on global_templates
CREATE TRIGGER update_global_templates_updated_at
BEFORE UPDATE ON public.global_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updating updated_at on global_template_emails
CREATE TRIGGER update_global_template_emails_updated_at
BEFORE UPDATE ON public.global_template_emails
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updating updated_at on global_template_schedules
CREATE TRIGGER update_global_template_schedules_updated_at
BEFORE UPDATE ON public.global_template_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();