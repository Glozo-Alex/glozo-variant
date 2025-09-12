-- Fix function search path security issues
ALTER FUNCTION public.upsert_candidate_and_relationship() SET search_path = public;
ALTER FUNCTION public.cleanup_candidate_relationship() SET search_path = public;