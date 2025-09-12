-- Add independent search session support
ALTER TABLE searches 
ADD COLUMN IF NOT EXISTS session_id text,
ADD COLUMN IF NOT EXISTS is_temporary boolean DEFAULT true;

-- Create index for better performance on session lookups
CREATE INDEX IF NOT EXISTS idx_searches_session_id ON searches(session_id);
CREATE INDEX IF NOT EXISTS idx_searches_temporary ON searches(is_temporary);

-- Update existing searches to be non-temporary (project-based)
UPDATE searches SET is_temporary = false WHERE project_id IS NOT NULL;