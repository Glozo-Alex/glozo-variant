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
  
  // Add temporary class to force style recalculation
  root.classList.add('theme-transition');
  
  // Remove ALL existing theme classes first
  Object.keys(THEMES).forEach(themeId => {
    root.classList.remove(`theme-${themeId}`);
  });
  
  // Force immediate reflow by triggering layout calculation
  root.offsetHeight;
  
  // Add new theme class to html element for maximum specificity
  root.classList.add(`theme-${scheme}`);
  console.log('✅ Applied theme class to html:', `theme-${scheme}`);
  
  // More aggressive style forcing
  const forceStyleUpdate = () => {
    // Force recalculation of all CSS variables
    const allElements = document.querySelectorAll('*');
    allElements.forEach(element => {
      if (element instanceof HTMLElement) {
        element.style.cssText = element.style.cssText;
      }
    });
    
    // Force document style recalculation
    document.body.style.transform = 'translateZ(0)';
    document.body.offsetHeight;
    document.body.style.transform = '';
    
    // Verify variables are applied
    const computedStyle = window.getComputedStyle(root);
    const primaryColor = computedStyle.getPropertyValue('--primary').trim();
    const backgroundColor = computedStyle.getPropertyValue('--background').trim();
    
    console.log('🔍 Current CSS variables after update:');
    console.log('  --primary:', primaryColor);
    console.log('  --background:', backgroundColor);
    console.log('  HTML classes:', root.className);
    
    // Remove transition class
    root.classList.remove('theme-transition');
    
    // Dispatch theme change event
    const event = new CustomEvent('themeChanged', { 
      detail: { 
        scheme, 
        colors: theme.colors,
        cssVariables: { primaryColor, backgroundColor },
        success: true
      } 
    });
    document.dispatchEvent(event);
    
    console.log('✅ Theme fully applied with forced updates');
  };
  
  // Apply immediately and with fallbacks
  forceStyleUpdate();
  requestAnimationFrame(forceStyleUpdate);
  setTimeout(forceStyleUpdate, 0);
  setTimeout(forceStyleUpdate, 100);
  
  // Store in localStorage
  localStorage.setItem('color-scheme', scheme);
};