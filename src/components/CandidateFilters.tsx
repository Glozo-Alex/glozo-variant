import React from "react";
import { Filter, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface FilterGroup {
  name: string;
  values: Array<{ name: string; count: number }>;
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
  
  
  // Ensure dropdown renders and add debug logging  
  React.useEffect(() => {
    console.log('🎛️ CandidateFilters: Component updated, isOpen:', isOpen, 'filters count:', Object.keys(safeAvailableFilters).length);
  }, [isOpen, safeAvailableFilters]);

  return (
    <div className="relative">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Active filter tags - moved to left of button */}
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

        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
          onClick={() => {
            console.log('🖱️ CandidateFilters: Button clicked, current isOpen:', isOpen);
            console.log('🖱️ CandidateFilters: Available filters:', safeAvailableFilters);
            setIsOpen(!isOpen);
          }}
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
              {activeFilterCount}
            </Badge>
          )}
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {/* Dropdown panel positioned relative to button */}
      {isOpen && (
        <>
          {/* Overlay to close dropdown when clicking outside */}
          <div 
            className="fixed inset-0 z-[9998]" 
            onClick={() => setIsOpen(false)}
          />
          <div 
            className="absolute top-full right-0 mt-2 w-80 bg-background border rounded-lg shadow-2xl z-[9999] p-4 max-h-[70vh] overflow-y-auto" 
            onClick={(e) => e.stopPropagation()}
          >
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
            
            {Object.entries(safeAvailableFilters).map(([category, filterGroup]) => {
              if (!filterGroup || !filterGroup.values || !Array.isArray(filterGroup.values)) {
                return null;
              }
              
              return (
                <div key={category} className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground capitalize">
                    {filterGroup.name || category.replace(/_/g, ' ')}
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {filterGroup.values.map((item, index) => {
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
                          />
                          <label 
                            htmlFor={key} 
                            className="text-sm text-foreground flex-1 cursor-pointer"
                          >
                            {value}
                          </label>
                          <span className="text-xs text-muted-foreground">({count})</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            
            {Object.keys(safeAvailableFilters).length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-4">
                No filters available
              </div>
            )}
          </div>
        </div>
        </>
      )}
    </div>
  );
};

export default CandidateFilters;