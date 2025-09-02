import { supabase } from "@/integrations/supabase/client";

export interface CreateProjectParams {
  name: string;
  query: string;
  similarRoles?: boolean;
}

export interface CreateSearchParams {
  projectId: string;
  prompt: string;
  similarRoles?: boolean;
}

export interface SaveSearchResultsParams {
  searchId: string;
  candidates: any[];
}

export async function createProject({ name, query, similarRoles = false }: CreateProjectParams) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('projects')
    .insert({
      name,
      query,
      similar_roles: similarRoles,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createSearch({ projectId, prompt, similarRoles = false }: CreateSearchParams) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('searches')
    .insert({
      project_id: projectId,
      prompt,
      similar_roles: similarRoles,
      user_id: user.id,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSearchStatus(searchId: string, status: string, errorMessage?: string, candidateCount?: number) {
  const completedAt = status === 'completed' ? new Date().toISOString() : null;
  
  const { data, error } = await supabase
    .from('searches')
    .update({
      status,
      error_message: errorMessage,
      candidate_count: candidateCount,
      completed_at: completedAt,
    })
    .eq('id', searchId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function saveSearchResults({ searchId, candidates }: SaveSearchResultsParams) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const searchResults = candidates.map((candidate, index) => ({
    search_id: searchId,
    user_id: user.id,
    candidate_data: candidate,
    match_percentage: candidate.matchPercentage || null,
  }));

  const { data, error } = await supabase
    .from('search_results')
    .insert(searchResults)
    .select();

  if (error) throw error;
  return data;
}

export async function getProject(projectId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (error) throw error;
  return data;
}

export async function getProjectSearches(projectId: string) {
  const { data, error } = await supabase
    .from('searches')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getSearchResults(searchId: string) {
  const { data, error } = await supabase
    .from('search_results')
    .select('*')
    .eq('search_id', searchId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getUserProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}