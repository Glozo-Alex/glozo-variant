import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { ColorScheme, UIDensity, applyColorScheme, applyUIDensity } from '@/lib/themes';
import { useProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';

interface ThemeContextType {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  uiDensity: UIDensity;
  setUIDensity: (density: UIDensity) => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>('default');
  const [uiDensity, setUIDensityState] = useState<UIDensity>('default');
  const [isLoading, setIsLoading] = useState(true);
  const { profile, updateProfile } = useProfile();

  // Initialize color scheme and UI density from profile or localStorage
  useEffect(() => {
    const initializeTheme = () => {
      // Initialize color scheme
      let initialScheme: ColorScheme = 'default';
      if (profile?.theme_preference) {
        initialScheme = profile.theme_preference as ColorScheme;
      } else {
        const stored = localStorage.getItem('color-scheme') as ColorScheme;
        if (stored && ['default', 'ocean', 'sunset', 'forest'].includes(stored)) {
          initialScheme = stored;
        }
      }
      
      // Initialize UI density
      let initialDensity: UIDensity = 'default';
      if (profile?.ui_density_preference) {
        initialDensity = profile.ui_density_preference as UIDensity;
      } else {
        const stored = localStorage.getItem('ui-density') as UIDensity;
        if (stored && ['default', 'compact'].includes(stored)) {
          initialDensity = stored;
        }
      }
      
      console.log('🎯 Initializing theme:', { colorScheme: initialScheme, uiDensity: initialDensity });
      setColorSchemeState(initialScheme);
      setUIDensityState(initialDensity);
      
      // Ensure default classes are applied on initialization
      const root = document.documentElement;
      if (!root.classList.contains('theme-default') && !root.classList.contains('theme-ocean') && 
          !root.classList.contains('theme-sunset') && !root.classList.contains('theme-forest')) {
        root.classList.add('theme-default');
      }
      if (!root.classList.contains('ui-default') && !root.classList.contains('ui-compact')) {
        root.classList.add('ui-default');
      }
      
      applyColorScheme(initialScheme);
      applyUIDensity(initialDensity);
      setIsLoading(false);
    };

    initializeTheme();
  }, [profile]);

  // Listen for theme change events to show feedback
  useEffect(() => {
    const handleThemeChanged = (event: CustomEvent) => {
      const { scheme } = event.detail;
      toast.success(`Color scheme changed to ${scheme}`, {
        duration: 2000,
      });
    };

    const handleUIDensityChanged = (event: CustomEvent) => {
      const { density } = event.detail;
      const displayName = density === 'compact' ? 'Professional' : 'Comfortable';
      toast.success(`Interface density changed to ${displayName}`, {
        duration: 2000,
      });
    };

    document.addEventListener('themeChanged', handleThemeChanged as EventListener);
    document.addEventListener('uiDensityChanged', handleUIDensityChanged as EventListener);
    return () => {
      document.removeEventListener('themeChanged', handleThemeChanged as EventListener);
      document.removeEventListener('uiDensityChanged', handleUIDensityChanged as EventListener);
    };
  }, []);

  const setColorScheme = async (scheme: ColorScheme) => {
    try {
      console.log('🎨 Changing color scheme to:', scheme);
      setColorSchemeState(scheme);
      
      // Apply color scheme immediately for instant feedback
      applyColorScheme(scheme);
      
      // Save to profile if user is logged in
      if (profile) {
        try {
          await updateProfile({ theme_preference: scheme });
          console.log('✅ Saved theme preference to profile');
        } catch (profileError) {
          console.warn('⚠️ Failed to save theme to profile:', profileError);
          // Still apply the theme locally even if profile save fails
        }
      }
    } catch (error) {
      console.error('❌ Failed to apply color scheme:', error);
      toast.error('Failed to change color scheme');
    }
  };

  const setUIDensity = async (density: UIDensity) => {
    try {
      console.log('🎨 Changing UI density to:', density);
      setUIDensityState(density);
      
      // Apply UI density immediately for instant feedback
      applyUIDensity(density);
      
      // Save to profile if user is logged in
      if (profile) {
        try {
          await updateProfile({ ui_density_preference: density });
          console.log('✅ Saved UI density preference to profile');
        } catch (profileError) {
          console.warn('⚠️ Failed to save UI density to profile:', profileError);
          // Still apply the density locally even if profile save fails
        }
      }
    } catch (error) {
      console.error('❌ Failed to apply UI density:', error);
      toast.error('Failed to change interface density');
    }
  };

  return (
    <ThemeContext.Provider 
      value={{ 
        colorScheme, 
        setColorScheme,
        uiDensity,
        setUIDensity,
        isLoading 
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useColorScheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useColorScheme must be used within a ThemeProvider');
  }
  return context;
}