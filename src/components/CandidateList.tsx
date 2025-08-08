import { ChevronLeft, ChevronRight } from "lucide-react";
import CandidateCard from "./CandidateCard";
import { Button } from "@/components/ui/button";

const CandidateList = () => {
  const base = {
    name: "Alex Johnson",
    title: "Senior Backend Engineer",
    location: "San Francisco, CA",
    experience: "7+ years",
    matchPercentage: 85,
    description:
      "Climate scientist with a PhD driving climate model evaluation at LLNL, developing cutting-edge tools for big-data visualizations and advanced metrics impacting global climate research. Jiwoo Lee is a senior p...",
    openToOffers: true,
  } as const;

  return (
    <main className="flex-1 bg-background">
      <div className="border-b border-border p-6">
        <h1 className="text-2xl font-semibold text-foreground">Found Candidates (2739)</h1>
      </div>

      <div className="p-6 space-y-6">
        <CandidateCard
          {...base}
          skills={[
            { name: "Machine Learning", type: "primary" },
            { name: "GenAI", type: "secondary" },
            { name: "Python", type: "primary" },
            { name: "AWS", type: "primary" },
            { name: "Computer Vision", type: "primary" },
            { name: "Algorithm development", type: "primary" },
            { name: "ETL Framework", type: "primary" },
          ]}
        />

        <CandidateCard
          {...base}
          skills={[
            { name: "Machine Learning", type: "primary" },
            { name: "Python", type: "primary" },
            { name: "AWS", type: "primary" },
            { name: "Computer Vision", type: "primary" },
            { name: "ETL Framework", type: "primary" },
          ]}
        />

        <CandidateCard
          {...base}
          skills={[
            { name: "User Research", type: "primary" },
            { name: "GenAI", type: "secondary" },
            { name: "Agile", type: "primary" },
            { name: "SEO", type: "primary" },
            { name: "Data Analytics", type: "primary" },
          ]}
        />

        <CandidateCard
          {...base}
          skills={[
            { name: "User Research", type: "primary" },
            { name: "GenAI", type: "secondary" },
            { name: "Agile", type: "primary" },
            { name: "SEO", type: "primary" },
            { name: "Data Analytics", type: "primary" },
          ]}
        />
      </div>

      <div className="border-t border-border p-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">41-60 of 2,739 candidates</span>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">1</Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">3</Button>
            <span className="text-muted-foreground">...</span>
            <Button variant="outline" size="sm">24</Button>
            <Button variant="outline" size="sm"><ChevronRight className="h-4 w-4" /></Button>
          </div>

          <div className="text-sm text-muted-foreground">20 per page</div>
        </div>
      </div>
    </main>
  );
};

export default CandidateList;