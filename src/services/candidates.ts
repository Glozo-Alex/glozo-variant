import { supabase } from "@/integrations/supabase/client";

export interface GetCandidatesByChatParams {
  message: string;
  count?: number;
  similarRoles?: boolean;
  projectId: string;
}

export interface CandidateForCRM {
  id: string;
  candidate_id: string;
  name: string | null;
  role: string | null;
  employer: string | null;
  location: string | null;
  avatar_url: string | null;
  skills: string[] | null;
  contact_details_requested_at: string | null;
  contact_details_available: boolean;
  last_interaction_at: string | null;
  interaction_count: number | null;
  status: string;
  notes: string | null;
  tags: string[] | null;
  first_seen_at: string;
  detailed_data: any;
  basic_data: any;
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

export async function getCandidatesForCRM(): Promise<CandidateForCRM[]> {
  const { data, error } = await supabase
    .from('candidates')
    .select(`
      id,
      candidate_id,
      basic_data,
      detailed_data,
      contact_details_requested_at,
      contact_details_available,
      last_interaction_at,
      interaction_count,
      status,
      notes,
      tags,
      first_seen_at,
      last_updated_at
    `)
    .order('last_interaction_at', { ascending: false, nullsFirst: false });

  if (error) {
    console.error('Error fetching candidates for CRM:', error);
    throw error;
  }

  return data.map(candidate => {
    const basicData = candidate.basic_data as any;
    const detailedData = candidate.detailed_data as any;
    
    return {
      id: candidate.id,
      candidate_id: candidate.candidate_id,
      name: basicData?.name || detailedData?.name || null,
      role: basicData?.role || detailedData?.role || null,
      employer: basicData?.employer || detailedData?.employer || null,
      location: basicData?.location || detailedData?.location || null,
      avatar_url: basicData?.avatar_url || detailedData?.avatar_url || null,
      skills: basicData?.skills || detailedData?.skills || null,
      contact_details_requested_at: candidate.contact_details_requested_at,
      contact_details_available: candidate.contact_details_available || false,
      last_interaction_at: candidate.last_interaction_at,
      interaction_count: candidate.interaction_count || 0,
      status: candidate.status || 'active',
      notes: candidate.notes,
      tags: candidate.tags,
      first_seen_at: candidate.first_seen_at,
      detailed_data: candidate.detailed_data,
      basic_data: candidate.basic_data,
    };
  });
}

export async function upsertCandidate(candidateData: {
  candidateId: string;
  basicData: any;
  detailedData?: any;
  contactDetailsRequested?: boolean;
}) {
  const { candidateId, basicData, detailedData, contactDetailsRequested } = candidateData;

  const updateData: any = {
    candidate_id: candidateId,
    basic_data: basicData,
    last_updated_at: new Date().toISOString(),
  };

  if (detailedData) {
    updateData.detailed_data = detailedData;
    updateData.contact_details_available = true;
  }

  if (contactDetailsRequested) {
    updateData.contact_details_requested_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('candidates')
    .upsert(updateData, {
      onConflict: 'user_id,candidate_id',
      ignoreDuplicates: false
    })
    .select()
    .single();

  if (error) {
    console.error('Error upserting candidate:', error);
    throw error;
  }

  return data;
}

export async function updateCandidateNotes(candidateId: string, notes: string) {
  const { data, error } = await supabase
    .from('candidates')
    .update({ notes })
    .eq('candidate_id', candidateId)
    .select()
    .single();

  if (error) {
    console.error('Error updating candidate notes:', error);
    throw error;
  }

  return data;
}

export async function updateCandidateTags(candidateId: string, tags: string[]) {
  const { data, error } = await supabase
    .from('candidates')
    .update({ tags })
    .eq('candidate_id', candidateId)
    .select()
    .single();

  if (error) {
    console.error('Error updating candidate tags:', error);
    throw error;
  }

  return data;
}

export async function updateCandidateStatus(candidateId: string, status: string) {
  const { data, error } = await supabase
    .from('candidates')
    .update({ status })
    .eq('candidate_id', candidateId)
    .select()
    .single();

  if (error) {
    console.error('Error updating candidate status:', error);
    throw error;
  }

  return data;
}