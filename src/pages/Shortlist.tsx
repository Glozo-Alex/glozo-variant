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
import { useEffect, useState } from "react";
import { getShortlistForProject, removeFromShortlist } from "@/services/shortlist";
import { getCachedCandidateDetails, getCandidateDetails } from "@/services/candidateDetails";
import { useToast } from "@/hooks/use-toast";
import { ContactInfo } from "@/components/ContactInfo";
import { CandidateProfile } from "@/components/CandidateProfile";

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
  
  const project = projects.find(p => p.id === projectId);

  useEffect(() => {
    const fetchShortlistedCandidates = async () => {
      if (!projectId) return;
      
      try {
        setLoading(true);
        setError(null);
        const shortlist = await getShortlistForProject(projectId);
        
        // Get numeric candidate IDs for fetching details
        const numericIds = shortlist
          .map(item => parseInt(item.candidate_id, 10))
          .filter(Number.isFinite);
        
        // Fetch cached candidate details
        const detailsMap = await getCachedCandidateDetails(numericIds, projectId);
        
        // Transform the data to match the component's expected format
        const transformedCandidates = shortlist.map((item) => {
          const candidateData = item.candidate_snapshot as any;
          const numericId = parseInt(item.candidate_id, 10);
          const details = detailsMap[numericId];
          
          // Use details from cache if available, fallback to snapshot
          const name = details?.name || candidateData.name || 'Unknown';
          const title = details?.title || details?.role || candidateData.title || 'No title';
          const company = details?.employer || candidateData.company || 'Unknown company';
          const location = details?.location || candidateData.location || 'Unknown location';
          
          // Handle skills - prioritize details, fallback to snapshot
          let processedSkills: string[] = [];
          if (details?.skills) {
            // Flatten skills from details (array of clusters)
            processedSkills = details.skills.flatMap(skillCluster => 
              Array.isArray(skillCluster) ? skillCluster : [skillCluster]
            ).filter(Boolean);
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
          
          return {
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
        });
        
        setShortlistedCandidates(transformedCandidates);
        
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
        console.error('Failed to fetch shortlisted candidates:', error);
        setError('Failed to load shortlisted candidates');
      } finally {
        setLoading(false);
      }
    };

    fetchShortlistedCandidates();
  }, [projectId]);

  const handleRemoveFromShortlist = async (candidateId: string, candidateName: string) => {
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
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('shortlist-view-mode', mode);
  };

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
              <p className="text-2xl font-bold text-primary">{shortlistedCandidates.length}</p>
              <p className="text-sm text-muted-foreground">candidates shortlisted</p>
            </div>
          </div>
        </div>
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
      ) : shortlistedCandidates.length > 0 ? (
        viewMode === 'cards' ? (
          /* Cards View */
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {shortlistedCandidates.map((candidate) => (
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
          /* Table View */
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Candidate</TableHead>
                  <TableHead className="w-[200px]">Company & Location</TableHead>
                  <TableHead className="w-[80px]">Match</TableHead>
                  <TableHead className="w-[200px]">Skills</TableHead>
                  <TableHead className="w-[200px]">Contacts</TableHead>
                  <TableHead className="w-[200px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shortlistedCandidates.map((candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 ring-2 ring-primary/20">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                            {candidate.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="font-medium truncate">{candidate.name}</div>
                          <div className="text-sm text-muted-foreground truncate" title={candidate.title}>
                            {candidate.title}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium truncate">{candidate.company}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{candidate.location}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getMatchColor(candidate.match)} text-white font-semibold`}>
                        {candidate.match}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {candidate.skills.slice(0, 2).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
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
                            <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted">
                              +{candidate.skills.length - 2}
                            </Badge>
                          </CandidateProfile>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <ContactInfo candidate={candidate} size="sm" />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" className="h-8">
                          <Mail className="h-3 w-3" />
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
                          <Button size="sm" variant="outline" className="h-8">
                            View
                          </Button>
                        </CandidateProfile>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleRemoveFromShortlist(candidate.id, candidate.name)}
                          className="h-8 text-destructive hover:text-destructive"
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
            <h3 className="text-xl font-medium mb-2">No candidates shortlisted</h3>
            <p className="text-muted-foreground mb-6">
              Start adding candidates to your shortlist from the search results
            </p>
            <Button onClick={() => navigate(`/project/${projectId}/results`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Search Results
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Shortlist;