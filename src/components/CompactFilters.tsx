import React, { useState } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface FilterGroup {
  name: string;
  values: Array<{ name: string; count: number }>;
}

interface CompactFiltersProps {
  availableFilters: Record<string, FilterGroup>;
  selectedFilters: Record<string, string[]>;
  onFiltersChange: (filters: Record<string, string[]>) => void;
}

const CompactFilters = ({ availableFilters, selectedFilters, onFiltersChange }: CompactFiltersProps) => {
  const [openFilter, setOpenFilter] = useState<string | null>(null);

  const handleFilterToggle = (category: string, value: string, checked: boolean) => {
    const currentFilters = { ...selectedFilters };
    
    if (!currentFilters[category]) {
      currentFilters[category] = [];
    }
    
    if (checked) {
      currentFilters[category] = [...currentFilters[category], value];
    } else {
      currentFilters[category] = currentFilters[category].filter(v => v !== value);
      if (currentFilters[category].length === 0) {
        delete currentFilters[category];
      }
    }
    
    onFiltersChange(currentFilters);
  };

  const removeFilter = (category: string, value: string) => {
    handleFilterToggle(category, value, false);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const activeFilterCount = Object.values(selectedFilters).reduce((acc, values) => acc + values.length, 0);
  const safeAvailableFilters = availableFilters || {};

  return (
    <div className="flex items-center gap-2 p-2 border-b border-border bg-muted/20">
      <div className="flex items-center gap-1">
        {Object.entries(safeAvailableFilters).map(([category, filterGroup]) => (
          <Popover 
            key={category} 
            open={openFilter === category} 
            onOpenChange={(open) => setOpenFilter(open ? category : null)}
          >
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-xs border border-border hover:bg-muted/50"
              >
                {filterGroup.name}
                {selectedFilters[category] && selectedFilters[category].length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                    {selectedFilters[category].length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2" align="start">
              <div className="space-y-1">
                <div className="text-xs font-medium text-foreground mb-2">{filterGroup.name}</div>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {filterGroup.values?.map((item, index) => {
                    if (!item || !item.name) return null;
                    
                    const value = String(item.name).trim();
                    const count = Number(item.count || 0);
                    const key = `${category}-${value}-${index}`;
                    
                    return (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={key}
                          checked={selectedFilters[category]?.includes(value) || false}
                          onCheckedChange={(checked) => {
                            handleFilterToggle(category, value, checked as boolean);
                          }}
                          className="h-3 w-3"
                        />
                        <label 
                          htmlFor={key} 
                          className="text-xs text-foreground flex-1 cursor-pointer"
                        >
                          {value}
                        </label>
                        <span className="text-[10px] text-muted-foreground">({count})</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        ))}
        
        {activeFilterCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearAllFilters}
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        )}
      </div>

      <div className="flex items-center gap-1 ml-auto">
        {Object.entries(selectedFilters).map(([category, values]) =>
          values.map(value => (
            <Badge 
              key={`${category}-${value}`} 
              variant="secondary" 
              className="flex items-center gap-1 text-[10px] h-5 px-1 bg-primary/10 text-primary border-primary/20"
            >
              {value}
              <button
                onClick={() => removeFilter(category, value)}
                className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
              >
                <X className="h-2 w-2" />
              </button>
            </Badge>
          ))
        )}
      </div>
    </div>
  );
};

export default CompactFilters;