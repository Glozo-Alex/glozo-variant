import { supabase } from "@/integrations/supabase/client";

export interface RecentSearch {
  id: string;
  prompt: string;
  created_at: string;
  candidate_count?: number;
}

export const getRecentSearches = async (limit: number = 5): Promise<RecentSearch[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('searches')
      .select('id, prompt, created_at, candidate_count')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent searches:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching recent searches:', error);
    return [];
  }
};