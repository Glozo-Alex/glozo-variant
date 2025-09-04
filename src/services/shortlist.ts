import { supabase } from '@/integrations/supabase/client';

export interface ShortlistCandidate {
  id: string;
  projectId: string;
  candidateId: string;
  candidateSnapshot: any;
  addedAt: Date;
}

// Add candidate to shortlist
export const addToShortlist = async (projectId: string, candidateId: string, candidateData: any) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Insert into project_shortlist
  const { error: insertError } = await supabase
    .from('project_shortlist')
    .insert({
      project_id: projectId,
      candidate_id: candidateId,
      candidate_snapshot: candidateData,
      user_id: user.id
    });

  if (insertError) {
    throw new Error(`Failed to add to shortlist: ${insertError.message}`);
  }

  // Get current count and increment it
  const { data: currentProject } = await supabase
    .from('projects')
    .select('shortlist_count')
    .eq('id', projectId)
    .single();

  const newCount = (currentProject?.shortlist_count || 0) + 1;
  
  const { error: updateError } = await supabase
    .from('projects')
    .update({ shortlist_count: newCount })
    .eq('id', projectId);

  if (updateError) {
    console.error('Failed to update shortlist count:', updateError);
  }
};

// Remove candidate from shortlist
export const removeFromShortlist = async (projectId: string, candidateId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Remove from project_shortlist
  const { error: deleteError } = await supabase
    .from('project_shortlist')
    .delete()
    .match({
      project_id: projectId,
      candidate_id: candidateId,
      user_id: user.id
    });

  if (deleteError) {
    throw new Error(`Failed to remove from shortlist: ${deleteError.message}`);
  }

  // Get current count and decrement it
  const { data: currentProject } = await supabase
    .from('projects')
    .select('shortlist_count')
    .eq('id', projectId)
    .single();

  const newCount = Math.max((currentProject?.shortlist_count || 0) - 1, 0);
  
  const { error: updateError } = await supabase
    .from('projects')
    .update({ shortlist_count: newCount })
    .eq('id', projectId);

  if (updateError) {
    console.error('Failed to update shortlist count:', updateError);
  }
};

// Check if candidate is in shortlist
export const isInShortlist = async (projectId: string, candidateId: string): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return false;
  }

  const { data, error } = await supabase
    .from('project_shortlist')
    .select('id')
    .match({
      project_id: projectId,
      candidate_id: candidateId,
      user_id: user.id
    })
    .maybeSingle();

  if (error) {
    console.error('Failed to check shortlist status:', error);
    return false;
  }

  return !!data;
};

// Get all shortlisted candidates for a project
export const getShortlistForProject = async (projectId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('project_shortlist')
    .select('*')
    .match({
      project_id: projectId,
      user_id: user.id
    })
    .order('added_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to get shortlist: ${error.message}`);
  }

  return data || [];
};

// Get shortlist status for multiple candidates
export const getShortlistStatus = async (projectId: string, candidateIds: string[]) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return {};
  }

  const { data, error } = await supabase
    .from('project_shortlist')
    .select('candidate_id')
    .match({
      project_id: projectId,
      user_id: user.id
    })
    .in('candidate_id', candidateIds);

  if (error) {
    console.error('Failed to get shortlist status:', error);
    return {};
  }

  // Convert to object for O(1) lookup
  const shortlistedMap: Record<string, boolean> = {};
  candidateIds.forEach(id => {
    shortlistedMap[id] = false;
  });
  
  data?.forEach(item => {
    shortlistedMap[item.candidate_id] = true;
  });

  return shortlistedMap;
};