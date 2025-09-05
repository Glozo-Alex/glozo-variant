export type ColorScheme = 'default' | 'ocean' | 'sunset' | 'forest';

export interface ThemeConfig {
  id: ColorScheme;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export const THEMES: Record<ColorScheme, ThemeConfig> = {
  default: {
    id: 'default',
    name: 'Emerald',
    description: 'Classic emerald-teal scheme',
    colors: {
      primary: '#10b981',
      secondary: '#14b8a6', 
      accent: '#0d9488'
    }
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    description: 'Deep blue-purple ocean theme',
    colors: {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      accent: '#06b6d4'
    }
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset',
    description: 'Warm orange-pink sunset theme',
    colors: {
      primary: '#f43f5e',
      secondary: '#ec4899',
      accent: '#f59e0b'
    }
  },
  forest: {
    id: 'forest',
    name: 'Forest',
    description: 'Natural green-earth theme',
    colors: {
      primary: '#22c55e',
      secondary: '#10b981',
      accent: '#84cc16'
    }
  }
};

export const applyColorScheme = (scheme: ColorScheme) => {
  console.log('🎨 Applying color scheme:', scheme);
  
  const root = document.documentElement;
  const theme = THEMES[scheme];
  
  if (!theme) {
    console.error('❌ Invalid theme scheme:', scheme);
    return;
  }
  
  // Remove all existing theme classes
  Object.keys(THEMES).forEach(themeId => {
    root.classList.remove(`theme-${themeId}`);
  });
  
  // Add new theme class
  root.classList.add(`theme-${scheme}`);
  
  console.log('✅ Applied theme class:', `theme-${scheme}`);
  
  // Store in localStorage
  localStorage.setItem('color-scheme', scheme);
  
  // Dispatch single event
  const event = new CustomEvent('themeChanged', { 
    detail: { scheme, colors: theme.colors } 
  });
  document.dispatchEvent(event);
};