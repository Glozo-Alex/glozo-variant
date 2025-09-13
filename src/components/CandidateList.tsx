import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import CandidateCard from "./CandidateCard";
import CandidateFilters from "./CandidateFilters";
import { supabase } from "@/integrations/supabase/client";
import { getShortlistStatus } from "@/services/shortlist";
import { useProject } from "@/contexts/ProjectContext";

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
  const [status, setStatus] = useState<"pending" | "completed" | "failed" | "idle">("idle");
  const [candidates, setCandidates] = useState<APICandidate[]>([]);
  const [candidateCount, setCandidateCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shortlistStatus, setShortlistStatus] = useState<Record<string, boolean>>({});
  const [availableFilters, setAvailableFilters] = useState<Record<string, any>>({});
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  
  // Use refs to track polling state and prevent infinite re-renders
  const pollingIntervalRef = useRef<number | null>(null);
  const isPollingRef = useRef<boolean>(false);

  // Extract filters from API response - memoized to avoid recreation
  const extractFiltersFromResponse = useCallback((filters: any, candidates: APICandidate[]) => {
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
  }, []);

  const fetchLatestSearch = useCallback(async () => {
    if (!projectId) return;
    
    try {
      const { data, error } = await supabase
        .from("searches")
        .select("id, status, raw_response, candidate_count, created_at")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
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
  }, [projectId, extractFiltersFromResponse]);

  // Initial data fetch effect
  useEffect(() => {
    if (!projectId) return;
    
    fetchLatestSearch();
  }, [projectId, fetchLatestSearch]);

  // Polling effect - separate from initial fetch to prevent infinite loops
  useEffect(() => {
    if (!projectId) return;

    // Start polling if status is pending or idle
    if (status === "pending" || status === "idle") {
      if (!isPollingRef.current) {
        isPollingRef.current = true;
        pollingIntervalRef.current = setInterval(() => {
          fetchLatestSearch();
        }, 3000) as unknown as number;
      }
    } else {
      // Stop polling when status is completed or failed
      if (isPollingRef.current && pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
        isPollingRef.current = false;
      }
    }

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
        isPollingRef.current = false;
      }
    };
  }, [status]); // Only depend on status to avoid infinite loops

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

  // Scroll to top ref
  const contentRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top when candidates load
  useEffect(() => {
    if (filteredCandidates.length > 0 && contentRef.current) {
      contentRef.current.scrollTo(0, 0);
    }
  }, [filteredCandidates.length]);

  return (
    <main className="flex flex-col h-full glass-surface animate-fade-in">
      {/* Header - Fixed */}
      <div className="h-14 px-6 flex items-center justify-between shrink-0 bg-background/80 backdrop-blur border-b border-border/50">
        <h1 className="text-lg font-semibold text-card-foreground">{headerText}</h1>
        <CandidateFilters
          availableFilters={availableFilters}
          selectedFilters={selectedFilters}
          onFiltersChange={setSelectedFilters}
        />
      </div>

      {/* Content - Scrollable */}
      <div ref={contentRef} className="flex-1 overflow-auto p-6 space-y-2">
        {error && (
          <div className="text-destructive">{error}</div>
        )}

        {!loading && !error && candidates.length === 0 && (
          <div className="text-muted-foreground">No candidates yet. Please wait while the search completes.</div>
        )}

        {!loading && !error && filteredCandidates.length === 0 && candidates.length > 0 && (
          <div className="text-muted-foreground">No candidates match the selected filters.</div>
        )}

        {filteredCandidates.map((c, idx) => {
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
    </main>
  );
};

export default CandidateList;