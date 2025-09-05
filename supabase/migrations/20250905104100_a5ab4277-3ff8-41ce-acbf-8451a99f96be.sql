-- Create profiles for existing users who don't have one yet
INSERT INTO public.profiles (id, full_name)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data ->> 'full_name', au.raw_user_meta_data ->> 'name', au.email)
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO UPDATE SET 
  full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
  updated_at = now();