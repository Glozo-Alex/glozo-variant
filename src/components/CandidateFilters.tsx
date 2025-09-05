import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface FilterGroup {
  name: string;
  values: Array<{ value: string; count: number }>;
}

interface CandidateFiltersProps {
  availableFilters: Record<string, FilterGroup>;
  selectedFilters: Record<string, string[]>;
  onFiltersChange: (filters: Record<string, string[]>) => void;
}

const CandidateFilters = ({ availableFilters, selectedFilters, onFiltersChange }: CandidateFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);

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

  const hasActiveFilters = Object.keys(selectedFilters).length > 0;
  const activeFilterCount = Object.values(selectedFilters).reduce((acc, values) => acc + values.length, 0);

  // Defensive check to prevent crashes
  const safeAvailableFilters = availableFilters || {};

  console.log('CandidateFilters Debug:', { availableFilters: safeAvailableFilters, selectedFilters, hasActiveFilters, activeFilterCount });

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4 bg-background border shadow-lg" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Filters</h3>
              {hasActiveFilters && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearAllFilters}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear all
                </Button>
              )}
            </div>
            
            {Object.entries(safeAvailableFilters).map(([category, filterGroup]) => (
              <div key={category} className="space-y-2">
                <h4 className="text-sm font-medium text-foreground capitalize">
                  {filterGroup?.name || category.replace(/_/g, ' ')}
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {(filterGroup?.values || []).map(({ value, count }) => (
                    <div key={value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${category}-${value}`}
                        checked={selectedFilters[category]?.includes(value) || false}
                        onCheckedChange={(checked) => 
                          handleFilterToggle(category, value, checked as boolean)
                        }
                      />
                      <label 
                        htmlFor={`${category}-${value}`} 
                        className="text-sm text-foreground flex-1 cursor-pointer"
                      >
                        {value}
                      </label>
                      <span className="text-xs text-muted-foreground">({count})</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {Object.keys(safeAvailableFilters).length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-4">
                No filters available
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Active filter tags */}
      {Object.entries(selectedFilters).map(([category, values]) =>
        values.map(value => (
          <Badge 
            key={`${category}-${value}`} 
            variant="secondary" 
            className="flex items-center gap-1 text-xs"
          >
            {value}
            <button
              onClick={() => removeFilter(category, value)}
              className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))
      )}
    </div>
  );
};

export default CandidateFilters;