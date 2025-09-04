-- Fix security warning by setting search_path for functions
CREATE OR REPLACE FUNCTION public.increment_shortlist_count(project_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE public.projects 
  SET shortlist_count = COALESCE(shortlist_count, 0) + 1
  WHERE id = project_id_param;
END;
$$;

-- Fix security warning by setting search_path for functions
CREATE OR REPLACE FUNCTION public.decrement_shortlist_count(project_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE public.projects 
  SET shortlist_count = GREATEST(COALESCE(shortlist_count, 0) - 1, 0)
  WHERE id = project_id_param;
END;
$$;