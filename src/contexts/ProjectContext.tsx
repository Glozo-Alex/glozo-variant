import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, ProjectContextType } from '@/types/project';
import { supabase } from '@/integrations/supabase/client';
import { getCandidatesByChat } from '@/services/candidates';

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProjectState] = useState<Project | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedProjects = localStorage.getItem('projects');
    const savedActiveProjectId = localStorage.getItem('activeProjectId');
    
    if (savedProjects) {
      const parsedProjects = JSON.parse(savedProjects).map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
      }));
      setProjects(parsedProjects);
      
      if (savedActiveProjectId) {
        const activeProj = parsedProjects.find((p: Project) => p.id === savedActiveProjectId);
        if (activeProj) {
          setActiveProjectState(activeProj);
        }
      }
    }
  }, []);

  // Save to localStorage when projects or active project changes
  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    if (activeProject) {
      localStorage.setItem('activeProjectId', activeProject.id);
    } else {
      localStorage.removeItem('activeProjectId');
    }
  }, [activeProject]);

  const createProject = async (name: string, query: string, similarRoles?: boolean): Promise<Project> => {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Create project in Supabase
    const { data: supabaseProject, error } = await supabase
      .from('projects')
      .insert({
        name,
        query,
        similar_roles: similarRoles || false,
        user_id: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create project in Supabase:', error);
      throw new Error('Failed to create project');
    }

    // Convert to local Project format
    const newProject: Project = {
      id: supabaseProject.id,
      name: supabaseProject.name,
      query: supabaseProject.query,
      createdAt: new Date(supabaseProject.created_at),
      updatedAt: new Date(supabaseProject.updated_at),
      shortlistCount: supabaseProject.shortlist_count || 0,
    };
    
    setProjects(prev => [...prev, newProject]);
    setActiveProjectState(newProject);


    return newProject;
  };

  const setActiveProject = (project: Project) => {
    setActiveProjectState(project);
  };

  const deleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    if (activeProject?.id === projectId) {
      setActiveProjectState(null);
    }
  };

  const updateProject = (projectId: string, updates: Partial<Pick<Project, 'name' | 'query'>>) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId 
        ? { ...p, ...updates, updatedAt: new Date() }
        : p
    ));
    
    // Update active project if it's the one being updated
    if (activeProject?.id === projectId) {
      setActiveProjectState(prev => prev ? { ...prev, ...updates, updatedAt: new Date() } : null);
    }
  };

  const duplicateProject = (projectId: string): Project => {
    const originalProject = projects.find(p => p.id === projectId);
    if (!originalProject) {
      throw new Error('Project not found');
    }

    const duplicatedProject: Project = {
      id: `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `${originalProject.name} (копия)`,
      query: originalProject.query,
      createdAt: new Date(),
      updatedAt: new Date(),
      shortlistCount: 0,
    };
    
    setProjects(prev => [...prev, duplicatedProject]);
    return duplicatedProject;
  };

  const updateShortlistCount = (projectId: string, newCount: number) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId 
        ? { ...p, shortlistCount: newCount }
        : p
    ));
    
    // Update active project if it's the one being updated
    if (activeProject?.id === projectId) {
      setActiveProjectState(prev => prev ? { ...prev, shortlistCount: newCount } : null);
    }
  };

  return (
    <ProjectContext.Provider value={{
      projects,
      activeProject,
      createProject,
      setActiveProject,
      deleteProject,
      updateProject,
      duplicateProject,
      updateShortlistCount,
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};