import { supabase } from "@/integrations/supabase/client";

export interface GetCandidatesParams {
  prompt: string;
  count?: number;
  similarRoles?: boolean;
  projectId: string;
}

export async function getCandidatesByPrompt({ prompt, count, similarRoles, projectId }: GetCandidatesParams) {
  const safeCount = typeof count === 'number' ? count : 200;

  const body: Record<string, any> = {
    prompt,
    projectId,
    count: safeCount,
    similarRoles: Boolean(similarRoles),
  };

  const { data, error } = await supabase.functions.invoke('get-candidates-by-prompt', {
    body: body,
  });

  if (error) throw error;
  return data;
}
