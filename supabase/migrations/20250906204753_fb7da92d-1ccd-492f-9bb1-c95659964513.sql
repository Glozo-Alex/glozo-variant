-- Create email sequences table
CREATE TABLE public.email_sequences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email templates table  
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sequence_id UUID NOT NULL,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  delay_days INTEGER NOT NULL DEFAULT 0,
  delay_hours INTEGER NOT NULL DEFAULT 0,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sequence recipients table
CREATE TABLE public.sequence_recipients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sequence_id UUID NOT NULL,
  user_id UUID NOT NULL,
  candidate_id TEXT NOT NULL,
  project_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  current_template_index INTEGER NOT NULL DEFAULT 0,
  next_send_at TIMESTAMP WITH TIME ZONE,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create email logs table
CREATE TABLE public.email_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sequence_id UUID NOT NULL,
  template_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  user_id UUID NOT NULL,
  candidate_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sequence_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for email_sequences
CREATE POLICY "Users can view their own sequences" 
ON public.email_sequences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sequences" 
ON public.email_sequences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sequences" 
ON public.email_sequences 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sequences" 
ON public.email_sequences 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for email_templates
CREATE POLICY "Users can view their own templates" 
ON public.email_templates 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own templates" 
ON public.email_templates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates" 
ON public.email_templates 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates" 
ON public.email_templates 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for sequence_recipients
CREATE POLICY "Users can view their own sequence recipients" 
ON public.sequence_recipients 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sequence recipients" 
ON public.sequence_recipients 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sequence recipients" 
ON public.sequence_recipients 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sequence recipients" 
ON public.sequence_recipients 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for email_logs
CREATE POLICY "Users can view their own email logs" 
ON public.email_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own email logs" 
ON public.email_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create foreign key constraints
ALTER TABLE public.email_templates 
ADD CONSTRAINT email_templates_sequence_id_fkey 
FOREIGN KEY (sequence_id) REFERENCES public.email_sequences(id) ON DELETE CASCADE;

ALTER TABLE public.sequence_recipients 
ADD CONSTRAINT sequence_recipients_sequence_id_fkey 
FOREIGN KEY (sequence_id) REFERENCES public.email_sequences(id) ON DELETE CASCADE;

ALTER TABLE public.sequence_recipients 
ADD CONSTRAINT sequence_recipients_project_id_fkey 
FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

ALTER TABLE public.email_logs 
ADD CONSTRAINT email_logs_sequence_id_fkey 
FOREIGN KEY (sequence_id) REFERENCES public.email_sequences(id) ON DELETE CASCADE;

ALTER TABLE public.email_logs 
ADD CONSTRAINT email_logs_template_id_fkey 
FOREIGN KEY (template_id) REFERENCES public.email_templates(id) ON DELETE CASCADE;

ALTER TABLE public.email_logs 
ADD CONSTRAINT email_logs_recipient_id_fkey 
FOREIGN KEY (recipient_id) REFERENCES public.sequence_recipients(id) ON DELETE CASCADE;

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_email_sequences_updated_at
BEFORE UPDATE ON public.email_sequences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();