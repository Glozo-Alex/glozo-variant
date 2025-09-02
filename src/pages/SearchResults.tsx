import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { getProject, getProjectSearches, getSearchResults } from "@/services/projects";
import CandidateList from "@/components/CandidateList";
import RightSidebar from "@/components/RightSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface Project {
  id: string;
  name: string;
  query: string;
  similar_roles: boolean;
  created_at: string;
}

interface Search {
  id: string;
  prompt: string;
  status: string;
  candidate_count: number;
  created_at: string;
  error_message?: string;
}

interface SearchResult {
  id: string;
  candidate_data: any;
  match_percentage: number;
}

const SearchResults = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [searches, setSearches] = useState<Search[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProjectData = async () => {
    if (!projectId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [projectData, searchesData] = await Promise.all([
        getProject(projectId),
        getProjectSearches(projectId)
      ]);
      
      setProject(projectData);
      setSearches(searchesData);
      
      // Load results from the most recent completed search
      const completedSearch = searchesData.find(s => s.status === 'completed');
      if (completedSearch) {
        const results = await getSearchResults(completedSearch.id);
        setSearchResults(results);
      }
    } catch (err) {
      console.error('Error loading project data:', err);
      setError('Не удалось загрузить данные проекта');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка результатов...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Ошибка</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              {error || 'Проект не найден'}
            </p>
            <Button onClick={() => window.history.back()} variant="outline">
              Назад
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Convert search results to candidates format for CandidateList
  const candidates = searchResults.map(result => ({
    id: result.id,
    ...result.candidate_data,
    matchPercentage: result.match_percentage
  }));

  const latestSearch = searches[0];
  const isSearchInProgress = latestSearch?.status === 'pending';

  return (
    <div className="flex h-full">
      <div className="flex-1">
        <div className="p-4 border-b bg-card">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{project.name}</h1>
              <p className="text-muted-foreground">{project.query}</p>
            </div>
            <div className="flex items-center gap-2">
              {isSearchInProgress && (
                <div className="flex items-center gap-2 text-warning">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Поиск в процессе...</span>
                </div>
              )}
              <Button onClick={loadProjectData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Обновить
              </Button>
            </div>
          </div>
          {searches.length > 0 && (
            <div className="mt-2 text-sm text-muted-foreground">
              Последний поиск: {new Date(latestSearch.created_at).toLocaleString('ru-RU')} 
              {latestSearch.candidate_count && ` • ${latestSearch.candidate_count} кандидатов`}
              {latestSearch.status === 'failed' && latestSearch.error_message && (
                <span className="text-destructive"> • Ошибка: {latestSearch.error_message}</span>
              )}
            </div>
          )}
        </div>
        <CandidateList candidates={candidates} />
      </div>
      <RightSidebar />
    </div>
  );
};

export default SearchResults;