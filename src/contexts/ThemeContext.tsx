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
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize color scheme ONCE on mount
  useEffect(() => {
    if (isInitialized) return;
    
    const initializeColorScheme = () => {
      let initialScheme: ColorScheme = 'default';
      
      // Priority: localStorage > profile preference > default
      const stored = localStorage.getItem('color-scheme') as ColorScheme;
      if (stored && ['default', 'ocean', 'sunset', 'forest'].includes(stored)) {
        initialScheme = stored;
      }
      
      // If profile is available and has a different preference, use that
      if (profile?.theme_preference && profile.theme_preference !== initialScheme) {
        initialScheme = profile.theme_preference as ColorScheme;
      }
      
      console.log('🎯 Initializing color scheme:', initialScheme);
      setColorSchemeState(initialScheme);
      
      // Apply the theme immediately, only once
      const applyInitialScheme = () => {
        console.log('⚡ Applying initial color scheme:', initialScheme);
        applyColorScheme(initialScheme);
        setIsInitialized(true);
        setIsLoading(false);
      };

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyInitialScheme);
      } else {
        applyInitialScheme();
      }
    };

    initializeColorScheme();
  }, [profile, isInitialized]);

  // Listen for theme mode changes (dark/light) and reapply ONLY if initialized
  useEffect(() => {
    if (!isInitialized || !resolvedTheme || !colorScheme) return;
    
    console.log('🌓 Theme mode changed:', resolvedTheme, 'Reapplying scheme:', colorScheme);
    // Small delay to ensure next-themes has updated the DOM
    const timer = setTimeout(() => {
      applyColorScheme(colorScheme);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [resolvedTheme, colorScheme, isInitialized]);

  // Listen for theme change events to show feedback (prevent duplicates)
  useEffect(() => {
    let lastEventTime = 0;
    
    const handleThemeChanged = (event: CustomEvent) => {
      const now = Date.now();
      // Prevent duplicate events within 1 second
      if (now - lastEventTime < 1000) {
        console.log('🚫 Duplicate theme event blocked');
        return;
      }
      lastEventTime = now;
      
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
    if (!isInitialized || scheme === colorScheme) return;
    
    try {
      console.log('🎨 Changing color scheme to:', scheme);
      setColorSchemeState(scheme);
      
      // Apply color scheme immediately
      applyColorScheme(scheme);
      
      // Save to localStorage
      localStorage.setItem('color-scheme', scheme);
      
      // Save to profile only once if user is logged in
      if (profile) {
        await updateProfile({ theme_preference: scheme });
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