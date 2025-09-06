import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { ColorScheme, applyColorScheme } from '@/lib/themes';
import { useProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';

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
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { profile, updateProfile } = useProfile();
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>('default');
  const [isLoading, setIsLoading] = useState(true);

  // Listen for theme changes from next-themes and reapply color scheme
  useEffect(() => {
    if (resolvedTheme && colorScheme) {
      console.log('🌓 Theme mode changed:', resolvedTheme, 'Reapplying scheme:', colorScheme);
      // Wait for next-themes to finish updating the DOM
      setTimeout(() => {
        applyColorScheme(colorScheme);
      }, 50);
    }
  }, [resolvedTheme, colorScheme]);

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
      
      console.log('🎯 Initializing color scheme:', initialScheme);
      setColorSchemeState(initialScheme);
      
      // Ensure DOM is ready and next-themes has initialized before applying colors
      const applyInitialScheme = () => {
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => applyColorScheme(initialScheme), 100);
          });
        } else {
          // Wait for next-themes to initialize
          setTimeout(() => applyColorScheme(initialScheme), 100);
        }
      };

      applyInitialScheme();
      setIsLoading(false);
    };

    initializeColorScheme();
  }, [profile]);

  // Listen for theme change events to show feedback
  useEffect(() => {
    const handleThemeChanged = (event: CustomEvent) => {
      const { scheme } = event.detail;
      toast.success(`Color scheme changed to ${scheme}`, {
        duration: 2000,
      });
    };

    document.addEventListener('themeChanged', handleThemeChanged as EventListener);
    return () => {
      document.removeEventListener('themeChanged', handleThemeChanged as EventListener);
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