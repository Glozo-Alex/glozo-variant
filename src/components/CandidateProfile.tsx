import { X, MapPin, Briefcase, DollarSign, Star, ExternalLink, Linkedin, Github, Globe, MessageSquare, Mail, Monitor, FileText } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface SocialLink {
  platform: string;
  url: string;
}

interface CandidateProfileProps {
  children: React.ReactNode;
  candidateData: any;
  socialLinks?: SocialLink[];
}

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

const formatSalary = (salary: string) => {
  if (!salary) return "Not specified";
  return salary;
};

const groupSkillsByCluster = (skills: any[]) => {
  if (!Array.isArray(skills)) return {};
  
  const clustered: Record<string, string[]> = {};
  skills.forEach(skill => {
    if (skill.cluster && skill.skills) {
      clustered[skill.cluster] = skill.skills;
    }
  });
  return clustered;
};

export function CandidateProfile({ children, candidateData, socialLinks = [] }: CandidateProfileProps) {
  if (!candidateData) return <>{children}</>;

  const skillClusters = groupSkillsByCluster(candidateData.skills || []);
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-1/2 overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">
                {candidateData.name?.charAt(0) || 'C'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <SheetTitle className="text-xl">{candidateData.name || 'Unknown Candidate'}</SheetTitle>
              <SheetDescription className="text-base">
                {candidateData.title || candidateData.role || 'No title available'}
              </SheetDescription>
              
              {/* Match Score */}
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-success fill-current" />
                <span className="text-sm font-semibold text-success">
                  {Math.round(candidateData.match_score || candidateData.match_percentage || 0)}% match
                </span>
                {candidateData.open_to_offers && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Open to offers
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{candidateData.location || 'Location not specified'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span>{candidateData.years_of_experience || candidateData.average_years_of_experience || 'Experience not specified'}</span>
              </div>
              {candidateData.employer && (
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>Currently at {candidateData.employer}</span>
                </div>
              )}
              {candidateData.salary && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>{formatSalary(candidateData.salary)}</span>
                </div>
              )}
              {candidateData.seniority_level && (
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <span>{candidateData.seniority_level} level</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Social Links */}
          {socialLinks.length > 0 && (
            <>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Social Links</h3>
                <div className="flex flex-wrap gap-2">
                  {socialLinks.map((link, index) => {
                    const IconComponent = getSocialIcon(link.platform);
                    return (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => window.open(link.url, '_blank')}
                      >
                        <IconComponent className="h-4 w-4" />
                        {link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    );
                  })}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* AI Summary */}
          {candidateData.ai_summary && (
            <>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Summary</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {candidateData.ai_summary}
                </p>
              </div>
              <Separator />
            </>
          )}

          {/* Standout */}
          {candidateData.standout && (
            <>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">What Makes Them Stand Out</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {candidateData.standout}
                </p>
              </div>
              <Separator />
            </>
          )}

          {/* Skills by Clusters */}
          {Object.keys(skillClusters).length > 0 && (
            <>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Skills & Expertise</h3>
                <div className="space-y-4">
                  {Object.entries(skillClusters).map(([cluster, skills]) => (
                    <div key={cluster} className="space-y-2">
                      <h4 className="text-sm font-medium text-primary">{cluster}</h4>
                      <div className="flex flex-wrap gap-1">
                        {skills.map((skill, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs bg-tag-blue text-tag-blue-text"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Additional Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Additional Information</h3>
            <div className="grid grid-cols-1 gap-2 text-sm">
              {candidateData.degree && (
                <div>
                  <span className="font-medium">Education: </span>
                  <span className="text-muted-foreground">{candidateData.degree}</span>
                </div>
              )}
              {candidateData.domain && (
                <div>
                  <span className="font-medium">Domain: </span>
                  <span className="text-muted-foreground">{candidateData.domain}</span>
                </div>
              )}
              {candidateData.time_overlap !== undefined && (
                <div>
                  <span className="font-medium">Time Overlap: </span>
                  <span className="text-muted-foreground">{candidateData.time_overlap} years</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}