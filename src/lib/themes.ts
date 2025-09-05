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
  
  // Remove ALL existing theme classes first
  Object.keys(THEMES).forEach(themeId => {
    root.classList.remove(`theme-${themeId}`);
  });
  
  // Force immediate reflow
  root.offsetHeight;
  
  // Add new theme class
  root.classList.add(`theme-${scheme}`);
  console.log('✅ Applied theme class:', `theme-${scheme}`);
  
  // Force style recalculation with multiple approaches
  const validateAndUpdate = () => {
    // Force immediate style recalculation
    const computedStyle = window.getComputedStyle(root);
    const primaryColor = computedStyle.getPropertyValue('--primary').trim();
    const backgroundColor = computedStyle.getPropertyValue('--background').trim();
    
    console.log('🔍 Applied CSS variables:');
    console.log('  --primary:', primaryColor);
    console.log('  --background:', backgroundColor);
    console.log('  Current theme classes:', root.className);
    
    // Trigger reflow on body to ensure cascade update
    document.body.style.display = 'none';
    document.body.offsetHeight; // Force reflow
    document.body.style.display = '';
    
    // Dispatch success event
    const event = new CustomEvent('themeChanged', { 
      detail: { 
        scheme, 
        colors: theme.colors,
        success: true,
        appliedClasses: root.className
      } 
    });
    document.dispatchEvent(event);
    
    console.log('✅ Theme applied successfully');
  };
  
  // Apply immediately and on next frames
  validateAndUpdate();
  requestAnimationFrame(validateAndUpdate);
  setTimeout(validateAndUpdate, 50);
  
  // Store in localStorage
  localStorage.setItem('color-scheme', scheme);
};