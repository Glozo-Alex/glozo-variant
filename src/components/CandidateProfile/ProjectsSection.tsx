import { FolderOpen, Calendar, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface Project {
  dates?: { start?: string; end?: string };
  description?: string;
  skills?: any[];
  title?: string;
  url?: string;
}

interface ProjectsSectionProps {
  projects?: Project[];
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  if (!projects?.length) {
    return null;
  }

  // Limit to first 5 projects to prevent rendering issues
  const limitedProjects = projects.slice(0, 5);

  return (
    <>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Projects</h3>
        <div className="space-y-4">
          {limitedProjects.map((project, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">{project.title || 'Project title not specified'}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FolderOpen className="h-4 w-4" />
                    <span>Project</span>
                  </div>
                </div>
                {project.dates && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {project.dates.start || 'N/A'} - {project.dates.end || 'N/A'}
                    </span>
                  </div>
                )}
              </div>
              
              {project.description && (
                <p className="text-sm text-muted-foreground">{project.description}</p>
              )}
              
              {project.url && (
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <span>View Project</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
      <Separator />
    </>
  );
}