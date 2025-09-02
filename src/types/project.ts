export interface Project {
  id: string;
  name: string;
  query: string;
  createdAt: Date;
  updatedAt: Date;
  shortlistCount: number;
}

export interface ProjectContextType {
  projects: Project[];
  activeProject: Project | null;
  createProject: (name: string, query: string) => Project;
  setActiveProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;
}