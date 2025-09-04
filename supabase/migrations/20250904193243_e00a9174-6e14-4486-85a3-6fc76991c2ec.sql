-- Create table for storing detailed candidate data from external API
CREATE TABLE public.candidate_details (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id INTEGER NOT NULL,
  user_id UUID NOT NULL,
  project_id UUID NOT NULL,
  detailed_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_candidate_details_candidate_id ON public.candidate_details(candidate_id);
CREATE INDEX idx_candidate_details_user_project ON public.candidate_details(user_id, project_id);
CREATE INDEX idx_candidate_details_created_at ON public.candidate_details(created_at);

-- Enable Row Level Security
ALTER TABLE public.candidate_details ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own candidate details" 
  ON public.candidate_details 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own candidate details" 
  ON public.candidate_details 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own candidate details" 
  ON public.candidate_details 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own candidate details" 
  ON public.candidate_details 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_candidate_details_updated_at
  BEFORE UPDATE ON public.candidate_details
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();