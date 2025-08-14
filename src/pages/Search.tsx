import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search as SearchIcon, 
  Filter, 
  Save, 
  Bell,
  MapPin,
  Briefcase,
  GraduationCap,
  Code,
  Star,
  BookmarkPlus
} from "lucide-react";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const suggestionSkills = [
    "React", "TypeScript", "Node.js", "Python", "AWS", "Docker", 
    "PostgreSQL", "GraphQL", "Kubernetes", "Machine Learning"
  ];

  const savedSearches = [
    { name: "Senior React Developers", query: "React AND TypeScript AND 5+ years", alerts: true },
    { name: "ML Engineers SF Bay", query: "Machine Learning AND (San Francisco OR Bay Area)", alerts: false },
    { name: "DevOps Remote", query: "DevOps AND Docker AND Kubernetes", alerts: true },
    { name: "Product Managers Fintech", query: "Product Manager AND (fintech OR finance)", alerts: false }
  ];

  const recentSearches = [
    "Senior Frontend Developer React",
    "Data Scientist Python ML",
    "Full Stack Engineer TypeScript",
    "iOS Developer Swift UIKit"
  ];

  const addSkill = (skill: string) => {
    if (!selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const removeSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill));
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Advanced Search</h1>
          <p className="text-muted-foreground">Find the perfect candidates with powerful search tools</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Search
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Create Alert
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Search */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SearchIcon className="h-5 w-5" />
                Search Query
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Enter search query (e.g., Senior React Developer AND (Remote OR San Francisco))"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Boolean operators:</span>
                <Badge variant="outline">AND</Badge>
                <Badge variant="outline">OR</Badge>
                <Badge variant="outline">NOT</Badge>
                <Badge variant="outline">"exact phrase"</Badge>
                <Badge variant="outline">(grouping)</Badge>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="filters" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="filters">Smart Filters</TabsTrigger>
              <TabsTrigger value="skills">Skills & Tech</TabsTrigger>
              <TabsTrigger value="location">Location & Remote</TabsTrigger>
            </TabsList>

            <TabsContent value="filters" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Experience Level
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {["Junior (0-2 years)", "Mid-level (3-5 years)", "Senior (6+ years)", "Lead/Principal"].map((level) => (
                      <label key={level} className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">{level}</span>
                      </label>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Education
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {["Bachelor's Degree", "Master's Degree", "PhD", "Bootcamp", "Self-taught"].map((edu) => (
                      <label key={edu} className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">{edu}</span>
                      </label>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="skills" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    Technical Skills
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {selectedSkills.map((skill) => (
                      <Badge key={skill} variant="default" className="cursor-pointer" onClick={() => removeSkill(skill)}>
                        {skill} ×
                      </Badge>
                    ))}
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Popular skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestionSkills.map((skill) => (
                        <Badge 
                          key={skill} 
                          variant="outline" 
                          className="cursor-pointer hover:bg-accent"
                          onClick={() => addSkill(skill)}
                        >
                          + {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="location" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Open to remote work</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Willing to relocate</span>
                    </label>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Input placeholder="Enter city, state, or country" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Use radius search: "San Francisco, CA within 50 miles"
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex items-center gap-3">
            <Button className="flex items-center gap-2">
              <SearchIcon className="h-4 w-4" />
              Search Candidates
            </Button>
            <Button variant="outline">Clear All Filters</Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Saved Searches */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BookmarkPlus className="h-4 w-4" />
                Saved Searches
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {savedSearches.map((search) => (
                <div key={search.name} className="p-3 rounded-lg bg-accent/30 hover:bg-accent/50 cursor-pointer transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-sm">{search.name}</h4>
                    {search.alerts && <Bell className="h-3 w-3 text-primary" />}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{search.query}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Searches */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Searches</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentSearches.map((search) => (
                <div 
                  key={search} 
                  className="text-sm p-2 rounded hover:bg-accent/30 cursor-pointer transition-colors"
                >
                  {search}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Search Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Star className="h-4 w-4" />
                Pro Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <p>• Use quotes for exact phrases: "React Native"</p>
              <p>• Combine with AND: Python AND Django</p>
              <p>• Exclude with NOT: Developer NOT Intern</p>
              <p>• Group with parentheses: (Remote OR Hybrid)</p>
              <p>• Use wildcards: Java* matches JavaScript</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Search;