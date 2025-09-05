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
import { useEffect, useState, useCallback, memo } from "react";
import { getShortlistForProject, removeFromShortlist } from "@/services/shortlist";
import { getCachedCandidateDetails, getCandidateDetails } from "@/services/candidateDetails";
import { useToast } from "@/hooks/use-toast";
import { ContactInfo } from "@/components/ContactInfo";
import { CandidateProfile } from "@/components/CandidateProfile";
import CandidateFilters from "@/components/CandidateFilters";

type ViewMode = 'cards' | 'table';

const Shortlist = () => {
  const { projectId } = useParams();
  const { projects, updateShortlistCount } = useProject();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [shortlistedCandidates, setShortlistedCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('shortlist-view-mode');
    return (saved as ViewMode) || 'cards';
  });
  
  // Filter states
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [availableFilters, setAvailableFilters] = useState<Record<string, any>>({});
  
  const project = projects.find(p => p.id === projectId);

  useEffect(() => {
    const fetchShortlistedCandidates = async () => {
      if (!projectId) return;
      
      console.log('Shortlist - Starting fetch for projectId:', projectId);
      
      try {
        setLoading(true);
        setError(null);
        const shortlist = await getShortlistForProject(projectId);
        console.log('Shortlist - Raw shortlist data:', shortlist);
        
        // Get numeric candidate IDs for fetching details
        const numericIds = shortlist
          .map(item => {
            const id = parseInt(item.candidate_id, 10);
            console.log('Shortlist - Parsing candidate_id:', item.candidate_id, '-> numeric:', id);
            return id;
          })
          .filter(Number.isFinite);
        
        console.log('Shortlist - Numeric IDs:', numericIds);
        
        // Fetch cached candidate details
        const detailsMap = await getCachedCandidateDetails(numericIds, projectId);
        console.log('Shortlist - Details map:', detailsMap);
        
        // Transform the data to match the component's expected format
        const transformedCandidates = shortlist.map((item, index) => {
          console.log(`Shortlist - Processing candidate ${index}:`, item);
          const candidateData = item.candidate_snapshot as any;
          const numericId = parseInt(item.candidate_id, 10);
          const details = detailsMap[numericId];
          console.log(`Shortlist - Candidate ${index} details:`, { candidateData, numericId, details });
          
          // Use details from cache if available, fallback to snapshot
          const name = details?.name || candidateData.name || 'Unknown';
          const title = details?.title || details?.role || candidateData.title || 'No title';
          const company = details?.employer || candidateData.company || 'Unknown company';
          const location = details?.location || candidateData.location || 'Unknown location';
          
          // Handle skills - prioritize details, fallback to snapshot
          let processedSkills: string[] = [];
          if (details?.skills) {
            // Flatten skills from details (array of SkillGroup objects)
            processedSkills = details.skills.flatMap(skillGroup => {
              // Handle both SkillGroup structure and direct string arrays
              if (skillGroup && typeof skillGroup === 'object' && 'skills' in skillGroup) {
                return skillGroup.skills || [];
              }
              // Fallback for direct string arrays or single strings
              return Array.isArray(skillGroup) ? skillGroup : [skillGroup];
            }).filter(skill => typeof skill === 'string' && skill.trim().length > 0);
          } else {
            // Fallback to snapshot skills
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
          
          // Prepare social links if available
          const socialLinks = details?.social || [];
          
          const result = {
            id: item.candidate_id,
            numericId,
            name,
            title,
            company,
            location,
            match: candidateData.matchPercentage || candidateData.match || 0,
            rating: candidateData.rating || 0,
            skills: processedSkills,
            experience: candidateData.experience || 'No experience',
            email: candidateData.email || 'No email',
            phone: candidateData.phone || 'No phone',
            contacts,
            socialLinks,
            addedAt: item.added_at,
            avatar: name ? name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'UN'
          };
          console.log(`Shortlist - Transformed candidate ${index}:`, result);
          return result;
        });
        
        console.log('Shortlist - Final transformed candidates:', transformedCandidates);
        setShortlistedCandidates(transformedCandidates);
        
        // Extract filters from candidates
        const filters = extractFiltersFromCandidates(transformedCandidates);
        setAvailableFilters(filters);
        
        // Check for candidates without cached details and fetch them in background
        const missingIds = numericIds.filter(id => !detailsMap[id]);
        if (missingIds.length > 0) {
          getCandidateDetails({
            candidateIds: missingIds,
            projectId
          }).then(response => {
            if (response.success) {
              // Refresh the list to include the newly fetched details
              fetchShortlistedCandidates();
            }
          }).catch(error => {
            console.error('Failed to fetch missing candidate details:', error);
          });
        }
      } catch (error) {
        console.error('Shortlist - Error in fetchShortlistedCandidates:', error);
        console.error('Shortlist - Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        setError('Failed to load shortlisted candidates');
      } finally {
        setLoading(false);
      }
    };

    fetchShortlistedCandidates();
  }, [projectId]);

  const handleRemoveFromShortlist = useCallback(async (candidateId: string, candidateName: string) => {
    if (!projectId) return;
    
    try {
      await removeFromShortlist(projectId, candidateId);
      
      // Update local state
      setShortlistedCandidates(prev => prev.filter(c => c.id !== candidateId));
      
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
  }, [projectId, shortlistedCandidates.length, updateShortlistCount, toast]);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('shortlist-view-mode', mode);
  }, []);
  
  // Filter helper functions
  const extractFiltersFromCandidates = (candidates: any[]) => {
    const filters: Record<string, any> = {};
    
    // Extract skills
    const skillsMap = new Map<string, number>();
    const companiesMap = new Map<string, number>();
    const locationsMap = new Map<string, number>();
    
    candidates.forEach(candidate => {
      // Skills
      candidate.skills?.forEach((skill: string) => {
        if (skill?.trim()) {
          skillsMap.set(skill, (skillsMap.get(skill) || 0) + 1);
        }
      });
      
      // Companies
      if (candidate.company?.trim()) {
        companiesMap.set(candidate.company, (companiesMap.get(candidate.company) || 0) + 1);
      }
      
      // Locations
      if (candidate.location?.trim()) {
        locationsMap.set(candidate.location, (locationsMap.get(candidate.location) || 0) + 1);
      }
    });
    
    filters.skills = {
      name: 'Skills',
      values: Array.from(skillsMap.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20) // Limit to top 20 skills
    };
    
    filters.companies = {
      name: 'Companies',
      values: Array.from(companiesMap.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count)
    };
    
    filters.locations = {
      name: 'Locations',
      values: Array.from(locationsMap.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count)
    };
    
    return filters;
  };
  
  const handleFiltersChange = useCallback((filters: Record<string, string[]>) => {
    setSelectedFilters(filters);
  }, []);
  
  // Filter candidates based on selected filters
  const filteredCandidates = shortlistedCandidates.filter(candidate => {
    return Object.entries(selectedFilters).every(([category, values]) => {
      if (values.length === 0) return true;
      
      switch (category) {
        case 'skills':
          return values.some(value => candidate.skills?.includes(value));
        case 'companies':
          return values.includes(candidate.company);
        case 'locations':
          return values.includes(candidate.location);
        default:
          return true;
      }
    });
  });

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
              Selected candidates for <strong>{project.name}</strong>
            </p>
          </div>
          <div className="flex items-center gap-4">
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
            
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{filteredCandidates.length}</p>
              <p className="text-sm text-muted-foreground">
                {filteredCandidates.length !== shortlistedCandidates.length 
                  ? `of ${shortlistedCandidates.length} total` 
                  : 'candidates shortlisted'
                }
              </p>
            </div>
          </div>
        </div>
        
        {/* Filters */}
        {!loading && shortlistedCandidates.length > 0 && (
          <div className="mb-6">
            <CandidateFilters
              availableFilters={availableFilters}
              selectedFilters={selectedFilters}
              onFiltersChange={handleFiltersChange}
            />
          </div>
        )}
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
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : filteredCandidates.length > 0 ? (
        viewMode === 'cards' ? (
          /* Cards View */
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCandidates.map((candidate) => (
              <Card key={candidate.id} className="glass-card hover-lift h-[440px] flex flex-col">
                <CardHeader className="pb-4 flex-shrink-0">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="w-12 h-12 ring-2 ring-primary/20">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {candidate.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-lg truncate">{candidate.name}</CardTitle>
                        <CardDescription className="truncate" title={candidate.title}>
                          {candidate.title}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={`${getMatchColor(candidate.match)} text-white font-semibold flex-shrink-0`}>
                      {candidate.match}%
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col">
                  <div className="space-y-4 flex-1">
                    {/* Company & Location */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-medium truncate">{candidate.company}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{candidate.location}</span>
                      </div>
                    </div>

                    {/* Rating & Experience */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{candidate.rating}</span>
                      </div>
                      <span className="text-muted-foreground truncate">{candidate.experience}</span>
                    </div>

                    {/* Skills */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {candidate.skills.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {candidate.skills.length > 3 && (
                          <CandidateProfile 
                            candidateData={{
                              id: candidate.numericId,
                              name: candidate.name,
                              title: candidate.title,
                              employer: candidate.company,
                              location: candidate.location,
                              contacts: candidate.contacts,
                              skills: candidate.skills
                            }}
                            socialLinks={candidate.socialLinks}
                            projectId={projectId || ''}
                          >
                            <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted">
                              +{candidate.skills.length - 3}
                            </Badge>
                          </CandidateProfile>
                        )}
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="pt-2 border-t border-border/50">
                      <ContactInfo candidate={candidate} />
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                        <Calendar className="h-4 w-4" />
                        Added {new Date(candidate.addedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Actions - Always at bottom */}
                  <div className="flex gap-2 pt-4 mt-auto flex-shrink-0">
                    <Button size="sm" className="flex-1">
                      <Mail className="h-4 w-4 mr-2" />
                      Contact
                    </Button>
                    <CandidateProfile 
                      candidateData={{
                        id: candidate.numericId,
                        name: candidate.name,
                        title: candidate.title,
                        employer: candidate.company,
                        location: candidate.location,
                        contacts: candidate.contacts,
                        skills: candidate.skills
                      }}
                      socialLinks={candidate.socialLinks}
                      projectId={projectId || ''}
                    >
                      <Button variant="outline" size="sm" className="flex-1">
                        View Profile
                      </Button>
                    </CandidateProfile>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRemoveFromShortlist(candidate.id, candidate.name)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Table View - Compact */
          <div className="rounded-lg border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="h-10">
                  <TableHead className="w-[200px]">Candidate</TableHead>
                  <TableHead className="w-[180px]">Company</TableHead>
                  <TableHead className="w-16 text-center">Match</TableHead>
                  <TableHead className="w-[150px]">Skills</TableHead>
                  <TableHead className="w-20 text-center">Contact</TableHead>
                  <TableHead className="w-24 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCandidates.map((candidate) => (
                  <TableRow key={candidate.id} className="h-12 group hover:bg-muted/50">
                    <TableCell className="p-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                            {candidate.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm truncate" title={candidate.name}>
                            {candidate.name}
                          </div>
                          <div className="text-xs text-muted-foreground truncate" title={candidate.title}>
                            {candidate.title}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="p-2">
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate" title={candidate.company}>
                          {candidate.company}
                        </div>
                        <div className="text-xs text-muted-foreground truncate" title={candidate.location}>
                          <MapPin className="h-3 w-3 inline mr-1" />
                          {candidate.location}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="p-2 text-center">
                      <Badge className={`${getMatchColor(candidate.match)} text-white text-xs`}>
                        {candidate.match}%
                      </Badge>
                    </TableCell>
                    <TableCell className="p-2">
                      <div className="flex gap-1 overflow-hidden">
                        {candidate.skills.slice(0, 2).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs whitespace-nowrap" title={skill}>
                            {skill.length > 8 ? `${skill.substring(0, 8)}...` : skill}
                          </Badge>
                        ))}
                        {candidate.skills.length > 2 && (
                          <CandidateProfile 
                            candidateData={{
                              id: candidate.numericId,
                              name: candidate.name,
                              title: candidate.title,
                              employer: candidate.company,
                              location: candidate.location,
                              contacts: candidate.contacts,
                              skills: candidate.skills
                            }}
                            socialLinks={candidate.socialLinks}
                            projectId={projectId || ''}
                          >
                            <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted whitespace-nowrap">
                              +{candidate.skills.length - 2}
                            </Badge>
                          </CandidateProfile>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="p-2 text-center">
                      <div className="flex justify-center gap-1">
                        {candidate.contacts?.emails?.length > 0 && (
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" title="Email available">
                            <Mail className="h-3 w-3" />
                          </Button>
                        )}
                        {candidate.contacts?.phones?.length > 0 && (
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" title="Phone available">
                            <Phone className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="p-2 text-center">
                      <div className="flex justify-center gap-1">
                        <CandidateProfile 
                          candidateData={{
                            id: candidate.numericId,
                            name: candidate.name,
                            title: candidate.title,
                            employer: candidate.company,
                            location: candidate.location,
                            contacts: candidate.contacts,
                            skills: candidate.skills
                          }}
                          socialLinks={candidate.socialLinks}
                          projectId={projectId || ''}
                        >
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" title="View Profile">
                            <Users className="h-3 w-3" />
                          </Button>
                        </CandidateProfile>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          onClick={() => handleRemoveFromShortlist(candidate.id, candidate.name)}
                          title="Remove from shortlist"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
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
            <h3 className="text-xl font-medium mb-2">
              {shortlistedCandidates.length === 0 
                ? "No candidates shortlisted" 
                : "No candidates match the current filters"
              }
            </h3>
            <p className="text-muted-foreground mb-6">
              {shortlistedCandidates.length === 0 
                ? "Start adding candidates to your shortlist from the search results."
                : "Try adjusting your filters or clear them to see all shortlisted candidates."
              }
            </p>
            {shortlistedCandidates.length === 0 ? (
              <Button onClick={() => navigate(`/project/${projectId}/results`)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Search Results
              </Button>
            ) : (
              <Button onClick={() => setSelectedFilters({})}>
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default memo(Shortlist);