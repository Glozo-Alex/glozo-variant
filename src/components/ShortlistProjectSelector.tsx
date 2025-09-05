import { useState } from "react";
import { useProject } from "@/contexts/ProjectContext";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, FolderOpen } from "lucide-react";

const ShortlistProjectSelector = () => {
  const { projects } = useProject();
  const navigate = useNavigate();
  const { projectId: currentProjectId } = useParams();
  const [isOpen, setIsOpen] = useState(false);

  const currentProject = projects.find(p => p.id === currentProjectId);

  const handleProjectSelect = (projectId: string) => {
    navigate(`/project/${projectId}/shortlist`);
    setIsOpen(false);
  };

  if (projects.length === 0) return null;

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-muted-foreground">Project:</span>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="justify-between min-w-[200px] h-auto text-left"
          >
            <div className="flex items-center gap-2 min-w-0">
              <FolderOpen className="h-4 w-4 text-primary flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-medium truncate text-sm">
                  {currentProject?.name || 'Select Project'}
                </p>
                {currentProject && (
                  <p className="text-xs text-muted-foreground truncate">
                    {currentProject.shortlistCount || 0} candidates
                  </p>
                )}
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          align="start" 
          className="w-64 bg-background border shadow-lg"
          sideOffset={8}
        >
          <DropdownMenuLabel>Select Project</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {projects.map((project) => (
            <DropdownMenuItem
              key={project.id}
              className="flex items-center justify-between cursor-pointer hover:bg-muted"
              onClick={() => handleProjectSelect(project.id)}
            >
              <div className="flex items-center gap-2 min-w-0">
                <FolderOpen className="h-4 w-4 text-primary flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium truncate text-sm">
                    {project.name}
                    {project.id === currentProjectId && (
                      <span className="ml-2 text-xs text-primary">(current)</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {project.shortlistCount || 0} candidates • {project.createdAt.toLocaleDateString()}
                  </p>
                </div>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ShortlistProjectSelector;