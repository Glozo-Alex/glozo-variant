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
import Sidebar from "@/components/Sidebar";
import { useToast } from "@/hooks/use-toast";

const NewSearch = () => {
  const { createProject } = useProject();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [projectName, setProjectName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

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

  const handleCreateProject = () => {
    if (!projectName.trim()) {
      toast({
        title: "Project name required",
        description: "Please enter a name for your project",
        variant: "destructive",
      });
      return;
    }

    if (!searchQuery.trim()) {
      toast({
        title: "Search query required", 
        description: "Please enter a search query",
        variant: "destructive",
      });
      return;
    }

    const fullQuery = selectedSkills.length > 0 
      ? `${searchQuery} Skills: ${selectedSkills.join(", ")}`
      : searchQuery;

    const project = createProject(projectName, fullQuery);
    
    toast({
      title: "Project created successfully",
      description: `"${project.name}" is ready for candidate search`,
    });

    navigate(`/project/${project.id}/results`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      addSkill(skillInput);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-background via-background to-accent/10">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-4xl mx-auto">
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
                    <Input
                      id="project-name"
                      placeholder="e.g., Senior React Developer Search"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                    />
                  </div>

                  {/* Search Query */}
                  <div className="space-y-2">
                    <Label htmlFor="search-query">Search Query</Label>
                    <Textarea
                      id="search-query"
                      placeholder="Describe the ideal candidate profile, role requirements, experience level..."
                      className="min-h-[120px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Use natural language to describe what you're looking for. 
                      Our AI will understand and find matching candidates.
                    </p>
                  </div>

                  {/* Skills */}
                  <div className="space-y-2">
                    <Label htmlFor="skills">Required Skills</Label>
                    <div className="flex gap-2">
                      <Input
                        id="skills"
                        placeholder="Add a skill and press Enter"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                      />
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => skillInput.trim() && addSkill(skillInput)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {selectedSkills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {selectedSkills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                            {skill}
                            <X 
                              className="h-3 w-3 cursor-pointer hover:text-destructive" 
                              onClick={() => removeSkill(skill)}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Advanced Filters */}
                  <Tabs defaultValue="experience" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="experience">Experience</TabsTrigger>
                      <TabsTrigger value="location">Location</TabsTrigger>
                      <TabsTrigger value="other">Other</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="experience" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Min Experience (years)</Label>
                          <Input type="number" placeholder="0" />
                        </div>
                        <div className="space-y-2">
                          <Label>Max Experience (years)</Label>
                          <Input type="number" placeholder="20" />
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="location" className="space-y-4">
                      <div className="space-y-2">
                        <Label>Preferred Locations</Label>
                        <Input placeholder="e.g., San Francisco, New York, Remote" />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="other" className="space-y-4">
                      <div className="space-y-2">
                        <Label>Additional Filters</Label>
                        <Textarea placeholder="Any other specific requirements..." />
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button 
                      onClick={handleCreateProject}
                      className="flex-1"
                      size="lg"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Create Project & Search
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/')}
                    >
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
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p className="text-muted-foreground">
                    "Senior frontend developer with React and TypeScript experience for fintech startup"
                  </p>
                  <p className="text-muted-foreground">
                    "Full-stack engineer, 3-5 years experience, Node.js and databases"
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NewSearch;