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

  // Call the search function with sessionId=null for first request
  const { data, error } = await supabase.functions.invoke('get-candidates-by-chat', {
    body: {
      message,
      count,
      similarRoles,
      sessionId: null, // null for first request
      isTemporary: true
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
    .eq('is_temporary', true)
    .single();

  if (searchError) {
    throw searchError;
  }

  return search;
}

export async function getSearchResults(sessionId: string) {
  const { data: search, error: searchError } = await supabase
    .from('searches')
    .select('*')
    .eq('session_id', sessionId)
    .eq('is_temporary', true)
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

  // Get the temporary search
  const { data: search, error: searchError } = await supabase
    .from('searches')
    .select('*')
    .eq('session_id', sessionId)
    .eq('is_temporary', true)
    .single();

  if (searchError) {
    throw searchError;
  }

  // Create the project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert({
      name: projectName,
      query: search.prompt,
      user_id: user.user.id,
      similar_roles: search.similar_roles || false,
      session_id: search.session_id
    })
    .select()
    .single();

  if (projectError) {
    throw projectError;
  }

  // Update the search to be non-temporary and link to project
  await supabase
    .from('searches')
    .update({
      is_temporary: false,
      project_id: project.id
    })
    .eq('id', search.id);

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