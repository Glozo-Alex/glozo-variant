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
  
  // Add transition class for smooth changes
  root.classList.add('theme-transition');
  
  // Remove ALL existing theme classes
  Object.keys(THEMES).forEach(themeId => {
    root.classList.remove(`theme-${themeId}`);
  });
  
  // Add new theme class
  root.classList.add(`theme-${scheme}`);
  console.log('✅ Applied theme class:', `theme-${scheme}`);
  
  // Force style recalculation immediately
  const forceStyleUpdate = () => {
    // Force reflow by accessing a layout property
    root.offsetHeight;
    
    // Get computed styles to validate application
    const computedStyle = window.getComputedStyle(root);
    const primaryColor = computedStyle.getPropertyValue('--primary').trim();
    const backgroundColor = computedStyle.getPropertyValue('--background').trim();
    
    console.log('🔍 Applied CSS variables:');
    console.log('  --primary:', primaryColor);
    console.log('  --background:', backgroundColor);
    
    // Validate successful application
    if (primaryColor && primaryColor !== 'initial' && primaryColor !== 'inherit') {
      console.log('✅ Theme applied successfully');
      
      // Dispatch success event
      const event = new CustomEvent('themeChanged', { 
        detail: { 
          scheme, 
          colors: theme.colors,
          success: true 
        } 
      });
      document.dispatchEvent(event);
    } else {
      console.warn('⚠️ Theme may not have applied correctly, retrying...');
      
      // Force another update cycle
      setTimeout(() => {
        root.classList.remove(`theme-${scheme}`);
        root.offsetHeight; // Force reflow
        root.classList.add(`theme-${scheme}`);
        
        // Check again
        const retryPrimary = window.getComputedStyle(root).getPropertyValue('--primary').trim();
        console.log('🔄 After retry --primary:', retryPrimary);
        
        if (retryPrimary && retryPrimary !== 'initial') {
          console.log('✅ Theme applied after retry');
          const retryEvent = new CustomEvent('themeChanged', { 
            detail: { 
              scheme, 
              colors: theme.colors,
              success: true 
            } 
          });
          document.dispatchEvent(retryEvent);
        }
      }, 100);
    }
  };
  
  // Apply immediately and also on next frame
  forceStyleUpdate();
  requestAnimationFrame(forceStyleUpdate);
  
  // Store in localStorage
  localStorage.setItem('color-scheme', scheme);
  
  // Remove transition class after animation completes
  setTimeout(() => {
    root.classList.remove('theme-transition');
  }, 300);
};