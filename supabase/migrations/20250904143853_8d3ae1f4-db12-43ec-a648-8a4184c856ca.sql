-- Create function to increment shortlist count
CREATE OR REPLACE FUNCTION public.increment_shortlist_count(project_id_param uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.projects 
  SET shortlist_count = COALESCE(shortlist_count, 0) + 1
  WHERE id = project_id_param;
END;
$$;

-- Create function to decrement shortlist count
CREATE OR REPLACE FUNCTION public.decrement_shortlist_count(project_id_param uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.projects 
  SET shortlist_count = GREATEST(COALESCE(shortlist_count, 0) - 1, 0)
  WHERE id = project_id_param;
END;
$$;