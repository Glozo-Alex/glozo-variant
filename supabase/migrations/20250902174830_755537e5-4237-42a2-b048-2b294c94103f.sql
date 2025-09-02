-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  query TEXT NOT NULL,
  similar_roles BOOLEAN DEFAULT false,
  shortlist_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create searches table
CREATE TABLE public.searches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  prompt TEXT NOT NULL,
  similar_roles BOOLEAN DEFAULT false,
  candidate_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create search_results table
CREATE TABLE public.search_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  search_id UUID NOT NULL REFERENCES public.searches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  candidate_data JSONB NOT NULL,
  match_percentage DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project_shortlist table
CREATE TABLE public.project_shortlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  candidate_id TEXT NOT NULL,
  candidate_snapshot JSONB NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, candidate_id)
);

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_shortlist ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for projects
CREATE POLICY "Users can view their own projects" ON public.projects
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects" ON public.projects
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON public.projects
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON public.projects
FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for searches
CREATE POLICY "Users can view their own searches" ON public.searches
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own searches" ON public.searches
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own searches" ON public.searches
FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for search_results
CREATE POLICY "Users can view their own search results" ON public.search_results
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own search results" ON public.search_results
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for project_shortlist
CREATE POLICY "Users can view their own shortlist" ON public.project_shortlist
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own shortlist" ON public.project_shortlist
FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_searches_project_id ON public.searches(project_id);
CREATE INDEX idx_searches_user_id ON public.searches(user_id);
CREATE INDEX idx_search_results_search_id ON public.search_results(search_id);
CREATE INDEX idx_search_results_user_id ON public.search_results(user_id);
CREATE INDEX idx_project_shortlist_project_id ON public.project_shortlist(project_id);
CREATE INDEX idx_project_shortlist_user_id ON public.project_shortlist(user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates on projects
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();