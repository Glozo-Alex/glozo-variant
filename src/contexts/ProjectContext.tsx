import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, ProjectContextType } from '@/types/project';
import { supabase } from '@/integrations/supabase/client';
import { getCandidatesByChat } from '@/services/candidates';

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProjectState] = useState<Project | null>(null);

  // Reload projects from Supabase
  const reloadProjects = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setProjects([]);
      setActiveProjectState(null);
      return;
    }

    const { data: supabaseProjects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load projects:', error);
      return;
    }

    const mapped = (supabaseProjects || []).map(p => ({
      id: p.id,
      name: p.name,
      query: p.query,
      createdAt: new Date(p.created_at),
      updatedAt: new Date(p.updated_at),
      shortlistCount: p.shortlist_count || 0,
      isTemporary: p.is_temporary || false,
    }));

    setProjects(mapped);

    // Validate active project from localStorage only if it exists in DB
    const savedActiveProjectId = localStorage.getItem('activeProjectId');
    if (savedActiveProjectId) {
      const activeProj = mapped.find(p => p.id === savedActiveProjectId) || null;
      setActiveProjectState(activeProj);
      
      // Clear localStorage if project no longer exists in DB
      if (!activeProj) {
        localStorage.removeItem('activeProjectId');
      }
    } else {
      setActiveProjectState(null);
    }
  };

  // Load from Supabase on mount
  useEffect(() => {
    void reloadProjects();
  }, []);


  useEffect(() => {
    if (activeProject) {
      localStorage.setItem('activeProjectId', activeProject.id);
    } else {
      localStorage.removeItem('activeProjectId');
    }
  }, [activeProject]);

  const createProject = async (name: string, query: string, similarRoles?: boolean, isTemporary?: boolean): Promise<Project> => {
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
        is_temporary: isTemporary || false,
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
      isTemporary: supabaseProject.is_temporary || false,
    };
    
    setProjects(prev => [...prev, newProject]);
    setActiveProjectState(newProject);


    return newProject;
  };

  const setActiveProject = (project: Project) => {
    setActiveProjectState(project);
  };

  const deleteProject = async (projectId: string) => {
    try {
      // Delete all related data first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get all email sequences for this project to delete related email data
      const { data: sequences } = await supabase
        .from('email_sequences')
        .select('id')
        .eq('project_id', projectId)
        .eq('user_id', user.id);

      if (sequences?.length) {
        const sequenceIds = sequences.map(s => s.id);
        
        // Delete email logs for these sequences
        await supabase
          .from('email_logs')
          .delete()
          .in('sequence_id', sequenceIds)
          .eq('user_id', user.id);

        // Delete email templates for these sequences
        await supabase
          .from('email_templates')
          .delete()
          .in('sequence_id', sequenceIds)
          .eq('user_id', user.id);
      }

      // Delete sequence recipients
      await supabase
        .from('sequence_recipients')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', user.id);

      // Delete email sequences
      await supabase
        .from('email_sequences')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', user.id);

      // Delete search results
      const { data: searches } = await supabase
        .from('searches')
        .select('id')
        .eq('project_id', projectId)
        .eq('user_id', user.id);

      if (searches?.length) {
        for (const search of searches) {
          await supabase
            .from('search_results')
            .delete()
            .eq('search_id', search.id);
        }
      }

      // Delete searches
      await supabase
        .from('searches')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', user.id);

      // Delete project shortlist entries
      await supabase
        .from('project_shortlist')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', user.id);

      // Finally delete the project
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Failed to delete project in Supabase:', error);
        throw new Error('Failed to delete project');
      }

      if (activeProject?.id === projectId) {
        setActiveProjectState(null);
      }

      await reloadProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  };

  const updateProject = async (projectId: string, updates: Partial<Pick<Project, 'name' | 'query'>>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('projects')
      .update({ ...updates })
      .eq('id', projectId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Failed to update project in Supabase:', error);
      throw new Error('Failed to update project');
    }

    await reloadProjects();
  };

  const duplicateProject = async (projectId: string): Promise<Project> => {
    const originalProject = projects.find(p => p.id === projectId);
    if (!originalProject) {
      throw new Error('Project not found');
    }

    // Reuse createProject to ensure data is stored in Supabase
    const created = await createProject(`${originalProject.name} (копия)`, originalProject.query);
    return created;
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