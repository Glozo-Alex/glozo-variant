import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CandidateCard from "./CandidateCard";
import CandidateFilters from "./CandidateFilters";
import { Button } from "@/components/ui/button";
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

  useEffect(() => {
    if (!projectId) return;

    let cancelled = false;
    let timer: number | undefined;

    const fetchLatestSearch = async () => {
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
          if (!cancelled) {
            setStatus("idle");
            setCandidates([]);
            setCandidateCount(0);
          }
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

        if (!cancelled) {
          setStatus(st);
          setCandidates(fromArray);
          setCandidateCount(count);
          setAvailableFilters(processedFilters);
          
          // Load shortlist status for candidates
          if (fromArray.length > 0 && projectId) {
            try {
              const candidateIds = fromArray.map((c: APICandidate) => String(c.id || ''));
              const shortlistMap = await getShortlistStatus(projectId, candidateIds);
              setShortlistStatus(shortlistMap);
            } catch (error) {
              console.error('Failed to load shortlist status:', error);
            }
          }
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message ?? "Failed to load search results");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    // Initial fetch and polling if pending
    fetchLatestSearch();
    timer = setInterval(fetchLatestSearch, 3000) as unknown as number;

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
    };
  }, [projectId]);

  // Extract filters from API response and candidates
  const extractFiltersFromResponse = (filters: any, candidates: APICandidate[]) => {
    const processedFilters: Record<string, any> = {};

    // Process domain filters
    if (filters.domain && Array.isArray(filters.domain)) {
      processedFilters.domain = {
        name: 'Domain',
        values: filters.domain.map((item: any) => ({
          value: item.value || item,
          count: item.count || candidates.filter(c => c.domain === (item.value || item)).length
        }))
      };
    }

    // Process education filters  
    if (filters.education && Array.isArray(filters.education)) {
      processedFilters.education = {
        name: 'Education',
        values: filters.education.map((item: any) => ({
          value: item.value || item,
          count: item.count || candidates.filter(c => c.degree === (item.value || item)).length
        }))
      };
    }

    // Process time overlap filters
    if (filters.time_overlap && Array.isArray(filters.time_overlap)) {
      processedFilters.time_overlap = {
        name: 'Time Overlap',
        values: filters.time_overlap.map((item: any) => ({
          value: `${item.value || item} hours`,
          count: item.count || candidates.filter(c => c.time_overlap === (item.value || item)).length
        }))
      };
    }

    // Process open to offers filters
    if (filters.open_to_offers && Array.isArray(filters.open_to_offers)) {
      processedFilters.open_to_offers = {
        name: 'Open to Offers',
        values: filters.open_to_offers.map((item: any) => ({
          value: item.value ? 'Yes' : 'No',
          count: item.count || candidates.filter(c => !!c.open_to_offers === !!item.value).length
        }))
      };
    }

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
            return values.some(v => v.startsWith(String(candidate.time_overlap || 0)));
          case 'open_to_offers':
            const candidateOpenToOffers = candidate.open_to_offers ? 'Yes' : 'No';
            return values.includes(candidateOpenToOffers);
          default:
            return true;
        }
      });
    });
  }, [candidates, selectedFilters]);

  const handleShortlistToggle = async (candidateId: string, isShortlisted: boolean) => {
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
  };

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

  return (
    <main className="flex-1 glass-surface flex flex-col animate-fade-in">
      {/* Header */}
      <div className="h-14 px-6 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-card-foreground">{headerText}</h1>
        <CandidateFilters
          availableFilters={availableFilters}
          selectedFilters={selectedFilters}
          onFiltersChange={setSelectedFilters}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 space-y-2">
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

      {/* Footer */}
      <div className="h-14 px-6 glass-surface flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {candidateCount > 0 ? (
            filteredCandidates.length !== candidateCount 
              ? `${filteredCandidates.length} of ${candidateCount} candidates`
              : `${candidateCount} candidates`
          ) : ""}
        </span>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hover-scale border-card-border bg-card-hover text-card-foreground hover:bg-card-hover/70"><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" className="bg-primary text-primary-foreground hover-scale border-primary/50">1</Button>
          <Button variant="outline" size="sm" className="hover-scale border-card-border bg-card-hover text-card-foreground hover:bg-card-hover/70">2</Button>
          <Button variant="outline" size="sm" className="hover-scale border-card-border bg-card-hover text-card-foreground hover:bg-card-hover/70">3</Button>
          <span className="text-muted-foreground">...</span>
          <Button variant="outline" size="sm" className="hover-scale border-card-border bg-card-hover text-card-foreground hover:bg-card-hover/70">24</Button>
          <Button variant="outline" size="sm" className="hover-scale border-card-border bg-card-hover text-card-foreground hover:bg-card-hover/70"><ChevronRight className="h-4 w-4" /></Button>
        </div>

        <div className="text-sm text-muted-foreground">20 per page</div>
      </div>
    </main>
  );
};

export default CandidateList;
