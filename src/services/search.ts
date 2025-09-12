import { supabase } from "@/integrations/supabase/client";

export interface CreateSearchParams {
  message: string;
  count?: number;
  similarRoles?: boolean;
}

export interface SearchResult {
  id: string;
  session_id: string;
  prompt: string;
  status: string;
  candidate_count: number;
  created_at: string;
  completed_at?: string;
  error_message?: string;
  raw_response?: any;
  project_id?: string;
}

export async function createIndependentSearch({
  message,
  count = 50,
  similarRoles = false
}: CreateSearchParams): Promise<SearchResult> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    throw new Error('User not authenticated');
  }

  // Create a temporary project for this search
  const { data: tempProject, error: projectError } = await supabase
    .from('projects')
    .insert({
      name: `Search: ${message.substring(0, 50)}...`,
      query: message,
      user_id: user.user.id,
      similar_roles: similarRoles,
      is_temporary: true,
      session_id: ""
    })
    .select()
    .single();

  if (projectError) {
    throw projectError;
  }

  // Call the search function with the temporary project ID
  const { data, error } = await supabase.functions.invoke('get-candidates-by-chat', {
    body: {
      message,
      count,
      similarRoles,
      projectId: tempProject.id,
      sessionId: ""
    }
  });

  if (error) {
    console.error('Search function error:', error);
    throw error;
  }

  // API should return sessionId, use it to get the created search
  if (!data?.session_id) {
    throw new Error('No session ID returned from API');
  }

  const { data: search, error: searchError } = await supabase
    .from('searches')
    .select('*')
    .eq('session_id', data.session_id)
    .eq('project_id', tempProject.id)
    .single();

  if (searchError) {
    throw searchError;
  }

  return search;
}

export async function getSearchResults(sessionId: string) {
  // Find search by session_id, could be temporary or permanent
  const { data: search, error: searchError } = await supabase
    .from('searches')
    .select('*')
    .eq('session_id', sessionId)
    .single();

  if (searchError) {
    throw searchError;
  }

  const { data: results, error: resultsError } = await supabase
    .from('search_results')
    .select('*')
    .eq('search_id', search.id)
    .order('match_percentage', { ascending: false });

  if (resultsError) {
    throw resultsError;
  }

  return {
    search,
    results: results?.map(result => result.candidate_data) || []
  };
}

export async function saveSearchToProject({
  sessionId,
  projectName,
  projectNotes,
  projectClient
}: {
  sessionId: string;
  projectName: string;
  projectNotes?: string;
  projectClient?: string;
}) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    throw new Error('User not authenticated');
  }

  // Get the temporary search and its associated temporary project
  const { data: search, error: searchError } = await supabase
    .from('searches')
    .select('*')
    .eq('session_id', sessionId)
    .single();

  if (searchError) {
    throw searchError;
  }

  if (!search.project_id) {
    throw new Error('No project associated with this search');
  }

  // Update the temporary project to make it permanent
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .update({
      name: projectName,
      is_temporary: false
    })
    .eq('id', search.project_id)
    .select()
    .single();

  if (projectError) {
    throw projectError;
  }

  // Get search results and copy them to project shortlist if needed
  const { data: searchResults } = await supabase
    .from('search_results')
    .select('*')
    .eq('search_id', search.id);

  if (searchResults && searchResults.length > 0) {
    // Note: We don't auto-add to shortlist, user will do that manually
    // This preserves the current workflow where users choose what to shortlist
  }

  return project;
}