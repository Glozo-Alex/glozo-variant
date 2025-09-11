import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CandidateCard from "./CandidateCard";
import CandidateTable from "./CandidateTable";
import CandidateFilters from "./CandidateFilters";
import CompactFilters from "./CompactFilters";
import { ViewToggle } from "./ViewToggle";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getShortlistStatus } from "@/services/shortlist";
import { useProject } from "@/contexts/ProjectContext";
import { useColorScheme } from "@/contexts/ThemeContext";
import { useViewPreference } from "@/hooks/useViewPreference";

interface APICandidate {
  id?: number | string;
  name?: string;
  employer?: string;
  role?: string;
  title?: string;
  location?: string;
  years_of_experience?: string;
  average_years_of_experience?: string;
  match_score?: number;
  match_percentage?: number;
  ai_summary?: string;
  standout?: string;
  skills?: Array<{ cluster?: string; skills?: string[] }>;
  open_to_offers?: boolean;
  social?: Array<{ platform: string; url: string }>;
  salary?: string;
  seniority_level?: string;
  degree?: string;
  domain?: string;
  time_overlap?: number;
}

const CandidateList = () => {
  const { projectId } = useParams();
  const { updateShortlistCount } = useProject();
  const { uiDensity } = useColorScheme();
  const { view } = useViewPreference();
  const [status, setStatus] = useState<"pending" | "completed" | "failed" | "idle">("idle");
  const [sortColumn, setSortColumn] = useState<string>('match');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [candidates, setCandidates] = useState<APICandidate[]>([]);
  const [candidateCount, setCandidateCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shortlistStatus, setShortlistStatus] = useState<Record<string, boolean>>({});
  const [availableFilters, setAvailableFilters] = useState<Record<string, any>>({});
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});

  const fetchLatestSearch = useCallback(async () => {
    if (!projectId) return;
    
    try {
      console.log('🔍 CandidateList: Fetching search results for projectId:', projectId);
      
      const { data, error } = await supabase
        .from("searches")
        .select("id, status, raw_response, candidate_count, created_at")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      console.log('📊 CandidateList: Search data received:', data);

      if (error) throw error;

      if (!data) {
        console.log('🚫 CandidateList: No search data found');
        setStatus("idle");
        setCandidates([]);
        setCandidateCount(0);
        setAvailableFilters({});
        return;
      }

      const st = (data.status as any) ?? "pending";
      const raw = data.raw_response as any;
      
      // For candidates display, only show results from completed searches
      const fromArray = (st === 'completed' && Array.isArray(raw?.candidates)) ? raw.candidates : [];
      const count = Array.isArray(fromArray) ? fromArray.length : (data.candidate_count ?? 0);

      console.log('👥 CandidateList: Candidates array length:', fromArray.length, 'Status:', st);

      // Extract filters from raw response
      const filters = raw?.filters || {};
      const processedFilters = extractFiltersFromResponse(filters, fromArray);

      setStatus(st);
      setCandidates(fromArray);
      setCandidateCount(count);
      setAvailableFilters(processedFilters);
      
      // Load shortlist status for candidates
      if (fromArray.length > 0) {
        try {
          const candidateIds = fromArray.map((c: APICandidate) => String(c.id || ''));
          const shortlistMap = await getShortlistStatus(projectId, candidateIds);
          setShortlistStatus(shortlistMap);
        } catch (error) {
          console.error('Failed to load shortlist status:', error);
        }
      }
    } catch (e: any) {
      setError(e?.message ?? "Failed to load search results");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;

    let cancelled = false;
    let timer: number | undefined;

    // Initial fetch
    fetchLatestSearch();
    
    // Set up polling only if needed
    const setupPolling = () => {
      timer = setInterval(() => {
        if (cancelled) return;
        fetchLatestSearch();
      }, 3000) as unknown as number;
    };

    // Start polling if status is pending or idle
    if (status === "pending" || status === "idle") {
      setupPolling();
    }

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
    };
  }, [projectId, fetchLatestSearch]);

  // Stop polling when status changes to completed
  useEffect(() => {
    // This effect will run when status changes
    // No need to do anything here as the cleanup in the main useEffect handles stopping
  }, [status]);

  // Extract filters from API response
  const extractFiltersFromResponse = (filters: any, candidates: APICandidate[]) => {
    const processedFilters: Record<string, any> = {};

    // Process each filter category directly from API structure
    Object.entries(filters).forEach(([category, items]) => {
      if (Array.isArray(items)) {
        let categoryName = category.replace(/_/g, ' ');
        
        // Customize category names
        switch (category) {
          case 'domain':
            categoryName = 'Domain';
            break;
          case 'education':
            categoryName = 'Education';
            break;
          case 'time_overlap':
            categoryName = 'Time Overlap';
            break;
          case 'open_to_offers':
            categoryName = 'Open to Offers';
            break;
        }

        processedFilters[category] = {
          name: categoryName,
          values: items
            .map((item: any) => {
              let name = '';
              let count = Number(item?.count || 0);

              // Extract name from API structure
              if (typeof item === 'object' && item !== null) {
                name = String(item.name || '').trim();
              }

              // Special handling for specific categories
              if (category === 'time_overlap' && name) {
                name = `${name} hours`;
              }
              
              if (category === 'open_to_offers' && name === 'True') {
                name = 'Yes';
              }

              return { name, count };
            })
            .filter(item => item.name) // Remove empty names
        };
      }
    });

    return processedFilters;
  };

  // Filter candidates based on selected filters
  const filteredCandidates = useMemo(() => {
    if (Object.keys(selectedFilters).length === 0) return candidates;

    return candidates.filter(candidate => {
      return Object.entries(selectedFilters).every(([category, values]) => {
        if (values.length === 0) return true;

        switch (category) {
          case 'domain':
            return values.includes(candidate.domain || '');
          case 'education':
            return values.includes(candidate.degree || '');
          case 'time_overlap':
            const timeOverlapValue = `${candidate.time_overlap || 0} hours`;
            return values.includes(timeOverlapValue);
          case 'open_to_offers':
            const candidateOpenToOffers = candidate.open_to_offers ? 'Yes' : 'No';
            return values.includes(candidateOpenToOffers);
          default:
            return true;
        }
      });
    });
  }, [candidates, selectedFilters]);

  const handleShortlistToggle = useCallback(async (candidateId: string, isShortlisted: boolean) => {
    // Update local state immediately for optimistic UI
    setShortlistStatus(prev => ({
      ...prev,
      [candidateId]: isShortlisted
    }));

    // Update project shortlist count
    if (projectId) {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('shortlist_count')
          .eq('id', projectId)
          .single();
        
        if (!error && data) {
          updateShortlistCount(projectId, data.shortlist_count);
        }
      } catch (error) {
        console.error('Failed to update shortlist count:', error);
      }
    }
  }, [projectId, updateShortlistCount]);

  const handleSort = useCallback((column: string) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  }, [sortColumn]);

  const sortedCandidates = useMemo(() => {
    if (!sortColumn) return filteredCandidates;
    
    return [...filteredCandidates].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortColumn) {
        case 'name':
          aValue = a.name || '';
          bValue = b.name || '';
          break;
        case 'title':
          aValue = a.title || a.role || '';
          bValue = b.title || b.role || '';
          break;
        case 'location':
          aValue = a.location || '';
          bValue = b.location || '';
          break;
        case 'experience':
          aValue = parseInt(a.years_of_experience || a.average_years_of_experience || '0');
          bValue = parseInt(b.years_of_experience || b.average_years_of_experience || '0');
          break;
        case 'match':
          aValue = a.match_score || a.match_percentage || 0;
          bValue = b.match_score || b.match_percentage || 0;
          break;
        default:
          return 0;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      } else {
        const comparison = (aValue as number) - (bValue as number);
        return sortDirection === 'asc' ? comparison : -comparison;
      }
    });
  }, [filteredCandidates, sortColumn, sortDirection]);

  const headerText = useMemo(() => {
    if (loading) return "Loading candidates...";
    if (error) return "Failed to load candidates";
    if (status === "pending" || status === "idle") return "Searching candidates...";
    if (status === "failed") return "Search failed";
    const filteredCount = filteredCandidates.length;
    const totalCount = candidateCount;
    return filteredCount !== totalCount 
      ? `Found Candidates (${filteredCount} of ${totalCount})`
      : `Found Candidates (${totalCount})`;
  }, [loading, error, status, candidateCount, filteredCandidates.length]);

  const isCompactUI = uiDensity === 'compact';

  // Prepare data for table view
  const tableData = sortedCandidates.map((c, idx) => {
    const flatSkills: string[] = (c.skills ?? [])
      .flatMap((s) => s.skills ?? [])
      .filter(Boolean)
      .slice(0, 8);

    const socialLinks = (c.social ?? []).map((social: any) => ({
      platform: social.platform || 'globe',
      url: social.url || '#'
    }));

    return {
      candidateId: String(c.id || idx),
      projectId: projectId || '',
      name: c.name || "Unnamed",
      title: c.title || c.role || "Unknown role",
      location: c.location || "Unknown location",
      experience: c.years_of_experience || c.average_years_of_experience || "—",
      matchPercentage: Math.round((c.match_score ?? c.match_percentage ?? 0) as number),
      description: c.standout || c.ai_summary || "",
      skills: flatSkills.map((s) => ({ name: s, type: "primary" as const })),
      openToOffers: Boolean(c.open_to_offers),
      isShortlisted: shortlistStatus[String(c.id || idx)] || false,
      onShortlistToggle: handleShortlistToggle,
      socialLinks,
      fullCandidateData: c,
    };
  });

  return (
    <main className={`flex-1 ${isCompactUI ? 'bg-background' : 'glass-surface'} flex flex-col animate-fade-in`}>
      {/* Header */}
      <div className={`${isCompactUI ? 'h-10 px-4 border-b border-border bg-background' : 'h-14 px-6'} flex items-center justify-between`}>
        <h1 className={`${isCompactUI ? 'text-sm' : 'text-lg'} font-semibold text-card-foreground`}>{headerText}</h1>
        {!loading && !error && candidates.length > 0 && (
          <div className="flex items-center gap-4">
            <ViewToggle />
            {!isCompactUI && (
              <CandidateFilters
                availableFilters={availableFilters}
                selectedFilters={selectedFilters}
                onFiltersChange={setSelectedFilters}
              />
            )}
          </div>
        )}
      </div>

      {/* Compact Filters */}
      {isCompactUI && !loading && !error && candidates.length > 0 && (
        <CompactFilters
          availableFilters={availableFilters}
          selectedFilters={selectedFilters}
          onFiltersChange={setSelectedFilters}
        />
      )}

      {/* Content */}
      <div className={`flex-1 overflow-auto ${isCompactUI ? '' : 'p-6 space-y-2'}`}>
        {error && (
          <div className="text-destructive">{error}</div>
        )}

        {!loading && !error && candidates.length === 0 && (
          <div className="text-muted-foreground">No candidates yet. Please wait while the search completes.</div>
        )}

        {!loading && !error && filteredCandidates.length === 0 && candidates.length > 0 && (
          <div className="text-muted-foreground">No candidates match the selected filters.</div>
        )}

        {view === 'table' ? (
          <CandidateTable 
            candidates={tableData}
            onSort={handleSort}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
          />
        ) : (
          <div className={`grid gap-6 mb-8 ${
            isCompactUI 
              ? 'grid-cols-1 xl:grid-cols-2 2xl:grid-cols-4' 
              : 'grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3'
          } ${isCompactUI ? 'p-4' : ''}`}>
            {sortedCandidates.map((c, idx) => {
              const flatSkills: string[] = (c.skills ?? [])
                .flatMap((s) => s.skills ?? [])
                .filter(Boolean)
                .slice(0, 8);

              // Extract social links from candidate data
              const socialLinks = (c.social ?? []).map((social: any) => ({
                platform: social.platform || 'globe',
                url: social.url || '#'
              }));

              return (
                <CandidateCard
                  key={`${c.id ?? idx}`}
                  candidateId={String(c.id || idx)}
                  projectId={projectId || ''}
                  name={c.name || "Unnamed"}
                  title={c.title || c.role || "Unknown role"}
                  location={c.location || "Unknown location"}
                  experience={c.years_of_experience || c.average_years_of_experience || "—"}
                  matchPercentage={Math.round((c.match_score ?? c.match_percentage ?? 0) as number)}
                  description={c.standout || c.ai_summary || ""}
                  skills={flatSkills.map((s) => ({ name: s, type: "primary" as const }))}
                  openToOffers={Boolean(c.open_to_offers)}
                  isShortlisted={shortlistStatus[String(c.id || idx)] || false}
                  onShortlistToggle={handleShortlistToggle}
                  socialLinks={socialLinks}
                  fullCandidateData={c}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={`${isCompactUI ? 'h-8 px-4 border-t border-border bg-background' : 'h-14 px-6 glass-surface'} flex items-center justify-between`}>
        <span className={`${isCompactUI ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
          {candidateCount > 0 ? (
            sortedCandidates.length !== candidateCount 
              ? `${sortedCandidates.length} of ${candidateCount} candidates`
              : `${candidateCount} candidates`
          ) : ""}
        </span>

        {!isCompactUI && view === 'grid' && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hover-scale border-card-border bg-card-hover text-card-foreground hover:bg-card-hover/70"><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" className="bg-primary text-primary-foreground hover-scale border-primary/50">1</Button>
            <Button variant="outline" size="sm" className="hover-scale border-card-border bg-card-hover text-card-foreground hover:bg-card-hover/70">2</Button>
            <Button variant="outline" size="sm" className="hover-scale border-card-border bg-card-hover text-card-foreground hover:bg-card-hover/70">3</Button>
            <span className="text-muted-foreground">...</span>
            <Button variant="outline" size="sm" className="hover-scale border-card-border bg-card-hover text-card-foreground hover:bg-card-hover/70">24</Button>
            <Button variant="outline" size="sm" className="hover-scale border-card-border bg-card-hover text-card-foreground hover:bg-card-hover/70"><ChevronRight className="h-4 w-4" /></Button>
          </div>
        )}

        <div className={`${isCompactUI ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
          {isCompactUI ? '50/page' : '20 per page'}
        </div>
      </div>
    </main>
  );
};

export default CandidateList;
