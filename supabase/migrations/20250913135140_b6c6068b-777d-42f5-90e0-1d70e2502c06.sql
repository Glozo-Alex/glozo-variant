-- Fix the ambiguous column reference in the upsert_candidate_and_relationship function
CREATE OR REPLACE FUNCTION public.upsert_candidate_and_relationship()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_candidate_uuid UUID;
BEGIN
  -- For project_shortlist inserts, upsert candidate and create relationship
  IF TG_TABLE_NAME = 'project_shortlist' THEN
    -- Upsert candidate
    INSERT INTO public.candidates (user_id, candidate_id, basic_data, first_seen_at, last_updated_at)
    VALUES (NEW.user_id, NEW.candidate_id, NEW.candidate_snapshot, NEW.added_at, NEW.added_at)
    ON CONFLICT (user_id, candidate_id) DO UPDATE SET
      basic_data = EXCLUDED.basic_data,
      last_updated_at = EXCLUDED.last_updated_at
    RETURNING id INTO new_candidate_uuid;
    
    -- Update candidate_uuid in the shortlist record
    NEW.candidate_uuid = new_candidate_uuid;
    
    -- Create relationship
    INSERT INTO public.candidate_relationships (user_id, candidate_uuid, relationship_type, related_object_id, related_object_data, created_at)
    VALUES (
      NEW.user_id,
      new_candidate_uuid,
      'project_shortlist',
      NEW.project_id,
      jsonb_build_object('added_at', NEW.added_at),
      NEW.added_at
    )
    ON CONFLICT (candidate_uuid, relationship_type, related_object_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$function$;