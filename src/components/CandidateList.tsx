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
    <main className="flex-1 glass-surface flex flex-col animate-fade-in">
      {/* Header (consistent height) */}
      <div className="h-14 border-b border-white/10 px-6 flex items-center">
        <h1 className="text-2xl font-semibold text-white">Found Candidates (2739)</h1>
      </div>

      {/* Scrollable content only here */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
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

      {/* Fixed footer within central section */}
      <div className="h-14 border-t border-white/10 px-6 glass-surface flex items-center justify-between">
        <span className="text-sm text-white/70">41-60 of 2,739 candidates</span>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hover-scale border-white/20 bg-white/10 text-white hover:bg-white/20"><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" className="bg-primary text-primary-foreground hover-scale border-primary/50">1</Button>
          <Button variant="outline" size="sm" className="hover-scale border-white/20 bg-white/10 text-white hover:bg-white/20">2</Button>
          <Button variant="outline" size="sm" className="hover-scale border-white/20 bg-white/10 text-white hover:bg-white/20">3</Button>
          <span className="text-white/70">...</span>
          <Button variant="outline" size="sm" className="hover-scale border-white/20 bg-white/10 text-white hover:bg-white/20">24</Button>
          <Button variant="outline" size="sm" className="hover-scale border-white/20 bg-white/10 text-white hover:bg-white/20"><ChevronRight className="h-4 w-4" /></Button>
        </div>

        <div className="text-sm text-white/70">20 per page</div>
      </div>
    </main>
  );
};

export default CandidateList;