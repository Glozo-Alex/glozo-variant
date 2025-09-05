-- Allow users to DELETE their own searches and search_results
-- Ensure RLS is enabled (it already is per schema, but keep idempotent)
ALTER TABLE IF EXISTS public.searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.search_results ENABLE ROW LEVEL SECURITY;

-- Create DELETE policy for searches if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'searches' AND polname = 'Users can delete their own searches'
  ) THEN
    CREATE POLICY "Users can delete their own searches"
    ON public.searches
    FOR DELETE
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create DELETE policy for search_results if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'search_results' AND polname = 'Users can delete their own search results'
  ) THEN
    CREATE POLICY "Users can delete their own search results"
    ON public.search_results
    FOR DELETE
    USING (auth.uid() = user_id);
  END IF;
END $$;