import { ExternalLink, Linkedin, Instagram, Github, MessageSquare, Heart, MoreHorizontal } from "lucide-react";
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
    <div className="bg-card border border-card-border rounded-lg p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-card-foreground">{name}</h3>
          <div className="flex items-center space-x-2">
            <ExternalLink className="h-4 w-4 text-sidebar-text" />
            <Linkedin className="h-4 w-4 text-sidebar-text" />
            <Instagram className="h-4 w-4 text-sidebar-text" />
            <Github className="h-4 w-4 text-sidebar-text" />
          </div>
          <span className="text-match-green font-semibold text-sm">{matchPercentage}% match</span>
          {openToOffers && (
            <span className="text-success text-sm font-medium">Open to offers</span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="text-sidebar-text border-border">
            <MessageSquare className="h-4 w-4 mr-1" />
            Message
          </Button>
          <Button variant="outline" size="sm" className="text-sidebar-text border-border">
            <Heart className="h-4 w-4 mr-1" />
            Shortlist
          </Button>
        </div>
      </div>

      {/* Job Info */}
      <div className="text-sidebar-text">
        <span className="font-medium">{title}</span>
        <span className="mx-1">•</span>
        <span>{location}</span>
        <span className="mx-1">•</span>
        <span>{experience}</span>
      </div>

      {/* Description */}
      <div className="flex items-start space-x-2">
        <div className="w-6 h-6 bg-secondary rounded flex items-center justify-center mt-1">
          <span className="text-xs">🧪</span>
        </div>
        <p className="text-sm text-sidebar-text leading-relaxed">{description}</p>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <span
            key={index}
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              skill.type === 'primary'
                ? "bg-tag-blue text-tag-blue-text"
                : "bg-tag-purple text-tag-purple-text"
            }`}
          >
            {skill.name}
          </span>
        ))}
        {skills.length > 8 && (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
            + 5 more skills
          </span>
        )}
      </div>
    </div>
  );
};

export default CandidateCard;