import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { createIndependentSearch } from "@/services/search";
const NewSearch = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [similarRoles, setSimilarRoles] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const exampleQueries = [
    "Senior frontend developer with React and TypeScript experience for fintech startup",
    "Full-stack engineer, 3-5 years experience, Node.js and databases"
  ];

  const handleExampleClick = (exampleText: string) => {
    setSearchQuery(exampleText);
  };
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
  const handleStartSearch = async () => {
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
      const search = await createIndependentSearch({
        message: fullQuery,
        count: 50,
        similarRoles
      });
      
      toast({
        title: "Search started",
        description: "Your candidate search is in progress."
      });
      navigate(`/search-results/${search.session_id}`);
    } catch (error: any) {
      console.error("Search error:", error);
      toast({
        title: "Search failed",
        description: error?.message ?? "Unable to start candidate search",
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
  return <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">New Search</h1>
        <p className="text-muted-foreground">Search for candidates without creating a project</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Search Form */}
        <div className="lg:col-span-2">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Search Parameters
              </CardTitle>
              <CardDescription>
                Configure your candidate search criteria. You can save results to a project later.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                <Button onClick={handleStartSearch} className="flex-1" size="lg" disabled={isLoading}>
                  <Search className="h-4 w-4 mr-2" />
                  {isLoading ? "Searching..." : "Search Candidates"}
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
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              {exampleQueries.map((query, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(query)}
                  className="block w-full text-left p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer border border-transparent hover:border-border"
                >
                  "{query}"
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
};
export default NewSearch;