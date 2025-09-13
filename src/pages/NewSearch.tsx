import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProject } from "@/contexts/ProjectContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { getCandidatesByChat } from "@/services/candidates";
const NewSearch = () => {
  const {
    createProject
  } = useProject();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [projectName, setProjectName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [similarRoles, setSimilarRoles] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const addSkill = (skill: string) => {
    const trimmedSkill = skill.trim();
    if (trimmedSkill && !selectedSkills.includes(trimmedSkill)) {
      setSelectedSkills([...selectedSkills, trimmedSkill]);
      setSkillInput("");
    }
  };
  const removeSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill));
  };
  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      toast({
        title: "Project name required",
        description: "Please enter a name for your project",
        variant: "destructive"
      });
      return;
    }
    if (!searchQuery.trim()) {
      toast({
        title: "Search query required",
        description: "Please enter a search query",
        variant: "destructive"
      });
      return;
    }

    const fullQuery = selectedSkills.length > 0 ? `${searchQuery} Skills: ${selectedSkills.join(", ")}` : searchQuery;

    setIsLoading(true);
    try {
      // First create the project in Supabase
      const project = await createProject(projectName, fullQuery, similarRoles);
      
      // Then perform the search
      const apiRes = await getCandidatesByChat({ 
        message: fullQuery, 
        similarRoles, 
        projectId: project.id 
      });
      const count = Array.isArray(apiRes) ? apiRes.length : Array.isArray(apiRes?.data) ? apiRes.data.length : undefined;

      toast({
        title: "Search started",
        description: count !== undefined ? `Found ${count} candidates for "${project.name}"` : `"${project.name}" is ready for candidate search`
      });
      navigate(`/project/${project.id}/results`);
    } catch (error: any) {
      console.error("Project creation or search error:", error);
      toast({
        title: "Search failed",
        description: error?.message ?? "Unable to create project and fetch candidates",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      addSkill(skillInput);
    }
  };

  const exampleQueries = [
    {
      title: "Senior Frontend Developer",
      query: "Senior frontend developer with React and TypeScript experience for fintech startup",
      category: "Frontend"
    },
    {
      title: "Full-Stack Engineer",
      query: "Full-stack engineer, 3-5 years experience, Node.js and databases",
      category: "Full-Stack"
    },
    {
      title: "DevOps Engineer",
      query: "DevOps engineer with AWS, Docker, and Kubernetes experience for scaling startup",
      category: "DevOps"
    },
    {
      title: "Backend Developer",
      query: "Senior backend developer with Python, Django, and microservices architecture",
      category: "Backend"
    },
    {
      title: "Mobile Developer",
      query: "React Native developer with 2+ years experience, iOS and Android publishing",
      category: "Mobile"
    },
    {
      title: "Data Scientist",
      query: "Data scientist with machine learning, Python, and SQL for e-commerce analytics",
      category: "Data"
    }
  ];

  const handleExampleClick = (query: string) => {
    setSearchQuery(query);
    toast({
      title: "Example applied",
      description: "Search query has been populated with the example",
    });
    
    // Focus the textarea after a short delay to show the populated content
    setTimeout(() => {
      const textarea = document.getElementById('search-query');
      if (textarea) {
        textarea.focus();
      }
    }, 100);
  };
  return <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">New Search</h1>
        <p className="text-muted-foreground">Create a new candidate search project</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Search Form */}
        <div className="lg:col-span-2">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Project Details
              </CardTitle>
              <CardDescription>
                Configure your candidate search parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Project Name */}
              <div className="space-y-2">
                <Label htmlFor="project-name">Project Name</Label>
                <Input id="project-name" placeholder="e.g., Senior React Developer Search" value={projectName} onChange={e => setProjectName(e.target.value)} />
              </div>

              {/* Search Query */}
              <div className="space-y-2">
                <Label htmlFor="search-query">Search Query</Label>
                <Textarea id="search-query" placeholder="Describe the ideal candidate profile, role requirements, experience level..." className="min-h-[120px]" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                <p className="text-xs text-muted-foreground">
                  Use natural language to describe what you're looking for. 
                  Our AI will understand and find matching candidates.
                </p>
              </div>

              {/* Similar Roles Toggle */}
              <div className="flex items-center justify-between rounded-md border border-input p-3">
                <div>
                  <Label htmlFor="similar-roles">Find similar roles</Label>
                  <p className="text-xs text-muted-foreground">Broaden search to include adjacent titles.</p>
                </div>
                <Switch id="similar-roles" checked={similarRoles} onCheckedChange={setSimilarRoles} />
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button onClick={handleCreateProject} className="flex-1" size="lg" disabled={isLoading}>
                  <Search className="h-4 w-4 mr-2" />
                  {isLoading ? "Searching..." : "Create Project & Search"}
                </Button>
                <Button variant="outline" onClick={() => navigate('/')}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Tips */}
        <div className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Search Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <p className="text-muted-foreground">
                <strong>Be specific:</strong> Include role level, industry, and key technologies
              </p>
              <p className="text-muted-foreground">
                <strong>Use context:</strong> Mention company size, team structure, or project types
              </p>
              <p className="text-muted-foreground">
                <strong>Add skills:</strong> List both required and nice-to-have technical skills
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Example Queries</CardTitle>
              <CardDescription className="text-xs">Click any example to use it as your search query</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-2">
                {exampleQueries.map((example, index) => (
                  <div
                    key={index}
                    onClick={() => handleExampleClick(example.query)}
                    className="group relative cursor-pointer rounded-lg border border-input bg-background/50 p-3 transition-all duration-200 hover:border-primary/50 hover:bg-background hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs px-2 py-0.5">
                            {example.category}
                          </Badge>
                        </div>
                        <h4 className="text-sm font-medium text-foreground mb-1 group-hover:text-primary transition-colors">
                          {example.title}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {example.query}
                        </p>
                      </div>
                      <Plus className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
};
export default NewSearch;