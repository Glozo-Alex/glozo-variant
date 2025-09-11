import React, { useState, useCallback } from "react";
import { ArrowUpRight, CheckCircle, ChevronDown, MessageSquare, Star, BrainCircuit, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addToShortlist, removeFromShortlist } from "@/services/shortlist";
import { useToast } from "@/hooks/use-toast";
import { CandidateProfile } from "./CandidateProfile";
import { getSocialIcon } from '@/utils/socialIcons';

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
  compact?: boolean;
}

const LinkChunk = ({ children }: { children: React.ReactNode }) => (
  <span className="bg-tag-purple text-tag-purple-text px-1 rounded">{children}</span>
);

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
  compact = false,
}: CandidateCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleShortlistClick = useCallback(async () => {
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
  }, [candidateId, projectId, name, title, location, experience, matchPercentage, description, skills, openToOffers, isShortlisted, onShortlistToggle, toast]);
  
  const cardClasses = compact 
    ? "glass-card rounded-lg p-3 animate-fade-in hover:shadow-elegant hover:border-primary/30 transition-all duration-300 hover-lift"
    : "glass-card rounded-xl p-5 space-y-3 animate-fade-in hover:shadow-elegant hover:border-primary/30 transition-all duration-300 hover-lift";
  
  if (compact) {
    return (
      <article className={cardClasses}>
        <div className="flex items-center gap-4 h-full">
          {/* Left section - Primary info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-card-foreground truncate">{name}</h3>
              <div className="flex items-center gap-1 text-muted-foreground">
                <CandidateProfile candidateData={fullCandidateData} socialLinks={socialLinks} projectId={projectId}>
                  <ArrowUpRight className="h-3 w-3 cursor-pointer hover:text-primary transition-colors" />
                </CandidateProfile>
                {socialLinks.slice(0, 2).map((link, index) => {
                  const IconComponent = getSocialIcon(link.platform);
                  return (
                    <IconComponent
                      key={index}
                      className="h-3 w-3 cursor-pointer hover:text-primary transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(link.url, '_blank');
                      }}
                    />
                  );
                })}
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-success ml-auto">
                <CheckCircle className="h-3 w-3" /> {matchPercentage}%
              </span>
            </div>
            <div className="text-muted-foreground text-xs">
              <span className="font-medium">{title}</span>
              <span className="mx-1">•</span>
              <span className="font-medium">{location}</span>
              <span className="mx-1">•</span>
              <span className="font-medium">{experience}</span>
            </div>
          </div>
          
          {/* Right section - Secondary info and actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {openToOffers && (
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full" style={{ backgroundColor: 'hsl(142 76% 95%)', color: 'hsl(142 76% 30%)' }}>
                Open to offers
              </span>
            )}
            <div className="flex flex-wrap gap-1 max-w-32">
              {skills.slice(0, 3).map((skill, index) => (
                <span
                  key={index}
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    skill.type === 'primary'
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {skill.name}
                </span>
              ))}
              {skills.length > 3 && (
                <CandidateProfile candidateData={fullCandidateData} socialLinks={socialLinks} projectId={projectId}>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground cursor-pointer hover:bg-muted/80 transition-colors">
                    +{skills.length - 3}
                  </span>
                </CandidateProfile>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" className="h-7 px-2 text-xs text-card-foreground border-card-border bg-card-hover hover:bg-card-hover/70 transition-all duration-300 hover-scale">
                <MessageSquare className="h-3 w-3 mr-1" />
                Message
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 px-2 text-xs text-card-foreground border-card-border bg-card-hover hover:bg-card-hover/70 transition-all duration-300 hover-scale"
                onClick={handleShortlistClick}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Star className={`h-3 w-3 mr-1 ${isShortlisted ? 'fill-current' : ''}`} />
                )}
                {isShortlisted ? 'Shortlisted' : 'Shortlist'}
              </Button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className={cardClasses}>
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
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            {skill.name}
          </span>
        ))}
        {skills.length > 6 && (
          <CandidateProfile candidateData={fullCandidateData} socialLinks={socialLinks} projectId={projectId}>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground cursor-pointer hover:bg-muted/80 transition-colors">
              + {skills.length - 6} more skills
            </span>
          </CandidateProfile>
        )}
      </div>
    </article>
  );
};

export default React.memo(CandidateCard);