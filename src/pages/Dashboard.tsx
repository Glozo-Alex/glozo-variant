import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProject } from "@/contexts/ProjectContext";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Users, BarChart3, FolderOpen } from "lucide-react";

const Dashboard = () => {
  const { projects, activeProject } = useProject();
  const navigate = useNavigate();

  const recentProjects = projects.slice(-3);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your recruiting platform</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="glass-card hover-lift cursor-pointer" onClick={() => navigate('/new-search')}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus className="h-5 w-5 text-primary" />
              New Search
            </CardTitle>
            <CardDescription>Start a new candidate search</CardDescription>
          </CardHeader>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FolderOpen className="h-5 w-5 text-primary" />
              Total Projects
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground mt-2">
              {projects.length}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" />
              Active Shortlists
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground mt-2">
              {projects.reduce((sum, p) => sum + p.shortlistCount, 0)}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
              Success Rate
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground mt-2">
              85%
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Active Project */}
      {activeProject && (
        <Card className="glass-card mb-8">
          <CardHeader>
            <CardTitle>Active Project</CardTitle>
            <CardDescription>Currently working on</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg">{activeProject.name}</h3>
                <p className="text-muted-foreground text-sm">{activeProject.query}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Created {activeProject.createdAt.toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => navigate(`/project/${activeProject.id}/results`)}
                >
                  View Results
                </Button>
                <Button 
                  onClick={() => navigate(`/project/${activeProject.id}/shortlist`)}
                >
                  Shortlist ({activeProject.shortlistCount})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Projects */}
      {recentProjects.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>Your latest searches</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div key={project.id} className="flex justify-between items-center p-3 rounded-lg bg-accent/5 border border-border/50">
                  <div>
                    <h4 className="font-medium">{project.name}</h4>
                    <p className="text-sm text-muted-foreground">{project.query}</p>
                    <p className="text-xs text-muted-foreground">
                      {project.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate(`/project/${project.id}/results`)}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {projects.length === 0 && (
        <Card className="glass-card">
          <CardContent className="pt-6 text-center">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-4">
              Start by creating your first candidate search
            </p>
            <Button onClick={() => navigate('/new-search')}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Project
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;