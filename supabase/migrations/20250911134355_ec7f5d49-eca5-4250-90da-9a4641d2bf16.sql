-- Add sidebar and view preferences to profiles table
ALTER TABLE public.profiles 
ADD COLUMN sidebar_collapsed boolean DEFAULT false,
ADD COLUMN candidate_view_preference text DEFAULT 'grid' CHECK (candidate_view_preference IN ('table', 'grid'));