import { ArrowUpRight, Linkedin, Github, Globe, CheckCircle, ChevronDown, MessageSquare, Star, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CandidateCardProps {
  name: string;
  title: string;
  location: string;
  experience: string;
  matchPercentage: number;
  description: string;
  skills: Array<{ name: string; type: 'primary' | 'secondary' }>;
  openToOffers: boolean;
}

const LinkChunk = ({ children }: { children: React.ReactNode }) => (
  <span className="bg-tag-purple text-tag-purple-text px-1 rounded">{children}</span>
);

const CandidateCard = ({
  name,
  title,
  location,
  experience,
  matchPercentage,
  description,
  skills,
  openToOffers,
}: CandidateCardProps) => {
  return (
    <article className="glass-card rounded-xl p-5 space-y-3 animate-fade-in hover:shadow-elegant hover:border-primary/30 transition-all duration-300 hover-lift">
      {/* Header */}
      <header className="flex items-start justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <h3 className="text-base font-semibold text-white">{name}</h3>
          <div className="flex items-center gap-2 text-white/70">
            <ArrowUpRight className="h-4 w-4" />
            <Linkedin className="h-4 w-4" />
            <Globe className="h-4 w-4" />
            <Github className="h-4 w-4" />
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-match-green">
            <CheckCircle className="h-4 w-4" /> {matchPercentage}% match
          </span>
          {openToOffers && (
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-tag-blue text-tag-blue-text">
              Open to offers
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-white border-white/20 bg-white/10 hover:bg-white/20 transition-all duration-300 hover-scale">
            <MessageSquare className="h-4 w-4 mr-1" />
            Message <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
          <Button variant="outline" size="sm" className="text-white border-white/20 bg-white/10 hover:bg-white/20 transition-all duration-300 hover-scale">
            <Star className="h-4 w-4 mr-1" />
            Shortlist
          </Button>
        </div>
      </header>

      {/* Meta */}
      <div className="text-white/80 text-sm">
        <span className="font-medium">{title}</span>
        <span className="mx-1">•</span>
        <span className="font-medium">{location}</span>
        <span className="mx-1">•</span>
        <span className="font-medium">{experience}</span>
      </div>

      {/* Description with link-like highlights */}
      <div className="flex items-start gap-2">
        <div className="w-6 h-6 bg-white/10 rounded flex items-center justify-center mt-1">
          <BrainCircuit className="h-4 w-4 text-white/70" />
        </div>
        <p className="text-sm text-white/80 leading-relaxed">
          Climate <LinkChunk>scientist with a PhD driving climate model evaluation</LinkChunk> at LLNL, developing cutting-edge tools for <LinkChunk>big-data visualizations</LinkChunk> and advanced metrics impacting global climate research. Jiwoo Lee is a <LinkChunk>senior p...</LinkChunk>
        </p>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <span
            key={index}
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              skill.type === 'primary'
                ? "bg-tag-blue text-tag-blue-text"
                : "bg-white/10 text-white/70"
            }`}
          >
            {skill.name}
          </span>
        ))}
        {skills.length > 6 && (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/70">+ 5 more skills</span>
        )}
      </div>
    </article>
  );
};

export default CandidateCard;