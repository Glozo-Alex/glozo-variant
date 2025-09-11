import { useState, useEffect } from 'react';
import { useProfile } from './useProfile';

export type CandidateView = 'table' | 'grid';

export function useViewPreference() {
  const { profile, updateProfile } = useProfile();
  const [view, setView] = useState<CandidateView>('grid');

  // Initialize from profile
  useEffect(() => {
    if (profile?.candidate_view_preference) {
      setView(profile.candidate_view_preference as CandidateView);
    }
  }, [profile?.candidate_view_preference]);

  const setViewPreference = async (newView: CandidateView) => {
    setView(newView);
    
    try {
      await updateProfile({ candidate_view_preference: newView });
    } catch (error) {
      console.error('Failed to save view preference:', error);
      // Revert on error
      setView(view === 'table' ? 'grid' : 'table');
    }
  };

  return {
    view,
    setViewPreference
  };
}