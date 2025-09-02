import { useParams } from "react-router-dom";
import { useProject } from "@/contexts/ProjectContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Star, Mail, Phone, MapPin, Calendar, ArrowLeft } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { useNavigate } from "react-router-dom";

const Shortlist = () => {
  const { projectId } = useParams();
  const { projects } = useProject();
  const navigate = useNavigate();
  
  const project = projects.find(p => p.id === projectId);

  // Mock shortlisted candidates data
  const shortlistedCandidates = [
    {
      id: 1,
      name: "Sarah Chen",
      title: "Senior Frontend Developer",
      company: "TechFlow Inc.",
      location: "San Francisco, CA",
      match: 95,
      rating: 4.8,
      skills: ["React", "TypeScript", "Node.js", "GraphQL"],
      experience: "5 years",
      email: "sarah.chen@example.com",
      phone: "+1 (555) 123-4567",
      addedAt: "2024-01-15",
      avatar: "SC"
    },
    {
      id: 2,
      name: "Marcus Rodriguez",
      title: "Full Stack Engineer",
      company: "DataViz Solutions",
      location: "Austin, TX",
      match: 88,
      rating: 4.6,
      skills: ["React", "Python", "AWS", "Docker"],
      experience: "4 years",
      email: "marcus.r@example.com",
      phone: "+1 (555) 987-6543",
      addedAt: "2024-01-14",
      avatar: "MR"
    },
    {
      id: 3,
      name: "Emily Zhang",
      title: "Software Engineer",
      company: "CloudFirst",
      location: "Remote",
      match: 92,
      rating: 4.9,
      skills: ["Vue.js", "TypeScript", "Kubernetes", "MongoDB"],
      experience: "3 years",
      email: "emily.zhang@example.com",
      phone: "+1 (555) 456-7890",
      addedAt: "2024-01-13",
      avatar: "EZ"
    }
  ];

  if (!project) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-background via-background to-accent/10">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Project not found</h1>
            <p className="text-muted-foreground">The requested project could not be found.</p>
          </div>
        </main>
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
    <div className="flex h-screen bg-gradient-to-br from-background via-background to-accent/10">
      <Sidebar />
      <main className="flex-1 overflow-auto">
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

          {/* Shortlisted Candidates */}
          {shortlistedCandidates.length > 0 ? (
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
      </main>
    </div>
  );
};

export default Shortlist;