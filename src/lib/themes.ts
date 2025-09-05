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
  const root = document.documentElement;
  const theme = THEMES[scheme];
  
  console.log('🎨 Applying color scheme:', scheme, theme);
  
  // Add transition class for smooth changes
  root.classList.add('theme-transition');
  
  // Get current dark/light mode from next-themes
  const isDarkMode = root.classList.contains('dark');
  console.log('🌓 Current mode:', isDarkMode ? 'dark' : 'light');
  
  // Remove ALL existing theme classes (including combined ones)
  Object.keys(THEMES).forEach(themeId => {
    root.classList.remove(`theme-${themeId}`);
    console.log('🗑️ Removed theme class:', `theme-${themeId}`);
  });
  
  // Add new theme class
  root.classList.add(`theme-${scheme}`);
  console.log('✅ Applied theme class:', `theme-${scheme}`);
  
  // Force immediate DOM update and style recalculation
  root.offsetHeight; // Force reflow
  
  // Force update CSS properties by triggering a repaint
  const forceRepaint = () => {
    root.style.display = 'none';
    root.offsetHeight; // Trigger reflow
    root.style.display = '';
  };
  
  // Wait for next frame to ensure styles are applied
  requestAnimationFrame(() => {
    forceRepaint();
    
    // Force style recalculation
    const computedStyle = window.getComputedStyle(root);
    const primaryColor = computedStyle.getPropertyValue('--primary').trim();
    const backgroundColor = computedStyle.getPropertyValue('--background').trim();
    
    console.log('🔍 Applied CSS variables:');
    console.log('  --primary:', primaryColor);
    console.log('  --background:', backgroundColor);
    
    // Validate that the theme was applied
    if (!primaryColor || primaryColor === 'initial' || primaryColor === 'inherit') {
      console.warn('⚠️ Theme may not have applied correctly. Force updating all elements...');
      
      // Force all elements to recalculate their styles
      const allElements = document.querySelectorAll('*');
      allElements.forEach(el => {
        if (el instanceof HTMLElement) {
          el.style.transform = 'translateZ(0)';
          el.offsetHeight; // Trigger reflow
          el.style.transform = '';
        }
      });
      
      // Check again after force update
      const retryPrimary = window.getComputedStyle(root).getPropertyValue('--primary').trim();
      console.log('🔄 After force update --primary:', retryPrimary);
    }
    
    // Dispatch custom event to notify components about theme change
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