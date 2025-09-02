import { supabase } from "@/integrations/supabase/client";

export interface GetCandidatesParams {
  prompt: string;
  count?: number;
  similarRoles?: boolean;
}

export async function getCandidatesByPrompt({ prompt, count, similarRoles }: GetCandidatesParams) {
  const body: Record<string, any> = { prompt };
  if (typeof count === 'number') body.count = count;
  // Always send similarRoles as "Yes" or "No" - API expects this parameter
  body.similarRoles = similarRoles ? "Yes" : "No";

  const { data, error } = await supabase.functions.invoke('get-candidates-by-prompt', {
    body,
  });

  if (error) throw error;
  return data;
}
