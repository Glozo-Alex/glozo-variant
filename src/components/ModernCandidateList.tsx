import { useState } from "react";
import { Search, Filter, SortAsc, Grid3X3, List, ChevronLeft, ChevronRight, Users, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ModernCandidateCard from "./ModernCandidateCard";

interface CandidateData {
  name: string;
  title: string;
  location: string;
  experience: string;
  matchPercentage: number;
  description: string;
  skills: string[];
  openToOffers?: boolean;
  salary?: string;
  company?: string;
  lastActive?: string;
}

const candidates: CandidateData[] = [
  {
    name: "Sarah Chen",
    title: "Senior Data Scientist",
    company: "Google",
    location: "Mountain View, CA",
    experience: "8 years",
    matchPercentage: 95,
    description: "Specializing in machine learning algorithms and big data analytics with proven track record in fintech applications.",
    skills: ["Python", "TensorFlow", "SQL", "AWS", "Machine Learning", "Data Analytics", "Statistics", "Pandas"],
    openToOffers: true,
    salary: "$180K - $220K",
    lastActive: "1 hour ago"
  },
  {
    name: "Marcus Rodriguez",
    title: "ML Engineer",
    company: "Netflix",
    location: "Los Gatos, CA",
    experience: "6 years",
    matchPercentage: 88,
    description: "Expert in recommendation systems and natural language processing with extensive cloud computing experience.",
    skills: ["Python", "PyTorch", "Kubernetes", "Scala", "NLP", "Recommendation Systems", "Docker", "Spark"],
    openToOffers: false,
    salary: "$165K - $200K",
    lastActive: "3 hours ago"
  },
  {
    name: "Emily Watson",
    title: "Data Science Manager",
    company: "Stripe",
    location: "San Francisco, CA",
    experience: "10 years",
    matchPercentage: 82,
    description: "Proven leader in data science teams with strong background in financial modeling and risk analysis.",
    skills: ["Python", "R", "Management", "Statistical Modeling", "Risk Analysis", "Team Leadership", "SQL", "Tableau"],
    openToOffers: true,
    salary: "$200K - $250K",
    lastActive: "30 mins ago"
  },
  {
    name: "David Kim",
    title: "Senior Data Analyst",
    company: "Airbnb",
    location: "San Francisco, CA",
    experience: "5 years",
    matchPercentage: 75,
    description: "Strong analytical skills with focus on product analytics and user behavior modeling.",
    skills: ["SQL", "Python", "Tableau", "A/B Testing", "Product Analytics", "Excel", "Power BI", "Statistics"],
    openToOffers: false,
    salary: "$130K - $160K",
    lastActive: "2 hours ago"
  },
  {
    name: "Lisa Thompson",
    title: "Research Scientist",
    company: "Facebook",
    location: "Menlo Park, CA",
    experience: "7 years",
    matchPercentage: 70,
    description: "PhD in Computer Science with research focus on deep learning and computer vision applications.",
    skills: ["Python", "TensorFlow", "Computer Vision", "Deep Learning", "Research", "Publications", "OpenCV", "CUDA"],
    openToOffers: true,
    salary: "$175K - $210K",
    lastActive: "4 hours ago"
  }
];

const ModernCandidateList = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('match');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalCandidates = candidates.length;
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalCandidates);

  const stats = {
    total: totalCandidates,
    excellent: candidates.filter(c => c.matchPercentage >= 90).length,
    openToOffers: candidates.filter(c => c.openToOffers).length,
    avgMatch: Math.round(candidates.reduce((acc, c) => acc + c.matchPercentage, 0) / candidates.length)
  };

  return (
    <main className="flex-1 h-screen overflow-hidden bg-gradient-to-br from-background to-accent/20">
      {/* Header */}
      <header className="glass-surface border-b border-glass-border/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient">Candidate Search</h1>
              <p className="text-muted-foreground">Senior Data Scientist • Technology</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gradient">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Total Found</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-match-excellent">{stats.excellent}</div>
              <div className="text-xs text-muted-foreground">Excellent Match</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{stats.openToOffers}</div>
              <div className="text-xs text-muted-foreground">Open to Offers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.avgMatch}%</div>
              <div className="text-xs text-muted-foreground">Avg Match</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-input/50 backdrop-blur-sm border-input-border/50 focus:border-primary/50 focus:ring-primary/20"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 btn-glass">
                  <SortAsc className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="match">Match Score</SelectItem>
                  <SelectItem value="experience">Experience</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="location">Location</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="btn-glass hover-glow gap-2">
                <Filter className="h-4 w-4" />
                Filters
                <Badge className="bg-primary-glow text-white text-xs ml-1">3</Badge>
              </Button>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'btn-gradient' : 'hover:bg-white/50'}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'btn-gradient' : 'hover:bg-white/50'}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Active Filters */}
        <div className="flex items-center gap-2 mt-4">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          <Badge className="bg-tag-blue text-tag-blue-text border-tag-blue-glow/20 tag-glow">
            Experience: 5+ years
          </Badge>
          <Badge className="bg-tag-purple text-tag-purple-text border-tag-purple-glow/20 tag-glow">
            Location: California
          </Badge>
          <Badge className="bg-tag-green text-tag-green-text border-tag-green-glow/20 tag-glow">
            Skills: Python, ML
          </Badge>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            Clear all
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className={`
          ${viewMode === 'grid' 
            ? 'grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6' 
            : 'space-y-4'
          }
        `}>
          {candidates.map((candidate, index) => (
            <ModernCandidateCard
              key={index}
              {...candidate}
            />
          ))}
        </div>

        {/* AI Insights */}
        <div className="glass-card mt-8 p-6 border border-card-border/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <h3 className="font-semibold text-card-foreground">AI Insights</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-accent/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="font-medium">Market Trend</span>
              </div>
              <p className="text-muted-foreground">Data scientist salaries increased 12% this quarter in the Bay Area.</p>
            </div>
            <div className="bg-accent/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="font-medium">Recommendation</span>
              </div>
              <p className="text-muted-foreground">Consider expanding search to include ML Engineers for 23% more candidates.</p>
            </div>
            <div className="bg-accent/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-warning" />
                <span className="font-medium">Skill Gap</span>
              </div>
              <p className="text-muted-foreground">High demand for candidates with both ML and fintech experience.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="glass-surface border-t border-glass-border/50 p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startItem}-{endItem} of {totalCandidates} candidates
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="btn-glass hover-glow">
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'ghost'}
                  size="sm"
                  className={currentPage === page ? 'btn-gradient' : 'hover:bg-white/50'}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button variant="outline" size="sm" className="btn-glass hover-glow">
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default ModernCandidateList;