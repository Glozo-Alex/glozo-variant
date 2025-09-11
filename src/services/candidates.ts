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

export interface AllCandidatesParams {
  userId: string;
  searchQuery?: string;
  filterStatus?: 'all' | 'active' | 'completed';
}

export interface CandidateWithProjects {
  id: string;
  candidateId: string;
  candidateSnapshot: any;
  addedAt: string;
  projects: Array<{
    id: string;
    name: string;
    addedAt: string;
  }>;
  sequenceStatus?: 'active' | 'paused' | 'completed';
  lastActivity?: string;
}

export async function getAllCandidates({ userId, searchQuery, filterStatus }: AllCandidatesParams): Promise<CandidateWithProjects[]> {
  try {
    // Get all candidates from shortlist with project info
    const { data: shortlistData, error: shortlistError } = await supabase
      .from('project_shortlist')
      .select(`
        id,
        candidate_id,
        candidate_snapshot,
        added_at,
        project_id,
        projects!inner(id, name)
      `)
      .eq('user_id', userId)
      .order('added_at', { ascending: false });

    if (shortlistError) throw shortlistError;

    // Group by candidate_id to consolidate multiple projects
    const candidateMap = new Map<string, CandidateWithProjects>();

    shortlistData?.forEach(item => {
      const candidateId = item.candidate_id;
      
      if (candidateMap.has(candidateId)) {
        // Add project to existing candidate
        const existing = candidateMap.get(candidateId)!;
        existing.projects.push({
          id: (item.projects as any).id,
          name: (item.projects as any).name,
          addedAt: item.added_at
        });
      } else {
        // Create new candidate entry
        candidateMap.set(candidateId, {
          id: item.id,
          candidateId: candidateId,
          candidateSnapshot: item.candidate_snapshot,
          addedAt: item.added_at,
          projects: [{
            id: (item.projects as any).id,
            name: (item.projects as any).name,
            addedAt: item.added_at
          }]
        });
      }
    });

    // Get sequence status for all candidates
    const candidateIds = Array.from(candidateMap.keys());
    if (candidateIds.length > 0) {
      const { data: sequenceData } = await supabase
        .from('sequence_recipients')
        .select('candidate_id, status, enrolled_at')
        .eq('user_id', userId)
        .in('candidate_id', candidateIds);

      // Add sequence status to candidates
      sequenceData?.forEach(seq => {
        const candidate = candidateMap.get(seq.candidate_id);
        if (candidate) {
          candidate.sequenceStatus = seq.status as any;
          candidate.lastActivity = seq.enrolled_at;
        }
      });
    }

    const candidates = Array.from(candidateMap.values());

    // Apply filters
    let filtered = candidates;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(candidate => {
        const snapshot = candidate.candidateSnapshot;
        const name = snapshot?.name?.toLowerCase() || '';
        const title = snapshot?.title?.toLowerCase() || '';
        const employer = snapshot?.employer?.toLowerCase() || '';
        
        return name.includes(query) || title.includes(query) || employer.includes(query);
      });
    }

    if (filterStatus && filterStatus !== 'all') {
      filtered = filtered.filter(candidate => {
        if (filterStatus === 'active') {
          return candidate.sequenceStatus === 'active';
        }
        if (filterStatus === 'completed') {
          return candidate.sequenceStatus === 'completed';
        }
        return true;
      });
    }

    return filtered;
  } catch (error) {
    console.error('Error fetching all candidates:', error);
    throw error;
  }
}
