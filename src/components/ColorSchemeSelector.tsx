import React from 'react';
import { Palette, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useColorScheme } from '@/contexts/ThemeContext';
import { THEMES, ColorScheme } from '@/lib/themes';

interface ColorSchemePreviewProps {
  scheme: ColorScheme;
  isSelected: boolean;
  onClick: () => void;
}

function ColorSchemePreview({ scheme, isSelected, onClick }: ColorSchemePreviewProps) {
  const theme = THEMES[scheme];
  
  return (
    <div 
      className={`relative cursor-pointer rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
        isSelected 
          ? 'border-primary shadow-md' 
          : 'border-border hover:border-primary/50'
      }`}
      onClick={onClick}
    >
      <Card className="w-full">
        <CardContent className="p-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-sm font-medium">{theme.name}</div>
              {isSelected && <Check className="h-3 w-3 text-primary" />}
            </div>
            
            <div className="flex gap-1">
              <div 
                className="w-4 h-4 rounded-full border border-border"
                style={{ backgroundColor: theme.colors.primary }}
              />
              <div 
                className="w-4 h-4 rounded-full border border-border"
                style={{ backgroundColor: theme.colors.secondary }}
              />
              <div 
                className="w-4 h-4 rounded-full border border-border"
                style={{ backgroundColor: theme.colors.accent }}
              />
            </div>
            
            <div className="text-xs text-muted-foreground">
              {theme.description}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface ColorSchemeSelectorProps {
  collapsed?: boolean;
}

export default function ColorSchemeSelector({ collapsed = false }: ColorSchemeSelectorProps) {
  const { colorScheme, setColorScheme, isLoading } = useColorScheme();

  if (isLoading) {
    return null;
  }

  const handleSchemeChange = (scheme: ColorScheme) => {
    setColorScheme(scheme);
  };

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-10 p-0 text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active transition-all duration-300"
              >
                <Palette className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" side="right" align="start">
              <div className="space-y-3">
                <div className="text-sm font-medium">Color Scheme</div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(THEMES).map((theme) => (
                    <ColorSchemePreview
                      key={theme.id}
                      scheme={theme.id}
                      isSelected={colorScheme === theme.id}
                      onClick={() => handleSchemeChange(theme.id)}
                    />
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </TooltipTrigger>
        <TooltipContent side="right">Color Schemes</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-3 py-2 h-auto text-sm text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active transition-all duration-300"
        >
          <Palette className="h-5 w-5" />
          <span>Color Schemes</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" side="right" align="start">
        <div className="space-y-3">
          <div className="text-sm font-medium">Choose Color Scheme</div>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(THEMES).map((theme) => (
              <ColorSchemePreview
                key={theme.id}
                scheme={theme.id}
                isSelected={colorScheme === theme.id}
                onClick={() => handleSchemeChange(theme.id)}
              />
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}