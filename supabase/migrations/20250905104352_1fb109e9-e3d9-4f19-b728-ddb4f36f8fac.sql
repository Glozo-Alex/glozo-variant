-- Update existing profiles with avatar_url from Google if they don't have one
UPDATE public.profiles 
SET avatar_url = COALESCE(
  profiles.avatar_url,
  (SELECT au.raw_user_meta_data ->> 'avatar_url' 
   FROM auth.users au 
   WHERE au.id = profiles.id
   AND au.raw_user_meta_data ->> 'avatar_url' IS NOT NULL)
),
updated_at = now()
WHERE avatar_url IS NULL;

-- Update the trigger function to include avatar_url from Google
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', new.email),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN new;
END;
$$;