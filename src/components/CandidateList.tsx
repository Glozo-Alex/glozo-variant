import { ChevronLeft, ChevronRight } from "lucide-react";
import CandidateCard from "./CandidateCard";
import { Button } from "@/components/ui/button";

const CandidateList = () => {
  const candidateData = {
    name: "Alex Johnson",
    title: "Senior Backend Engineer",
    location: "San Francisco, CA",
    experience: "7+ years",
    matchPercentage: 85,
    description: "Climate scientist with a PhD driving climate model evaluation at LLNL, developing cutting-edge tools for big-data visualizations and advanced metrics impacting global climate research. Jiwoo Lee is a senior p...",
    skills: [
      { name: "Machine Learning", type: "primary" as const },
      { name: "GenAI", type: "secondary" as const },
      { name: "Python", type: "primary" as const },
      { name: "AWS", type: "primary" as const },
      { name: "Computer Vision", type: "primary" as const },
      { name: "Algorithm development", type: "primary" as const },
      { name: "ETL Framework", type: "primary" as const },
    ],
    openToOffers: true,
  };

  const candidateData2 = {
    ...candidateData,
    skills: [
      { name: "Machine Learning", type: "primary" as const },
      { name: "Python", type: "primary" as const },
      { name: "AWS", type: "primary" as const },
      { name: "Computer Vision", type: "primary" as const },
      { name: "ETL Framework", type: "primary" as const },
    ]
  };

  const candidateData3 = {
    ...candidateData,
    skills: [
      { name: "User Research", type: "primary" as const },
      { name: "GenAI", type: "secondary" as const },
      { name: "Agile", type: "primary" as const },
      { name: "SEO", type: "primary" as const },
      { name: "Data Analytics", type: "primary" as const },
    ]
  };

  const candidateData4 = {
    ...candidateData,
    skills: [
      { name: "User Research", type: "primary" as const },
      { name: "GenAI", type: "secondary" as const },
      { name: "Agile", type: "primary" as const },
      { name: "SEO", type: "primary" as const },
      { name: "Data Analytics", type: "primary" as const },
    ]
  };

  return (
    <div className="flex-1 bg-background">
      {/* Header */}
      <div className="border-b border-border p-6">
        <h1 className="text-2xl font-semibold text-foreground">Found Candidates (2739)</h1>
      </div>

      {/* Candidate Cards */}
      <div className="p-6 space-y-6">
        <CandidateCard {...candidateData} />
        <CandidateCard {...candidateData2} />
        <CandidateCard {...candidateData3} />
        <CandidateCard {...candidateData4} />
      </div>

      {/* Pagination */}
      <div className="border-t border-border p-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">41-60 of 2,739 candidates</span>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
              1
            </Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">3</Button>
            <span className="text-muted-foreground">...</span>
            <Button variant="outline" size="sm">24</Button>
            <Button variant="outline" size="sm">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">20 per page</span>
            <Button variant="outline" size="sm">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateList;