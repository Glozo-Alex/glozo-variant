import React from 'react';
import { Monitor, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useColorScheme } from '@/contexts/ThemeContext';
import { UIDensity } from '@/lib/themes';

interface UIDensityToggleProps {
  className?: string;
}

export function UIDensityToggle({ className }: UIDensityToggleProps) {
  const { uiDensity, setUIDensity, isLoading } = useColorScheme();

  const toggleDensity = () => {
    const newDensity: UIDensity = uiDensity === 'default' ? 'compact' : 'default';
    setUIDensity(newDensity);
  };

  const Icon = uiDensity === 'compact' ? Layout : Monitor;
  const tooltipText = uiDensity === 'compact' 
    ? 'Switch to Comfortable view' 
    : 'Switch to Professional view';

  if (isLoading) {
    return <div className="h-[var(--ui-button-height-default)] w-[var(--ui-button-height-default)] animate-pulse bg-muted rounded-[var(--ui-border-radius-sm)]" />;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDensity}
            className={className}
            aria-label={tooltipText}
          >
            <Icon className="h-[var(--ui-icon-md)] w-[var(--ui-icon-md)]" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}