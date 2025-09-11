import React from 'react';
import { Monitor, Layout } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { useColorScheme } from '@/contexts/ThemeContext';
import { UIDensity } from '@/lib/themes';

interface UIDensitySelectorProps {
  className?: string;
  showPreview?: boolean;
}

export function UIDensitySelector({ className, showPreview = true }: UIDensitySelectorProps) {
  const { uiDensity, setUIDensity, isLoading } = useColorScheme();

  const densityOptions = [
    {
      id: 'default' as UIDensity,
      name: 'Comfortable',
      description: 'Spacious layout with generous padding',
      icon: Monitor,
    },
    {
      id: 'compact' as UIDensity,
      name: 'Professional',
      description: 'Dense layout optimized for productivity',
      icon: Layout,
    },
  ];

  if (isLoading) {
    return <div className="animate-pulse h-32 bg-muted rounded-[var(--ui-border-radius-md)]" />;
  }

  return (
    <div className={className}>
      <div className="space-y-[var(--ui-spacing-md)]">
        <div>
          <h3 className="text-[var(--ui-title-size)] font-semibold mb-[var(--ui-spacing-xs)]">
            Interface Density
          </h3>
          <p className="text-sm text-muted-foreground">
            Choose how compact or spacious you want the interface to be
          </p>
        </div>

        <RadioGroup
          value={uiDensity}
          onValueChange={(value: UIDensity) => setUIDensity(value)}
          className="grid grid-cols-1 gap-[var(--ui-spacing-md)]"
        >
          {densityOptions.map((option) => (
            <div key={option.id} className="relative">
              <RadioGroupItem
                value={option.id}
                id={option.id}
                className="peer sr-only"
              />
              <Label
                htmlFor={option.id}
                className="flex items-center space-x-[var(--ui-spacing-sm)] p-[var(--ui-card-padding)] rounded-[var(--ui-border-radius-md)] border-2 border-muted peer-data-[state=checked]:border-primary cursor-pointer hover:bg-accent/50 transition-colors"
              >
                <option.icon className="h-[var(--ui-icon-md)] w-[var(--ui-icon-md)] text-muted-foreground peer-data-[state=checked]:text-primary" />
                <div className="flex-1">
                  <div className="font-medium">{option.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {option.description}
                  </div>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>

        {showPreview && (
          <div className="space-y-[var(--ui-spacing-sm)]">
            <Label className="text-sm font-medium">Preview</Label>
            <Card className="p-[var(--ui-card-padding)]">
              <div className="space-y-[var(--ui-spacing-sm)]">
                <div className="flex items-center space-x-[var(--ui-spacing-sm)]">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  This preview shows how buttons and elements will appear with the selected density.
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}