import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProject } from "@/contexts/ProjectContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Search, Copy, Clock, FileText, Upload, ExternalLink, Lightbulb, History, BarChart3, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { getCandidatesByChat } from "@/services/candidates";
import { getRecentSearches, type RecentSearch } from "@/services/searches";
import { FileUploadButton } from "@/components/FileUploadButton";
const NewSearch = () => {
  const {
    createProject
  } = useProject();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [findSimilarRoles, setFindSimilarRoles] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  useEffect(() => {
    const loadRecentSearches = async () => {
      const searches = await getRecentSearches(5);
      setRecentSearches(searches);
    };
    loadRecentSearches();
  }, []);

  const exampleQueries = [
    "Senior frontend developer with React and TypeScript experience for fintech startup",
    "Full-stack engineer, 3-5 years experience, Node.js and databases", 
    "DevOps engineer with AWS and Kubernetes experience",
    "Product designer with 5+ years experience in SaaS products",
    "Backend engineer with Python and microservices for healthcare platform"
  ];

  const searchTips = [
    {
      title: "Be specific about experience",
      description: "Include years of experience, seniority level, and specific technologies"
    },
    {
      title: "Mention industry context", 
      description: "Add industry, company size, or project types for better matches"
    },
    {
      title: "Include both technical and soft skills",
      description: "List required technologies and desired soft skills like leadership"
    },
    {
      title: "Use natural language",
      description: "Write as you would describe the role to a colleague"
    }
  ];

  const helpArticles = [
    {
      title: "Writing effective search queries",
      description: "Learn how to craft queries that find the best candidates",
      href: "#"
    },
    {
      title: "Understanding search results",
      description: "How to interpret match scores and candidate data",
      href: "#"
    },
    {
      title: "Advanced search techniques",
      description: "Tips for finding niche skills and specialized roles",
      href: "#"
    }
  ];

  const generateProjectName = () => {
    const now = new Date();
    const date = now.toLocaleDateString('en-GB').replace(/\//g, '.');
    const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    return `Search ${date} ${time}`;
  };
  const handleExampleClick = (example: string) => {
    setSearchQuery(example);
  };

  const handleRecentSearchClick = (search: RecentSearch) => {
    setSearchQuery(search.prompt);
  };

  const handleFileContent = (content: string) => {
    setSearchQuery(content);
  };
  const handleCreateProject = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search query required",
        description: "Please enter a search query",
        variant: "destructive"
      });
      return;
    }

    const projectName = generateProjectName();

    setIsLoading(true);
    try {
      // First create the temporary project in Supabase
      const project = await createProject(projectName, searchQuery, findSimilarRoles, true);
      
      // Then perform the search
      const apiRes = await getCandidatesByChat({ 
        message: searchQuery, 
        similarRoles: findSimilarRoles, 
        projectId: project.id 
      });
      const count = Array.isArray(apiRes) ? apiRes.length : Array.isArray(apiRes?.data) ? apiRes.data.length : undefined;

      toast({
        title: "Search completed",
        description: count !== undefined ? `Found ${count} candidates` : "Search completed successfully"
      });
      navigate(`/project/${project.id}/results`);
    } catch (error: any) {
      console.error("Project creation or search error:", error);
      toast({
        title: "Search failed",
        description: error?.message ?? "Unable to perform search. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-4">
        {/* Compact Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Find Candidates
          </h1>
          <p className="text-sm text-muted-foreground">
            Describe your position and let AI find the best candidates
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto w-full">
          {/* Left Column - Main Content Area (75%) */}
          <div className="lg:col-span-3">
            {/* Job Description Section - Takes only needed space */}
            <Card className="p-8 mb-6">
              <div className="flex flex-col">
                <div className="mb-6">
                  <Label htmlFor="searchQuery" className="text-xl font-semibold">
                    Job Description
                  </Label>
                  <p className="text-sm text-muted-foreground mt-2 mb-4">
                    Provide a detailed description of the position
                  </p>
                </div>
                
                 <div className="mb-6">
                   <Textarea
                     id="searchQuery"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     placeholder="e.g., Looking for a Senior React Developer with 5+ years experience in modern web technologies..."
                     className="h-[150px] resize-none text-base"
                   />
                 </div>

                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="similar-roles"
                      checked={findSimilarRoles}
                      onCheckedChange={setFindSimilarRoles}
                    />
                    <Label htmlFor="similar-roles" className="text-sm">
                      Find similar roles
                    </Label>
                  </div>
                  
                  <FileUploadButton onFileContent={handleFileContent} />
                </div>

                <Button 
                  onClick={handleCreateProject}
                  className="w-full h-14 text-lg"
                  disabled={!searchQuery.trim() || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-5 w-5" />
                      Search Candidates
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Recent Searches - Below Job Description */}
            {recentSearches.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <History className="mr-2 h-5 w-5" />
                  Recent Searches
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentSearches.slice(0, 4).map((search) => (
                    <button
                      key={search.id}
                      onClick={() => handleRecentSearchClick(search)}
                      className="text-left p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <p className="text-sm font-medium truncate mb-2">
                        {search.prompt.slice(0, 80)}...
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(search.created_at).toLocaleDateString()} • {search.candidate_count || 0} candidates
                      </p>
                    </button>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Info Panel (25%) */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              {/* Search Tips */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Lightbulb className="mr-2 h-5 w-5" />
                  Tips
                </h3>
                <div className="space-y-4">
                  {searchTips.map((tip, index) => (
                    <div key={index} className="text-sm">
                      <p className="font-medium text-foreground mb-2">{tip.title}</p>
                      <p className="text-muted-foreground leading-relaxed">{tip.description}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Example Queries */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Examples
                </h3>
                <div className="space-y-3">
                  {exampleQueries.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => handleExampleClick(example)}
                      className="w-full text-left p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-sm leading-relaxed"
                    >
                      {example.slice(0, 70)}...
                    </button>
                  ))}
                </div>
              </Card>

              {/* Statistics */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Statistics
                </h3>
                <div className="space-y-4 text-base">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Candidates</span>
                    <span className="font-semibold text-xl">2.4M+</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Active Profiles</span>
                    <span className="font-semibold text-xl">890K+</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Updated Today</span>
                    <span className="font-semibold text-xl">45K+</span>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="text-sm text-muted-foreground text-center">
                      Database updated every hour
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default NewSearch;