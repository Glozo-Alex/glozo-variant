import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getSearchResults } from "@/services/search";
import CandidateList from "@/components/CandidateList";
import RightSidebar from "@/components/RightSidebar";
import SaveToProjectDialog from "@/components/SaveToProjectDialog";
import { Button } from "@/components/ui/button";
import { RefreshCw, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SearchResults = () => {
  const { sessionId } = useParams();
  const [searchData, setSearchData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (sessionId) {
      loadSearchResults();
    }
  }, [sessionId]);

  const loadSearchResults = async () => {
    if (!sessionId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await getSearchResults(sessionId);
      setSearchData(data);
    } catch (err) {
      console.error('Failed to load search results:', err);
      setError('Failed to load search results');
      toast({
        title: "Error loading results",
        description: "Failed to load search results. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Loading Search Results</h1>
          <p className="text-muted-foreground">Please wait while we load your candidates...</p>
        </div>
      </div>
    );
  }

  if (error || !searchData) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Search Results Not Found</h1>
          <p className="text-muted-foreground mb-4">
            {error || "The requested search results could not be found."}
          </p>
          <Button onClick={loadSearchResults} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 mr-4">
            <h1 className="text-xl font-semibold mb-1">Search Results</h1>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {searchData.search.prompt}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <SaveToProjectDialog 
              sessionId={sessionId!}
              searchQuery={searchData.search.prompt}
              candidateCount={searchData.results.length}
            />
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowChat(!showChat)}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Refine Search
            </Button>
          </div>
        </div>
        
        {/* Results Summary */}
        <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
          <span>{searchData.results.length} candidates found</span>
          <span>•</span>
          <span>Search completed {new Date(searchData.search.completed_at || searchData.search.created_at).toLocaleString()}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <CandidateList sessionId={sessionId} candidates={searchData.results} />
        <RightSidebar />
      </div>

      {/* Chat Panel for refinement (placeholder) */}
      {showChat && (
        <div className="border-t bg-muted/30 p-4">
          <div className="max-w-2xl mx-auto">
            <p className="text-sm text-muted-foreground text-center">
              Chat functionality for search refinement will be implemented in the next phase.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults;