import { useParams } from "react-router-dom";
import { useProject } from "@/contexts/ProjectContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Star, Mail, Phone, MapPin, Calendar, ArrowLeft, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getShortlistForProject, removeFromShortlist } from "@/services/shortlist";
import { useToast } from "@/hooks/use-toast";

const Shortlist = () => {
  const { projectId } = useParams();
  const { projects, updateShortlistCount } = useProject();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [shortlistedCandidates, setShortlistedCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const project = projects.find(p => p.id === projectId);

  useEffect(() => {
    const fetchShortlistedCandidates = async () => {
      if (!projectId) return;
      
      try {
        setLoading(true);
        setError(null);
        const shortlist = await getShortlistForProject(projectId);
        
        // Transform the data to match the component's expected format
        const transformedCandidates = shortlist.map((item) => {
          const candidateData = item.candidate_snapshot as any;
          
          // Handle skills - they might be objects with {name, type} or just strings
          const skillsArray = candidateData.skills || [];
          const processedSkills = skillsArray.map((skill: any) => 
            typeof skill === 'string' ? skill : skill.name || skill
          );
          
          return {
            id: item.candidate_id,
            name: candidateData.name || 'Unknown',
            title: candidateData.title || 'No title',
            company: candidateData.company || 'Unknown company',
            location: candidateData.location || 'Unknown location',
            match: candidateData.matchPercentage || candidateData.match || 0,
            rating: candidateData.rating || 0,
            skills: processedSkills,
            experience: candidateData.experience || 'No experience',
            email: candidateData.email || 'No email',
            phone: candidateData.phone || 'No phone',
            addedAt: item.added_at,
            avatar: candidateData.name ? candidateData.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'UN'
          };
        });
        
        setShortlistedCandidates(transformedCandidates);
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
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{shortlistedCandidates.length}</p>
            <p className="text-sm text-muted-foreground">candidates shortlisted</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {shortlistedCandidates.map((candidate) => (
            <Card key={candidate.id} className="glass-card hover-lift">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      {candidate.avatar}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{candidate.name}</CardTitle>
                      <CardDescription>{candidate.title}</CardDescription>
                    </div>
                  </div>
                  <Badge className={`${getMatchColor(candidate.match)} text-white font-semibold`}>
                    {candidate.match}%
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Company & Location */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium">{candidate.company}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {candidate.location}
                  </div>
                </div>

                {/* Rating & Experience */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{candidate.rating}</span>
                  </div>
                  <span className="text-muted-foreground">{candidate.experience}</span>
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
                      <Badge variant="outline" className="text-xs">
                        +{candidate.skills.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 pt-2 border-t border-border/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{candidate.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {candidate.phone}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Added {new Date(candidate.addedAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="flex-1">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    View Profile
                  </Button>
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