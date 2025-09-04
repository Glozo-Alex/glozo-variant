import { useState, useEffect } from 'react';
import { getCandidateDetails, type CandidateDetail } from '@/services/candidateDetails';

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
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching candidate details for:', candidateId);
      
      const response = await getCandidateDetails({
        candidateIds: [candidateId],
        projectId,
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch candidate details');
      }

      const detail = response.details[candidateId];
      if (detail) {
        setCandidateDetail(detail);
        console.log('Candidate details loaded successfully:', detail.name);
      } else {
        console.warn('No details found for candidate ID:', candidateId);
        setCandidateDetail(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error fetching candidate details:', errorMessage);
      setError(errorMessage);
      setCandidateDetail(null);
    } finally {
      setLoading(false);
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