import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus } from 'lucide-react';

export function DensityTestCard() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>UI Density Test</CardTitle>
        <p className="text-sm text-muted-foreground">
          Test how elements scale with density
        </p>
      </CardHeader>
      <CardContent className="space-y-[var(--ui-spacing-md)]">
        <div className="space-y-[var(--ui-spacing-sm)]">
          <label className="text-sm font-medium">Search</label>
          <div className="flex gap-[var(--ui-spacing-sm)]">
            <Input 
              placeholder="Type to search..." 
              className="flex-1"
            />
            <Button size="icon">
              <Search className="h-[var(--ui-icon-sm)] w-[var(--ui-icon-sm)]" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-[var(--ui-spacing-sm)]">
          <label className="text-sm font-medium">Actions</label>
          <div className="flex gap-[var(--ui-spacing-sm)]">
            <Button size="sm" variant="outline">Cancel</Button>
            <Button size="default">Save</Button>
            <Button size="lg" variant="secondary">
              <Plus className="h-[var(--ui-icon-sm)] w-[var(--ui-icon-sm)] mr-[var(--ui-spacing-xs)]" />
              Add New
            </Button>
          </div>
        </div>
        
        <div className="space-y-[var(--ui-spacing-sm)]">
          <label className="text-sm font-medium">Tags</label>
          <div className="flex flex-wrap gap-[var(--ui-spacing-xs)]">
            <Badge variant="default">Primary</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground">
          Switch between Comfortable and Professional density modes to see the difference.
        </div>
      </CardContent>
    </Card>
  );
}