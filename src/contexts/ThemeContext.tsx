import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { ColorScheme, applyColorScheme } from '@/lib/themes';
import { useProfile } from '@/hooks/useProfile';

interface ThemeContextType {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme, setTheme } = useTheme();
  const { profile, updateProfile } = useProfile();
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>('default');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize color scheme from profile or localStorage
  useEffect(() => {
    const initializeColorScheme = () => {
      let initialScheme: ColorScheme = 'default';
      
      // Priority: profile preference > localStorage > default
      if (profile?.theme_preference) {
        initialScheme = profile.theme_preference as ColorScheme;
      } else {
        const stored = localStorage.getItem('color-scheme') as ColorScheme;
        if (stored && ['default', 'ocean', 'sunset', 'forest'].includes(stored)) {
          initialScheme = stored;
        }
      }
      
      setColorSchemeState(initialScheme);
      
      // Ensure DOM is ready before applying colors
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          applyColorScheme(initialScheme);
        });
      } else {
        applyColorScheme(initialScheme);
      }
      
      setIsLoading(false);
    };

    initializeColorScheme();
  }, [profile]);

  const setColorScheme = async (scheme: ColorScheme) => {
    try {
      setColorSchemeState(scheme);
      
      // Apply color scheme immediately for instant feedback
      applyColorScheme(scheme);
      
      // Save to profile if user is logged in
      if (profile) {
        await updateProfile({ theme_preference: scheme });
      }
    } catch (error) {
      console.error('Failed to save color scheme:', error);
    }
  };

  return (
    <ThemeContext.Provider 
      value={{ 
        colorScheme, 
        setColorScheme, 
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