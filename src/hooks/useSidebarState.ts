import { useState, useEffect } from 'react';
import { useProfile } from './useProfile';

export function useSidebarState() {
  const { profile, updateProfile } = useProfile();
  const [collapsed, setCollapsed] = useState(false);

  // Initialize from profile
  useEffect(() => {
    if (profile?.sidebar_collapsed !== undefined) {
      setCollapsed(profile.sidebar_collapsed);
    }
  }, [profile?.sidebar_collapsed]);

  const toggleCollapsed = async () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    
    try {
      await updateProfile({ sidebar_collapsed: newCollapsed });
    } catch (error) {
      console.error('Failed to save sidebar state:', error);
      // Revert on error
      setCollapsed(!newCollapsed);
    }
  };

  return {
    collapsed,
    toggleCollapsed
  };
}