
-- Ensure upsert works by adding a unique index on the natural key
CREATE UNIQUE INDEX IF NOT EXISTS ux_candidate_details_candidate_user_project
ON public.candidate_details (candidate_id, user_id, project_id);
