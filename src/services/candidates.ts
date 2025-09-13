import { supabase } from "@/integrations/supabase/client";

export interface GetCandidatesByChatParams {
  message: string;
  count?: number;
  similarRoles?: boolean;
  projectId: string;
}

export async function getCandidatesByChat({ message, count, similarRoles, projectId }: GetCandidatesByChatParams) {
  const safeCount = typeof count === 'number' ? count : 200;

  const body: Record<string, any> = {
    message,
    projectId,
    count: safeCount,
    similarRoles: Boolean(similarRoles),
  };

  const { data, error } = await supabase.functions.invoke('get-candidates-by-chat', {
    body: body,
  });

  if (error) throw error;
  return data;
}
