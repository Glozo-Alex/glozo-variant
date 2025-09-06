import { useState, useEffect, useCallback } from 'react';
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

  const fetchCandidateDetails = useCallback(async () => {
    if (!candidateId || !projectId || !enabled) {
      return;
    }

    console.log('useCandidateDetails - Starting fetch for:', { candidateId, projectId });
    setLoading(true);
    setError(null);

    try {
      const cachedMap = await getCachedCandidateDetails([candidateId], projectId);
      const cachedDetail = cachedMap?.[candidateId];

      if (cachedDetail) {
        console.log('useCandidateDetails - Using cached details');
        setCandidateDetail(cachedDetail);
        return;
      }

      const response = await getCandidateDetails({
        candidateIds: [candidateId],
        projectId,
      });

      if (!response.success) {
        const errorMsg = response.error || 'Failed to fetch candidate details';
        throw new Error(errorMsg);
      }

      const detail = response.details[candidateId];
      if (detail) {
        setCandidateDetail(detail);
      } else {
        setCandidateDetail(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setCandidateDetail(null);
    } finally {
      setLoading(false);
    }
  }, [candidateId, projectId, enabled]);

  useEffect(() => {
    fetchCandidateDetails();
  }, [fetchCandidateDetails]);

  return {
    candidateDetail,
    loading,
    error,
    refetch: fetchCandidateDetails,
  };
}