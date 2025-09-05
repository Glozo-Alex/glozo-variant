import { useState, useEffect } from 'react';
import { getCandidateDetails, getCachedCandidateDetails, type CandidateDetail } from '@/services/candidateDetails';

interface UseCandidateDetailsParams {
  candidateId: number | null;
  projectId: string | null;
  enabled?: boolean;
}

interface UseCandidateDetailsReturn {
  candidateDetail: CandidateDetail | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCandidateDetails({ 
  candidateId, 
  projectId, 
  enabled = true 
}: UseCandidateDetailsParams): UseCandidateDetailsReturn {
  const [candidateDetail, setCandidateDetail] = useState<CandidateDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCandidateDetails = async () => {
    if (!candidateId || !projectId || !enabled) {
      console.log('useCandidateDetails - Skipping fetch:', { candidateId, projectId, enabled });
      return;
    }

    console.log('useCandidateDetails - Starting fetch for:', { candidateId, projectId });
    setLoading(true);
    setError(null);

    try {
      console.log('useCandidateDetails - Checking cache via getCachedCandidateDetails...');
      const cachedMap = await getCachedCandidateDetails([candidateId], projectId);
      const cachedDetail = cachedMap?.[candidateId];

      if (cachedDetail) {
        console.log('useCandidateDetails - Using cached details, skipping API call:', {
          candidateId,
          name: cachedDetail.name,
          hasEmployments: !!cachedDetail.employments?.length,
          hasEducations: !!cachedDetail.educations?.length,
          hasBio: !!cachedDetail.bio
        });
        setCandidateDetail(cachedDetail);
        return; // finally block will still run
      }

      console.log('useCandidateDetails - No cache found, calling getCandidateDetails...');
      const response = await getCandidateDetails({
        candidateIds: [candidateId],
        projectId,
      });

      console.log('useCandidateDetails - API response:', response);

      if (!response.success) {
        const errorMsg = response.error || 'Failed to fetch candidate details';
        console.error('useCandidateDetails - API error:', errorMsg);
        throw new Error(errorMsg);
      }

      const detail = response.details[candidateId];
      if (detail) {
        console.log('useCandidateDetails - Detail found (from API):', {
          candidateId,
          name: detail.name,
          hasEmployments: !!detail.employments?.length,
          hasEducations: !!detail.educations?.length,
          hasBio: !!detail.bio
        });
        setCandidateDetail(detail);
      } else {
        console.warn('useCandidateDetails - No details found for candidate ID:', candidateId);
        setCandidateDetail(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('useCandidateDetails - Error:', errorMessage, err);
      setError(errorMessage);
      setCandidateDetail(null);
    } finally {
      setLoading(false);
      console.log('useCandidateDetails - Fetch completed');
    }
  };

  useEffect(() => {
    fetchCandidateDetails();
  }, [candidateId, projectId, enabled]);

  return {
    candidateDetail,
    loading,
    error,
    refetch: fetchCandidateDetails,
  };
}