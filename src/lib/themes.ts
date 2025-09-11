export type ColorScheme = 'default' | 'ocean' | 'sunset' | 'forest';
export type UIDensity = 'default' | 'compact';

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

export const applyUIDensity = (density: UIDensity) => {
  const root = document.documentElement;
  
  console.log('🎨 Applying UI density:', density);
  
  // Add transition class for smooth changes
  root.classList.add('ui-transition');
  
  // Remove existing density classes
  root.classList.remove('ui-default', 'ui-compact');
  
  // Add new density class
  root.classList.add(`ui-${density}`);
  console.log('✅ Applied UI density class:', `ui-${density}`);
  
  // Store in localStorage
  localStorage.setItem('ui-density', density);
  
  // Dispatch event to notify components
  const event = new CustomEvent('uiDensityChanged', { 
    detail: { density } 
  });
  document.dispatchEvent(event);
  console.log('📡 Dispatched uiDensityChanged event');
  
  // Remove transition class after animation completes
  setTimeout(() => {
    root.classList.remove('ui-transition');
  }, 300);
};

export const applyColorScheme = (scheme: ColorScheme) => {
  const root = document.documentElement;
  const theme = THEMES[scheme];
  
  console.log('🎨 Applying color scheme:', scheme, theme);
  
  // Add transition class for smooth changes
  root.classList.add('theme-transition');
  
  // Get current dark/light mode
  const isDarkMode = root.classList.contains('dark');
  console.log('🌓 Current mode:', isDarkMode ? 'dark' : 'light');
  
  // Remove ALL existing theme classes
  Object.keys(THEMES).forEach(themeId => {
    root.classList.remove(`theme-${themeId}`);
    console.log('🗑️ Removed theme class:', `theme-${themeId}`);
  });
  
  // Add new theme class
  root.classList.add(`theme-${scheme}`);
  console.log('✅ Applied theme class:', `theme-${scheme}`);
  
  // Force immediate style recalculation
  requestAnimationFrame(() => {
    // Verify the theme was applied correctly
    const computedStyle = window.getComputedStyle(root);
    const primaryColor = computedStyle.getPropertyValue('--primary').trim();
    const backgroundColor = computedStyle.getPropertyValue('--background').trim();
    
    console.log('🎨 Theme applied:', theme.name);
    console.log('  --secondary:', computedStyle.getPropertyValue('--secondary').trim());
    console.log('  --secondary-foreground:', computedStyle.getPropertyValue('--secondary-foreground').trim());
    
    // Dispatch event to notify components
    const event = new CustomEvent('themeChanged', { 
      detail: { scheme, isDarkMode, colors: theme.colors } 
    });
    document.dispatchEvent(event);
    console.log('📡 Dispatched themeChanged event');
  });
  
  // Store in localStorage
  localStorage.setItem('color-scheme', scheme);
  
  // Remove transition class after animation completes
  setTimeout(() => {
    root.classList.remove('theme-transition');
  }, 300);
};