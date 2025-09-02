import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CandidateCard from "./CandidateCard";
import { Button } from "@/components/ui/button";

interface CandidateListProps {
  candidates?: any[];
}

const CandidateList = ({ candidates = [] }: CandidateListProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  const totalCandidates = candidates.length;
  const totalPages = Math.ceil(totalCandidates / itemsPerPage);
  
  const currentCandidates = candidates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <main className="flex-1 glass-surface flex flex-col animate-fade-in">
      {/* Header */}
      <div className="h-14 px-6 flex items-center">
        <h1 className="text-lg font-semibold text-card-foreground">
          Найдено кандидатов ({totalCandidates})
        </h1>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-auto p-6 space-y-2">
        {totalCandidates === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              <p className="text-lg mb-2">Кандидаты не найдены</p>
              <p className="text-sm">Попробуйте изменить параметры поиска или создать новый проект.</p>
            </div>
          </div>
        ) : (
          currentCandidates.map((candidate, index) => (
            <CandidateCard
              key={candidate.id || `candidate-${index}`}
              name={candidate.name || `Candidate ${index + 1}`}
              title={candidate.title || "Software Engineer"}
              location={candidate.location || "Location not specified"}
              experience={candidate.experience || "Experience not specified"}
              matchPercentage={candidate.matchPercentage || 0}
              description={candidate.description || "No description available"}
              skills={candidate.skills || []}
              openToOffers={candidate.openToOffers !== false}
            />
          ))
        )}
      </div>

      {/* Pagination Footer */}
      {totalCandidates > 0 && (
        <div className="h-14 px-6 glass-surface flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalCandidates)} из {totalCandidates} кандидатов
          </span>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="hover-scale border-card-border bg-card-hover text-card-foreground hover:bg-card-hover/70"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              const isActive = pageNum === currentPage;
              return (
                <Button
                  key={pageNum}
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className={isActive 
                    ? "bg-primary text-primary-foreground hover-scale border-primary/50"
                    : "hover-scale border-card-border bg-card-hover text-card-foreground hover:bg-card-hover/70"
                  }
                >
                  {pageNum}
                </Button>
              );
            })}
            
            {totalPages > 5 && <span className="text-muted-foreground">...</span>}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="hover-scale border-card-border bg-card-hover text-card-foreground hover:bg-card-hover/70"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">{itemsPerPage} на странице</div>
        </div>
      )}
    </main>
  );
};

export default CandidateList;