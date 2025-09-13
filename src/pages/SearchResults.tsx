import { useParams } from "react-router-dom";
import { useProject } from "@/contexts/ProjectContext";
import CandidateList from "@/components/CandidateList";
import RightSidebar from "@/components/RightSidebar";

const SearchResults = () => {
  const { projectId } = useParams();
  const { projects } = useProject();
  
  const project = projects.find(p => p.id === projectId);

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
    <div className="flex h-full">
      <CandidateList />
      <RightSidebar />
    </div>
  );
};

export default SearchResults;