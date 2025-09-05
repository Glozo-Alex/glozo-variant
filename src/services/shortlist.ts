import { supabase } from '@/integrations/supabase/client';
import { getCandidateDetails } from './candidateDetails';

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

  // Normalize candidate snapshot to ensure match score is present
  const normalizedSnapshot = {
    ...candidateData,
    match_percentage: Math.round(
      Number(
        candidateData.match_percentage ?? candidateData.match_score ?? candidateData.matchPercentage ?? candidateData.match ?? 0
      )
    ),
  };

  // Insert into project_shortlist
  const { error: insertError } = await supabase
    .from('project_shortlist')
    .insert({
      project_id: projectId,
      candidate_id: candidateId,
      candidate_snapshot: normalizedSnapshot,
      user_id: user.id
    });

  if (insertError) {
    throw new Error(`Failed to add to shortlist: ${insertError.message}`);
  }

  // First get current count, then update
  const { data: projectData } = await supabase
    .from('projects')
    .select('shortlist_count')
    .eq('id', projectId)
    .single();

  const currentCount = projectData?.shortlist_count || 0;
  const { error: updateError } = await supabase
    .from('projects')
    .update({ shortlist_count: currentCount + 1 })
    .eq('id', projectId);

  if (updateError) {
    console.error('Failed to update shortlist count:', updateError);
  }

  // Background fetch of candidate details
  const numericCandidateId = parseInt(candidateId, 10);
  if (Number.isFinite(numericCandidateId)) {
    getCandidateDetails({
      candidateIds: [numericCandidateId],
      projectId
    }).catch(error => {
      console.error('Failed to fetch candidate details in background:', error);
    });
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

  // First get current count, then update
  const { data: projectData } = await supabase
    .from('projects')
    .select('shortlist_count')
    .eq('id', projectId)
    .single();

  const currentCount = projectData?.shortlist_count || 0;
  const { error: updateError } = await supabase
    .from('projects')
    .update({ shortlist_count: Math.max(currentCount - 1, 0) })
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