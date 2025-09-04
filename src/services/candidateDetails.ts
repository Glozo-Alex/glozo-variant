import { supabase } from "@/integrations/supabase/client";

export interface CandidateDetail {
  id: number;
  bio?: string;
  educations?: Array<{
    dates: { start: string; end: string };
    description: string;
    qualification: string;
    location: string;
    provider: string;
  }>;
  degree?: string;
  contacts?: {
    emails: string[];
    phones: string[];
  };
  employments?: Array<{
    dates: { start: string; end: string };
    description: string;
    employer: string;
    location: string;
    responsibilities: string[];
    role: string;
    skills: Array<{
      cluster: string;
      skills: string[];
    }>;
    tenure: string;
    linkedin?: string;
  }>;
  certificates?: any[];
  location?: string;
  name?: string;
  role?: string;
  employer?: string;
  title?: string;
  skills?: Array<{
    cluster: string;
    skills: string[];
  }>;
  social?: Array<{
    platform: string;
    url: string;
  }>;
  languages?: string[];
  open_to_offers?: boolean;
  years_of_experience?: string;
  average_years_of_experience?: string;
  domain?: string;
  salary?: string;
  seniority_level?: string;
  standout?: string;
  ai_summary?: string;
  courses?: any[];
  publications?: Array<{
    date: string;
    description: string;
    name: string;
    publisher: string;
    url: string;
    skills: Array<{
      cluster: string;
      skills: string[];
    }>;
  }>;
  projects?: Array<{
    dates: { start: string; end: string };
    description: string;
    skills: any[];
    title: string;
    url: string;
  }>;
  volunteer_works?: any[];
  organizations?: any[];
  test_scores?: any[];
  awards?: any[];
}

export interface GetCandidateDetailsParams {
  candidateIds: number[];
  projectId: string;
}

export interface GetCandidateDetailsResponse {
  success: boolean;
  details: Record<number, CandidateDetail>;
  cached_count?: number;
  api_fetched_count?: number;
  error?: string;
}

/**
 * Get detailed information for candidates, either from cache or external API
 */
export async function getCandidateDetails({ 
  candidateIds, 
  projectId 
}: GetCandidateDetailsParams): Promise<GetCandidateDetailsResponse> {
  try {
    console.log('Getting candidate details for:', { candidateIds, projectId });

    const { data, error } = await supabase.functions.invoke('get-candidate-details', {
      body: {
        candidateIds,
        projectId,
      },
    });

    if (error) {
      console.error('Error calling get-candidate-details function:', error);
      throw new Error(`Failed to get candidate details: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned from get-candidate-details function');
    }

    if (!data.success) {
      throw new Error(data.error || 'Unknown error occurred');
    }

    console.log('Successfully fetched candidate details:', {
      candidatesCount: Object.keys(data.details).length,
      cachedCount: data.cached_count,
      apiFetchedCount: data.api_fetched_count
    });

    return data;
  } catch (error) {
    console.error('Error in getCandidateDetails:', error);
    return {
      success: false,
      details: {},
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Get cached candidate details from local database only
 */
export async function getCachedCandidateDetails(
  candidateIds: number[], 
  projectId: string
): Promise<Record<number, CandidateDetail>> {
  try {
    const { data, error } = await supabase
      .from('candidate_details')
      .select('candidate_id, detailed_data')
      .eq('project_id', projectId)
      .in('candidate_id', candidateIds);

    if (error) {
      console.error('Error fetching cached candidate details:', error);
      return {};
    }

    const detailsMap: Record<number, CandidateDetail> = {};
    data?.forEach(detail => {
      detailsMap[detail.candidate_id] = detail.detailed_data as unknown as CandidateDetail;
    });

    return detailsMap;
  } catch (error) {
    console.error('Error in getCachedCandidateDetails:', error);
    return {};
  }
}