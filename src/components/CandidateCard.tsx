import { ArrowUpRight, Linkedin, Github, Globe, CheckCircle, ChevronDown, MessageSquare, Star } from "lucide-react";
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
    <article className="bg-card border border-card-border rounded-xl p-5 space-y-4">
      {/* Header */}
      <header className="flex items-start justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <h3 className="text-lg font-semibold text-card-foreground">{name}</h3>
          <div className="flex items-center gap-2 text-sidebar-text">
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
          <Button variant="outline" size="sm" className="text-sidebar-text border-border">
            <MessageSquare className="h-4 w-4 mr-1" />
            Message <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
          <Button variant="outline" size="sm" className="text-sidebar-text border-border">
            <Star className="h-4 w-4 mr-1" />
            Shortlist
          </Button>
        </div>
      </header>

      {/* Meta */}
      <div className="text-sidebar-text">
        <span className="font-medium">{title}</span>
        <span className="mx-1">•</span>
        <span>{location}</span>
        <span className="mx-1">•</span>
        <span>{experience}</span>
      </div>

      {/* Description with link-like highlights */}
      <div className="flex items-start gap-2">
        <div className="w-6 h-6 bg-secondary rounded flex items-center justify-center mt-1">📌</div>
        <p className="text-sm text-sidebar-text leading-relaxed">
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
                : "bg-muted text-muted-foreground"
            }`}
          >
            {skill.name}
          </span>
        ))}
        {skills.length > 6 && (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">+ 5 more skills</span>
        )}
      </div>
    </article>
  );
};

export default CandidateCard;