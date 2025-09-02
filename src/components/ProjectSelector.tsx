import { useState } from "react";
import { useProject } from "@/contexts/ProjectContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, FolderOpen, Plus, Trash2 } from "lucide-react";

const ProjectSelector = () => {
  const { projects, activeProject, setActiveProject, deleteProject } = useProject();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleProjectSelect = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setActiveProject(project);
      navigate(`/project/${projectId}/results`);
    }
    setIsOpen(false);
  };

  const handleDeleteProject = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteProject(projectId);
  };

  if (!activeProject) return null;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between px-3 py-2 h-auto text-left hover:bg-sidebar-hover transition-colors"
        >
          <div className="flex items-center gap-2 min-w-0">
            <FolderOpen className="h-4 w-4 text-primary flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-medium text-sidebar-text-active truncate text-sm">
                {activeProject.name}
              </p>
              <p className="text-xs text-sidebar-text truncate">
                {activeProject.query.substring(0, 30)}...
              </p>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-sidebar-text flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="start" 
        className="w-64 glass-card border-sidebar-border"
        sideOffset={8}
      >
        <DropdownMenuLabel>Switch Project</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {projects.map((project) => (
          <DropdownMenuItem
            key={project.id}
            className="flex items-center justify-between cursor-pointer hover:bg-sidebar-hover"
            onClick={() => handleProjectSelect(project.id)}
          >
            <div className="flex items-center gap-2 min-w-0">
              <FolderOpen className="h-4 w-4 text-primary flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-medium truncate text-sm">
                  {project.name}
                  {project.id === activeProject.id && (
                    <span className="ml-2 text-xs text-primary">(current)</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {project.createdAt.toLocaleDateString()}
                </p>
              </div>
            </div>
            
            {project.id !== activeProject.id && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                onClick={(e) => handleDeleteProject(project.id, e)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer text-primary hover:bg-primary/10"
          onClick={() => {
            navigate('/new-search');
            setIsOpen(false);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Project
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProjectSelector;