import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProject } from "@/contexts/ProjectContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Copy, Clock, FileText, Upload, ExternalLink } from "lucide-react";
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
  const [similarRoles, setSimilarRoles] = useState(false);
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
      const project = await createProject(projectName, searchQuery, similarRoles, true);
      
      // Then perform the search
      const apiRes = await getCandidatesByChat({ 
        message: searchQuery, 
        similarRoles, 
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-3">Find Your Perfect Candidates</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Describe the role you're hiring for and let our AI find the best matching candidates from our database
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {/* Main Search Area - Center */}
          <div className="lg:col-span-3 space-y-8">
            {/* Search Input Area */}
            <div className="bg-card rounded-lg border shadow-sm p-8">
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="search-query" className="text-base font-medium">
                    Describe your ideal candidate
                  </Label>
                  <Input
                    id="search-query"
                    placeholder="e.g., Senior React developer with 5+ years experience for fintech startup..."
                    className="text-base h-12"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Use natural language to describe the role, skills, experience level, and any specific requirements
                  </p>
                </div>

                {/* Options Row */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center space-x-3">
                    <Switch
                      id="similar-roles"
                      checked={similarRoles}
                      onCheckedChange={setSimilarRoles}
                    />
                    <Label htmlFor="similar-roles" className="text-sm font-medium">
                      Include similar roles
                    </Label>
                  </div>
                  
                  <FileUploadButton onFileContent={handleFileContent} />
                </div>

                {/* Search Button */}
                <Button 
                  onClick={handleCreateProject} 
                  className="w-full h-12 text-base font-medium" 
                  size="lg" 
                  disabled={isLoading || !searchQuery.trim()}
                >
                  <Search className="h-5 w-5 mr-2" />
                  {isLoading ? "Searching candidates..." : "Search Candidates"}
                </Button>
              </div>
            </div>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-lg font-semibold text-foreground">Recent Searches</h2>
                </div>
                <div className="grid gap-3">
                  {recentSearches.map((search) => (
                    <Button
                      key={search.id}
                      variant="outline"
                      className="h-auto p-4 text-left justify-start hover:bg-muted/50"
                      onClick={() => handleRecentSearchClick(search)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {search.prompt}
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span>{new Date(search.created_at).toLocaleDateString()}</span>
                          {search.candidate_count && (
                            <span>{search.candidate_count} candidates found</span>
                          )}
                        </div>
                      </div>
                      <Copy className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - Information */}
          <div className="space-y-6">
            {/* Search Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Search Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {searchTips.map((tip, index) => (
                  <div key={index} className="space-y-1">
                    <p className="text-sm font-medium text-foreground">{tip.title}</p>
                    <p className="text-xs text-muted-foreground">{tip.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Example Queries */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Example Searches</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {exampleQueries.map((example, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left h-auto p-3 text-xs hover:bg-muted/50 whitespace-normal"
                    onClick={() => handleExampleClick(example)}
                  >
                    <Copy className="h-3 w-3 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="flex-1">{example}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Help Articles */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Help & Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {helpArticles.map((article, index) => (
                  <a
                    key={index}
                    href={article.href}
                    className="block p-3 rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{article.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{article.description}</p>
                      </div>
                      <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    </div>
                  </a>
                ))}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Search Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">2.5M+</p>
                  <p className="text-xs text-muted-foreground">Candidates in database</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">95%</p>
                  <p className="text-xs text-muted-foreground">Average match accuracy</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
export default NewSearch;