-- Add ui_density_preference column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN ui_density_preference TEXT CHECK (ui_density_preference IN ('default', 'compact'));