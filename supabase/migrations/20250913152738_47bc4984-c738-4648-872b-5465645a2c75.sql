-- Update RLS policies for projects table to allow test user
DROP POLICY IF EXISTS "Users can create their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;

-- Create new policies that include test user support
CREATE POLICY "Users can create their own projects" 
ON public.projects 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id OR 
  user_id = '00000000-0000-0000-0000-000000000001'::uuid
);

CREATE POLICY "Users can view their own projects" 
ON public.projects 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  user_id = '00000000-0000-0000-0000-000000000001'::uuid
);

CREATE POLICY "Users can update their own projects" 
ON public.projects 
FOR UPDATE 
USING (
  auth.uid() = user_id OR 
  user_id = '00000000-0000-0000-0000-000000000001'::uuid
);

CREATE POLICY "Users can delete their own projects" 
ON public.projects 
FOR DELETE 
USING (
  auth.uid() = user_id OR 
  user_id = '00000000-0000-0000-0000-000000000001'::uuid
);