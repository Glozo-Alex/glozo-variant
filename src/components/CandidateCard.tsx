import { ArrowUpRight, Linkedin, Github, Globe, CheckCircle, ChevronDown, MessageSquare, Star, BrainCircuit, Loader2, Monitor, FileText, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { addToShortlist, removeFromShortlist } from "@/services/shortlist";
import { useToast } from "@/hooks/use-toast";
import { CandidateProfile } from "./CandidateProfile";

interface SocialLink {
  platform: string;
  url: string;
}

interface CandidateCardProps {
  candidateId: string;
  projectId: string;
  name: string;
  title: string;
  location: string;
  experience: string;
  matchPercentage: number;
  description: string;
  skills: Array<{ name: string; type: 'primary' | 'secondary' }>;
  openToOffers: boolean;
  isShortlisted?: boolean;
  onShortlistToggle?: (candidateId: string, isShortlisted: boolean) => void;
  socialLinks?: SocialLink[];
  fullCandidateData?: any;
}

const LinkChunk = ({ children }: { children: React.ReactNode }) => (
  <span className="bg-tag-purple text-tag-purple-text px-1 rounded">{children}</span>
);

const getSocialIcon = (platform: string) => {
  const iconMap: Record<string, React.ElementType> = {
    linkedin: Linkedin,
    github: Github,
    x: MessageSquare, // Twitter/X
    instagram: Monitor,
    medium: FileText,
    stackoverflow: Monitor,
    gitlab: Github,
    globe: Globe,
  };
  
  return iconMap[platform.toLowerCase()] || Globe;
};

const CandidateCard = ({
  candidateId,
  projectId,
  name,
  title,
  location,
  experience,
  matchPercentage,
  description,
  skills,
  openToOffers,
  isShortlisted = false,
  onShortlistToggle,
  socialLinks = [],
  fullCandidateData,
}: CandidateCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleShortlistClick = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      if (isShortlisted) {
        await removeFromShortlist(projectId, candidateId);
        toast({
          title: "Removed from shortlist",
          description: `${name} removed from shortlist`,
        });
      } else {
        const candidateData = {
          id: candidateId,
          name,
          title,
          location,
          experience,
          match_percentage: matchPercentage,
          description,
          skills,
          open_to_offers: openToOffers,
        };
        await addToShortlist(projectId, candidateId, candidateData);
        toast({
          title: "Added to shortlist",
          description: `${name} added to shortlist`,
        });
      }
      onShortlistToggle?.(candidateId, !isShortlisted);
    } catch (error) {
      console.error('Shortlist operation failed:', error);
      toast({
        title: "Error",
        description: "Failed to update shortlist",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <article className="glass-card rounded-xl p-5 space-y-3 animate-fade-in hover:shadow-elegant hover:border-primary/30 transition-all duration-300 hover-lift">
      {/* Header */}
      <header className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-base font-semibold text-card-foreground">{name}</h3>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CandidateProfile candidateData={fullCandidateData} socialLinks={socialLinks} projectId={projectId}>
                <ArrowUpRight className="h-4 w-4 cursor-pointer hover:text-primary transition-colors" />
              </CandidateProfile>
              {socialLinks.map((link, index) => {
                const IconComponent = getSocialIcon(link.platform);
                return (
                  <IconComponent
                    key={index}
                    className="h-4 w-4 cursor-pointer hover:text-primary transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(link.url, '_blank');
                    }}
                  />
                );
              })}
            </div>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-success">
            <CheckCircle className="h-4 w-4" /> {matchPercentage}% match
          </span>
          {openToOffers && (
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full" style={{ backgroundColor: 'hsl(142 76% 95%)', color: 'hsl(142 76% 30%)' }}>
              Open to offers
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-card-foreground border-card-border bg-card-hover hover:bg-card-hover/70 transition-all duration-300 hover-scale">
            <MessageSquare className="h-4 w-4 mr-1" />
            Message <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-card-foreground border-card-border bg-card-hover hover:bg-card-hover/70 transition-all duration-300 hover-scale"
            onClick={handleShortlistClick}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Star className={`h-4 w-4 mr-1 ${isShortlisted ? 'fill-current' : ''}`} />
            )}
            {isShortlisted ? 'Shortlisted' : 'Shortlist'}
          </Button>
        </div>
      </header>

      {/* Meta */}
      <div className="text-muted-foreground text-sm">
        <span className="font-medium">{title}</span>
        <span className="mx-1">•</span>
        <span className="font-medium">{location}</span>
        <span className="mx-1">•</span>
        <span className="font-medium">{experience}</span>
      </div>

      {/* Description with link-like highlights */}
      <div className="flex items-start gap-2">
        <div className="w-6 h-6 bg-card-hover rounded flex items-center justify-center mt-1">
          <BrainCircuit className="h-4 w-4 text-muted-foreground" />
        </div>
        <p className="text-sm text-card-foreground leading-relaxed">
          {description || 'No summary available.'}
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