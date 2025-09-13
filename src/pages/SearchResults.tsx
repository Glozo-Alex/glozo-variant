import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProject } from "@/contexts/ProjectContext";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import CandidateList from "@/components/CandidateList";
import RightSidebar from "@/components/RightSidebar";
import SaveProjectDialog from "@/components/SaveProjectDialog";
import { useToast } from "@/hooks/use-toast";

const SearchResults = () => {
  const { projectId } = useParams();
  const { projects, convertTemporaryToProject, setActiveProject } = useProject();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // For temporary projects, we need to fetch from Supabase since they're not in the main projects list
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) return;
      
      // First check if it's in the regular projects list
      const regularProject = projects.find(p => p.id === projectId);
      if (regularProject) {
        setProject(regularProject);
        setLoading(false);
        return;
      }

      // If not found, it might be a temporary project
      try {
        const { supabase } = await import("@/integrations/supabase/client");
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: supabaseProject, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .eq('user_id', user.id)
          .single();

        if (error || !supabaseProject) {
          setProject(null);
        } else {
          setProject({
            id: supabaseProject.id,
            name: supabaseProject.name,
            query: supabaseProject.query,
            createdAt: new Date(supabaseProject.created_at),
            updatedAt: new Date(supabaseProject.updated_at),
            shortlistCount: supabaseProject.shortlist_count || 0,
            isTemporary: (supabaseProject as any).is_temporary || false,
          });
        }
      } catch (error) {
        console.error('Error loading project:', error);
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [projectId, projects]);

  const handleSaveProject = async (name: string, description?: string) => {
    if (!project?.id) return;
    
    try {
      const savedProject = await convertTemporaryToProject(project.id, name, description);
      setActiveProject(savedProject);
      navigate(`/project/${savedProject.id}/results`);
    } catch (error) {
      throw error; // Let SaveProjectDialog handle the error
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Project not found</h1>
          <p className="text-muted-foreground">The requested project could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Save Project Banner for temporary projects */}
      {project.isTemporary && (
        <div className="bg-muted/50 border-b border-border px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                This is a temporary search. Save it as a project to keep these results.
              </p>
            </div>
            <SaveProjectDialog onSave={handleSaveProject}>
              <Button size="sm" className="ml-4">
                <Save className="h-4 w-4 mr-2" />
                Save Project
              </Button>
            </SaveProjectDialog>
          </div>
        </div>
      )}
      
      <div className="flex h-full flex-1">
        <CandidateList />
        <RightSidebar />
      </div>
    </div>
  );
};

export default SearchResults;