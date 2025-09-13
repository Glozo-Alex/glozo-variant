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
    console.error('User not authenticated in addToShortlist');
    throw new Error('User not authenticated');
  }

  console.log('Adding to shortlist:', { 
    projectId, 
    candidateId, 
    userId: user.id,
    candidateDataKeys: Object.keys(candidateData || {})
  });

  // Verify project exists and user has access (works for both temporary and permanent projects)
  const { data: projectCheck, error: projectError } = await supabase
    .from('projects')
    .select('id, name')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single();

  if (projectError || !projectCheck) {
    console.error('Project not found or access denied:', projectError);
    throw new Error('Project not found or access denied');
  }

  console.log('Project verified:', { 
    id: projectCheck.id, 
    name: projectCheck.name
  });

  // Normalize candidate snapshot to ensure match score is present
  const normalizedSnapshot = {
    ...candidateData,
    match_percentage: Math.round(
      Number(
        candidateData.match_percentage ?? candidateData.match_score ?? candidateData.matchPercentage ?? candidateData.match ?? 0
      )
    ),
  };

  console.log('Normalized snapshot match_percentage:', normalizedSnapshot.match_percentage);

  try {
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
      console.error('Failed to insert into shortlist:', insertError);
      throw new Error(`Failed to add to shortlist: ${insertError.message}`);
    }

    console.log('Successfully inserted into shortlist');

    // Use database function to increment shortlist count atomically
    const { error: countError } = await supabase.rpc('increment_shortlist_count', {
      project_id_param: projectId
    });

    if (countError) {
      console.error('Failed to increment shortlist count:', countError);
      // Don't throw here as the main operation succeeded
      console.warn('Shortlist entry created but count update failed');
    } else {
      console.log('Successfully incremented shortlist count');
    }

    // Background fetch of candidate details for both temporary and permanent projects
    const numericCandidateId = parseInt(candidateId, 10);
    if (Number.isFinite(numericCandidateId)) {
      console.log('Fetching candidate details in background for:', numericCandidateId);
      getCandidateDetails({
        candidateIds: [numericCandidateId],
        projectId
      }).catch(error => {
        console.error('Failed to fetch candidate details in background:', error);
      });
    } else {
      console.warn('Invalid candidate ID for detail fetch:', candidateId);
    }

  } catch (error) {
    console.error('Error in addToShortlist:', error);
    throw error;
  }
};

// Remove candidate from shortlist
export const removeFromShortlist = async (projectId: string, candidateId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('User not authenticated in removeFromShortlist');
    throw new Error('User not authenticated');
  }

  console.log('Removing from shortlist:', { projectId, candidateId, userId: user.id });

  try {
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
      console.error('Failed to delete from shortlist:', deleteError);
      throw new Error(`Failed to remove from shortlist: ${deleteError.message}`);
    }

    console.log('Successfully removed from shortlist');

    // Use database function to decrement shortlist count atomically
    const { error: countError } = await supabase.rpc('decrement_shortlist_count', {
      project_id_param: projectId
    });

    if (countError) {
      console.error('Failed to decrement shortlist count:', countError);
      // Don't throw here as the main operation succeeded
      console.warn('Shortlist entry removed but count update failed');
    } else {
      console.log('Successfully decremented shortlist count');
    }

  } catch (error) {
    console.error('Error in removeFromShortlist:', error);
    throw error;
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