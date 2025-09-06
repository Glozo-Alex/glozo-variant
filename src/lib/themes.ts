export type ColorScheme = 'default' | 'ocean' | 'sunset' | 'forest' | 'midnight' | 'monochrome' | 'warm' | 'cyberpunk';

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
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight',
    description: 'Professional dark blue theme',
    colors: {
      primary: '#1e40af',
      secondary: '#3730a3',
      accent: '#0ea5e9'
    }
  },
  monochrome: {
    id: 'monochrome',
    name: 'Monochrome',
    description: 'Elegant black & white minimalist',
    colors: {
      primary: '#18181b',
      secondary: '#52525b',
      accent: '#71717a'
    }
  },
  warm: {
    id: 'warm',
    name: 'Warm',
    description: 'Cozy brown & cream neutrals',
    colors: {
      primary: '#a16207',
      secondary: '#d97706',
      accent: '#ea580c'
    }
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Neon purple & cyan on dark',
    colors: {
      primary: '#a855f7',
      secondary: '#06b6d4',
      accent: '#f0047f'
    }
  }
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
    // Force recomputation by briefly removing and adding the class
    root.classList.remove(`theme-${scheme}`);
    root.offsetHeight; // Trigger reflow
    root.classList.add(`theme-${scheme}`);
    
    // Verify the theme was applied correctly
    const computedStyle = window.getComputedStyle(root);
    const primaryColor = computedStyle.getPropertyValue('--primary').trim();
    const backgroundColor = computedStyle.getPropertyValue('--background').trim();
    
    console.log('🎨 Theme applied:', theme.name);
    console.log('  --primary:', primaryColor);
    console.log('  --background:', backgroundColor);
    console.log('  --secondary:', computedStyle.getPropertyValue('--secondary').trim());
    console.log('  --secondary-foreground:', computedStyle.getPropertyValue('--secondary-foreground').trim());
    console.log('  Classes on root:', Array.from(root.classList).filter(c => c.startsWith('theme-')));
    
    // Check if CSS rules exist for this theme
    const sheets = Array.from(document.styleSheets);
    const rules = sheets.flatMap(sheet => {
      try {
        return Array.from(sheet.cssRules || []);
      } catch {
        return [];
      }
    });
    const themeRule = rules.find(rule => 
      (rule as CSSStyleRule).selectorText && (rule as CSSStyleRule).selectorText.includes(`.theme-${scheme}`)
    );
    console.log('🔍 CSS rule found for theme:', !!themeRule, (themeRule as CSSStyleRule)?.selectorText);
    
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