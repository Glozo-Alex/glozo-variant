import { Star, MapPin, Calendar, Linkedin, Github, Globe, MessageSquare, Bookmark, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface CandidateCardProps {
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
  avatar?: string;
}

const LinkChunk = ({ children }: { children: React.ReactNode }) => (
  <span className="story-link font-medium">{children}</span>
);

const getMatchColor = (percentage: number) => {
  if (percentage >= 90) return "match-excellent";
  if (percentage >= 70) return "match-good";
  if (percentage >= 50) return "match-fair";
  return "match-poor";
};

const getMatchLabel = (percentage: number) => {
  if (percentage >= 90) return "Excellent";
  if (percentage >= 70) return "Good";
  if (percentage >= 50) return "Fair";
  return "Poor";
};

const ModernCandidateCard = ({
  name,
  title,
  location,
  experience,
  matchPercentage,
  description,
  skills,
  openToOffers = false,
  salary,
  company,
  lastActive = "2 hours ago",
  avatar
}: CandidateCardProps) => {
  const matchColorClass = getMatchColor(matchPercentage);
  const matchLabel = getMatchLabel(matchPercentage);
  const primarySkills = skills.slice(0, 4);
  const additionalSkills = skills.length - 4;

  return (
    <div className="card-interactive glass-card p-6 space-y-4 group">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          {/* Avatar */}
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center text-white font-semibold text-lg shadow-glow">
              {avatar ? (
                <img src={avatar} alt={name} className="w-full h-full rounded-xl object-cover" />
              ) : (
                name.split(' ').map(n => n[0]).join('').slice(0, 2)
              )}
            </div>
            {openToOffers && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-card flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg text-card-foreground truncate group-hover:text-gradient transition-all duration-300">
                  {name}
                </h3>
                <p className="text-muted-foreground text-sm truncate">{title}</p>
                {company && (
                  <p className="text-muted-foreground text-xs truncate">at {company}</p>
                )}
              </div>
              
              {/* Match Score */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <div className="text-2xl font-bold text-gradient">{matchPercentage}%</div>
                  <div className={`text-xs font-medium ${matchColorClass}`}>
                    {matchLabel} Match
                  </div>
                </div>
                <div className="w-2 h-16 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`w-full bg-${matchColorClass} rounded-full transition-all duration-700 ease-out`}
                    style={{ height: `${matchPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Meta Info */}
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{experience}</span>
              </div>
              {salary && (
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>{salary}</span>
                </div>
              )}
              <div className="flex items-center gap-1 ml-auto">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span>Active {lastActive}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 hover-glow">
            <Linkedin className="h-4 w-4 text-blue-600" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover-glow">
            <Github className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover-glow">
            <Globe className="h-4 w-4" />
          </Button>
        </div>

        {openToOffers && (
          <Badge className="bg-success-glow text-success-foreground border-success/20 gap-1">
            <Star className="h-3 w-3 fill-current" />
            Open to offers
          </Badge>
        )}
      </div>

      {/* AI Summary */}
      <div className="bg-accent/50 rounded-lg p-4 border border-accent-glow/20">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-accent-foreground">AI Summary</span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          <LinkChunk>Senior data scientist</LinkChunk> with expertise in{" "}
          <LinkChunk>machine learning</LinkChunk> and{" "}
          <LinkChunk>Python</LinkChunk>. {description}
        </p>
      </div>

      {/* Skills */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-card-foreground">Top Skills</span>
          <div className="h-px bg-border flex-1"></div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {primarySkills.map((skill, index) => (
            <Badge 
              key={index} 
              variant={index < 2 ? "default" : "secondary"}
              className={`
                tag-glow hover-scale
                ${index < 2 
                  ? "bg-gradient-primary text-white border-0 shadow-glow" 
                  : "bg-tag-blue text-tag-blue-text border-tag-blue-glow/20"
                }
              `}
            >
              {skill}
            </Badge>
          ))}
          
          {additionalSkills > 0 && (
            <Badge variant="outline" className="text-muted-foreground hover-scale">
              +{additionalSkills} more
            </Badge>
          )}
        </div>
      </div>

      {/* Match Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-card-foreground">Skill Match</span>
          <span className="text-muted-foreground">{matchPercentage}% compatible</span>
        </div>
        <Progress 
          value={matchPercentage} 
          className="h-2"
          style={{
            background: `linear-gradient(90deg, hsl(var(--${matchColorClass})) ${matchPercentage}%, hsl(var(--muted)) ${matchPercentage}%)`
          }}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button className="flex-1 btn-gradient hover-glow gap-2">
          <MessageSquare className="h-4 w-4" />
          Message
        </Button>
        <Button variant="outline" className="btn-glass hover-glow gap-2">
          <Bookmark className="h-4 w-4" />
          Shortlist
        </Button>
      </div>
    </div>
  );
};

export default ModernCandidateCard;