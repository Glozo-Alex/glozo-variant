import { useParams } from "react-router-dom";
import { useProject } from "@/contexts/ProjectContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Star, Mail, Phone, MapPin, Calendar, ArrowLeft, Trash2, Grid3X3, List } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useCallback, memo, useMemo } from "react";
import { getShortlistForProject, removeFromShortlist } from "@/services/shortlist";
import { getCachedCandidateDetails } from "@/services/candidateDetails";
import { useToast } from "@/hooks/use-toast";
import { ContactInfo } from "@/components/ContactInfo";
import { CandidateProfile } from "@/components/CandidateProfile";
import ShortlistProjectSelector from "@/components/ShortlistProjectSelector";
import { ShortlistSequenceDialog } from "@/components/ShortlistSequenceDialog";
import ShortlistCandidateCard from "@/components/ShortlistCandidateCard";
import ShortlistCandidateRow from "@/components/ShortlistCandidateRow";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type ViewMode = 'cards' | 'table';

// Transform candidate data into the expected format
const transformCandidateData = (shortlistItem: any, detailsMap: Record<number, any>) => {
  const candidateData = shortlistItem.candidate_snapshot;
  const numericId = parseInt(shortlistItem.candidate_id, 10);
  const details = detailsMap[numericId];
  
  // Use details from cache if available, fallback to snapshot
  const name = details?.name || candidateData.name || 'Unknown';
  const title = details?.title || details?.role || candidateData.title || 'No title';
  const company = details?.employer || candidateData.company || 'Unknown company';
  const location = details?.location || candidateData.location || 'Unknown location';
  
  // Handle skills - prioritize details, fallback to snapshot
  let processedSkills: string[] = [];
  if (details?.skills) {
    processedSkills = details.skills.flatMap((skillGroup: any) => {
      if (skillGroup && typeof skillGroup === 'object' && 'skills' in skillGroup) {
        return skillGroup.skills || [];
      }
      return Array.isArray(skillGroup) ? skillGroup : [skillGroup];
    }).filter((skill: any) => typeof skill === 'string' && skill.trim().length > 0);
  } else {
    const skillsArray = candidateData.skills || [];
    processedSkills = skillsArray.map((skill: any) => 
      typeof skill === 'string' ? skill : skill.name || skill
    );
  }
  
  // Handle contacts - prioritize details, fallback to snapshot
  const contacts = details?.contacts || candidateData.contacts || {
    emails: candidateData.email && candidateData.email !== 'No email' ? [candidateData.email] : [],
    phones: candidateData.phone && candidateData.phone !== 'No phone' ? [candidateData.phone] : []
  };
  
  return {
    id: shortlistItem.candidate_id,
    numericId,
    name,
    title,
    company,
    location,
    match: Math.round(
      Number(
        (details as any)?.match_percentage ?? (details as any)?.match_score ?? (details as any)?.match ??
        candidateData.match_percentage ?? candidateData.match_score ?? candidateData.matchPercentage ?? candidateData.match ?? 0
      )
    ),
    rating: candidateData.rating || 0,
    skills: processedSkills,
    experience: candidateData.experience || 'No experience',
    email: candidateData.email || 'No email',
    phone: candidateData.phone || 'No phone',
    contacts,
    socialLinks: details?.social || [],
    addedAt: shortlistItem.added_at,
    avatar: name ? name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'UN'
  };
};

const Shortlist = () => {
  const { projectId } = useParams();
  const { projects, updateShortlistCount } = useProject();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('shortlist-view-mode');
    return (saved as ViewMode) || 'cards';
  });
  const [sequenceDialogOpen, setSequenceDialogOpen] = useState(false);
  
  // Fetch shortlisted candidates using React Query
  const { data: shortlistedCandidates = [], isLoading: loading, error } = useQuery({
    queryKey: ['shortlist', projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('No project ID provided');
      
      // Get shortlist data
      const shortlist = await getShortlistForProject(projectId);
      
      // Get numeric candidate IDs for fetching details
      const numericIds = shortlist
        .map(item => parseInt(item.candidate_id, 10))
        .filter(Number.isFinite);
      
      // Fetch cached candidate details
      const detailsMap = await getCachedCandidateDetails(numericIds, projectId);
      
      // Transform the data
      return shortlist.map(item => transformCandidateData(item, detailsMap));
    },
    enabled: !!projectId,
    staleTime: 30000, // Cache for 30 seconds
    refetchOnWindowFocus: false
  });
  
  // Fetch global templates for sequence creation
  const { data: globalTemplates = [] } = useQuery({
    queryKey: ['globalTemplates'],
    queryFn: async () => {
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userRes.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("global_templates")
        .select("id, name, description")
        .eq("user_id", userRes.user.id)
        .order("name");

      if (error) throw error;
      return data || [];
    }
  });
  
  const project = projects.find(p => p.id === projectId);


  const handleRemoveFromShortlist = useCallback(async (candidateId: string, candidateName: string) => {
    if (!projectId) return;
    
    try {
      await removeFromShortlist(projectId, candidateId);
      
      // Invalidate and refetch the shortlist query
      queryClient.invalidateQueries({ queryKey: ['shortlist', projectId] });
      
      // Update project shortlist count
      const newCount = shortlistedCandidates.length - 1;
      updateShortlistCount(projectId, newCount);
      
      toast({
        title: "Removed from shortlist",
        description: `${candidateName} removed from shortlist`,
      });
    } catch (error) {
      console.error('Failed to remove from shortlist:', error);
      toast({
        title: "Error",
        description: "Failed to remove candidate from shortlist",
        variant: "destructive",
      });
    }
  }, [projectId, shortlistedCandidates.length, updateShortlistCount, toast, queryClient]);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('shortlist-view-mode', mode);
  }, []);

  // Memoize error message
  const errorMessage = useMemo(() => error?.message || 'Failed to load shortlisted candidates', [error]);

  if (!project) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Project not found</h1>
          <p className="text-muted-foreground">The requested project could not be found.</p>
        </div>
      </div>
    );
  }

  const getMatchColor = (match: number) => {
    if (match >= 90) return "match-excellent";
    if (match >= 70) return "match-good";
    if (match >= 50) return "match-fair";
    return "match-poor";
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/project/${projectId}/results`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Results
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              Shortlist
            </h1>
            <p className="text-muted-foreground">
              Selected candidates for your projects
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Project Selector */}
            <ShortlistProjectSelector />
            
            {/* View Mode Switcher - Hidden on mobile */}
            <div className="hidden md:flex items-center gap-1 p-1 rounded-lg bg-muted">
              <Button
                variant={viewMode === 'cards' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewModeChange('cards')}
                className="h-8"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewModeChange('table')}
                className="h-8"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            
            {shortlistedCandidates.length > 0 && (
              <Button 
                onClick={() => setSequenceDialogOpen(true)}
                className="gap-2"
              >
                <Mail className="h-4 w-4" />
                Create Email Sequence
              </Button>
            )}
            
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{shortlistedCandidates.length}</p>
              <p className="text-sm text-muted-foreground">candidates shortlisted</p>
            </div>
          </div>
        </div>
        
        {/* No filters on Shortlist page */}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="glass-card">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div>
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <Skeleton className="w-12 h-6 rounded-full" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-14" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        /* Error State */
        <Card className="glass-card">
          <CardContent className="pt-12 pb-12 text-center">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">Error loading shortlist</h3>
            <p className="text-muted-foreground mb-6">{errorMessage}</p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['shortlist', projectId] })}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : shortlistedCandidates.length > 0 ? (
        viewMode === 'cards' ? (
          /* Cards View */
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {shortlistedCandidates.map((candidate) => (
              <ShortlistCandidateCard
                key={candidate.id}
                candidate={candidate}
                onRemove={handleRemoveFromShortlist}
                getMatchColor={getMatchColor}
              />
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="rounded-lg border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Match</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Skills</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shortlistedCandidates.map((candidate) => (
                  <ShortlistCandidateRow
                    key={candidate.id}
                    candidate={candidate}
                    onRemove={handleRemoveFromShortlist}
                    getMatchColor={getMatchColor}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )
      ) : (
        /* Empty State */
        <Card className="glass-card">
          <CardContent className="pt-12 pb-12 text-center">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">No candidates shortlisted</h3>
            <p className="text-muted-foreground mb-6">
              Start adding candidates to your shortlist from the search results.
            </p>
            <Button onClick={() => navigate(`/project/${projectId}/results`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Search Results
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Sequence Creation Dialog */}
      <ShortlistSequenceDialog
        open={sequenceDialogOpen}
        onOpenChange={setSequenceDialogOpen}
        projectId={projectId || ''}
        projectName={project?.name || ''}
        candidatesCount={shortlistedCandidates.length}
        globalTemplates={globalTemplates}
      />
    </div>
  );
};

export default memo(Shortlist);