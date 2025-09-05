import React from "react";
import { Filter, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface FilterGroup {
  name: string;
  values: Array<{ value: string; count: number } | string | any>;
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
              {availableFilters[category]?.name || category.replace(/_/g, ' ')}
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

      {/* Dropdown panel with fixed positioning to avoid chat overlap */}
      {isOpen && (
        <>
          {/* Overlay to close dropdown when clicking outside */}
          <div 
            className="fixed inset-0 z-[99998]" 
            onClick={() => setIsOpen(false)}
          />
          <div 
            className="fixed top-20 left-4 w-80 bg-background border rounded-lg shadow-2xl z-[99999] p-4 max-h-[70vh] overflow-y-auto" 
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
              console.log('🔍 Rendering filter group:', category);
              console.log('📊 Filter group data:', filterGroup);
              console.log('📋 Filter group values:', filterGroup?.values);
              
              if (!filterGroup || !filterGroup.values || !Array.isArray(filterGroup.values)) {
                console.warn('❌ Invalid filter group structure for category:', category, filterGroup);
                return null;
              }
              
              return (
                <div key={category} className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground capitalize">
                    {filterGroup?.name || category.replace(/_/g, ' ')}
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {filterGroup.values.map((item, index) => {
                      console.log(`🔍 Processing filter item [${index}]:`, typeof item, item);
                      
                      // Ensure we have a valid structure
                      if (item === null || item === undefined) {
                        console.warn('❌ Null/undefined filter item at index:', index);
                        return null;
                      }
                      
                      // Safely extract and convert values
                      let value = '';
                      let count = 0;
                      
                      // Handle different data structures
                      if (typeof item === 'string') {
                        value = item;
                        count = 0;
                      } else if (typeof item === 'object' && item !== null) {
                        // Handle various object structures with safe property access
                        const obj = item as any;
                        value = obj.value || obj.name || obj.label || obj.title || '';
                        count = Number(obj.count || obj.frequency || obj.total || 0);
                        
                        // If value is still an object, try to stringify it properly
                        if (typeof value === 'object') {
                          value = JSON.stringify(value);
                        }
                      } else {
                        value = String(item || '');
                        count = 0;
                      }
                      
                      // Ensure value is a string
                      value = String(value).trim();
                      
                      // Skip empty values
                      if (!value.trim()) {
                        console.warn('❌ Skipping empty filter value:', item);
                        return null;
                      }
                      
                      const key = `${category}-${value}-${index}`;
                      
                      return (
                        <div key={key} className="flex items-center space-x-2">
                          <Checkbox
                            id={key}
                            checked={selectedFilters[category]?.includes(value) || false}
                            onCheckedChange={(checked) => 
                              handleFilterToggle(category, value, checked as boolean)
                            }
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