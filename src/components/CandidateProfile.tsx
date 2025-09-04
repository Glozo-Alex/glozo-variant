import { X, MapPin, Briefcase, DollarSign, Star, ExternalLink, Linkedin, Github, Globe, MessageSquare, Mail, Monitor, FileText, Loader2, Calendar, Award, Building, GraduationCap } from "lucide-react";
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
import { useCandidateDetails } from "@/hooks/useCandidateDetails";
import { useState } from "react";

interface SocialLink {
  platform: string;
  url: string;
}

interface CandidateProfileProps {
  children: React.ReactNode;
  candidateData: any;
  socialLinks?: SocialLink[];
  projectId?: string;
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

export function CandidateProfile({ children, candidateData, socialLinks = [], projectId }: CandidateProfileProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  if (!candidateData) return <>{children}</>;

  const candidateId = candidateData.id ? Number(candidateData.id) : null;
  
  const { candidateDetail, loading, error } = useCandidateDetails({
    candidateId,
    projectId: projectId || '',
    enabled: isOpen && !!candidateId && !!projectId
  });

  // Use detailed data if available, fallback to basic data
  const displayData = candidateDetail || candidateData;
  const skillClusters = groupSkillsByCluster(displayData.skills || []);
  
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[50vw] overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">
                {displayData.name?.charAt(0) || 'C'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <SheetTitle className="text-xl">{displayData.name || 'Unknown Candidate'}</SheetTitle>
                {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              </div>
              <SheetDescription className="text-base">
                {displayData.title || displayData.role || 'No title available'}
              </SheetDescription>
              
              {/* Match Score */}
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-success fill-current" />
                <span className="text-sm font-semibold text-success">
                  {Math.round(candidateData.match_score || candidateData.match_percentage || 0)}% match
                </span>
                {displayData.open_to_offers && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Open to offers
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Error State */}
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">
                Failed to load detailed information: {error}
              </p>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{displayData.location || 'Location not specified'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span>{displayData.years_of_experience || displayData.average_years_of_experience || 'Experience not specified'}</span>
              </div>
              {displayData.employer && (
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span>Currently at {displayData.employer}</span>
                </div>
              )}
              {displayData.salary && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>{formatSalary(displayData.salary)}</span>
                </div>
              )}
              {displayData.seniority_level && (
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <span>{displayData.seniority_level} level</span>
                </div>
              )}
              {displayData.domain && (
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-muted-foreground" />
                  <span>Domain: {displayData.domain}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Bio */}
          {displayData.bio && (
            <>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Bio</h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {displayData.bio}
                </p>
              </div>
              <Separator />
            </>
          )}

          {/* Contact Information */}
          {displayData.contacts && (displayData.contacts.emails?.length > 0 || displayData.contacts.phones?.length > 0) && (
            <>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Contact Information</h3>
                <div className="space-y-2 text-sm">
                  {displayData.contacts.emails?.map((email: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${email}`} className="text-primary hover:underline">
                        {email}
                      </a>
                    </div>
                  ))}
                  {displayData.contacts.phones?.map((phone: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-muted-foreground" />
                      <span>{phone}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Social Links */}
          {(socialLinks.length > 0 || displayData.social?.length > 0) && (
            <>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Social Links</h3>
                <div className="flex flex-wrap gap-2">
                  {/* Display social links from displayData if available */}
                  {displayData.social?.map((link: any, index: number) => {
                    const IconComponent = getSocialIcon(link.platform);
                    return (
                      <Button
                        key={`social-${index}`}
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
                  
                  {/* Fallback to provided social links */}
                  {!displayData.social?.length && socialLinks.map((link, index) => {
                    const IconComponent = getSocialIcon(link.platform);
                    return (
                      <Button
                        key={`fallback-${index}`}
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
          {displayData.ai_summary && (
            <>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Summary</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {displayData.ai_summary}
                </p>
              </div>
              <Separator />
            </>
          )}

          {/* Standout */}
          {displayData.standout && (
            <>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">What Makes Them Stand Out</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {displayData.standout}
                </p>
              </div>
              <Separator />
            </>
          )}

          {/* Employment History */}
          {displayData.employments && displayData.employments.length > 0 && (
            <>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Employment History</h3>
                <div className="space-y-4">
                  {displayData.employments.map((employment: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-base">{employment.role}</h4>
                          <p className="text-sm text-primary">{employment.employer}</p>
                          {employment.location && (
                            <p className="text-sm text-muted-foreground">{employment.location}</p>
                          )}
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {employment.dates?.start} - {employment.dates?.end}
                          </div>
                          {employment.tenure && (
                            <div className="mt-1">{employment.tenure}</div>
                          )}
                        </div>
                      </div>
                      
                      {employment.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                          {employment.description}
                        </p>
                      )}
                      
                      {employment.responsibilities && employment.responsibilities.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium">Key Responsibilities:</h5>
                          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            {employment.responsibilities.map((resp: string, respIndex: number) => (
                              <li key={respIndex}>{resp}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {employment.skills && employment.skills.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium">Skills Used:</h5>
                          <div className="space-y-2">
                            {employment.skills.map((skillGroup: any, skillIndex: number) => (
                              <div key={skillIndex}>
                                <h6 className="text-xs font-medium text-primary">{skillGroup.cluster}</h6>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {skillGroup.skills.map((skill: string, sIndex: number) => (
                                    <Badge key={sIndex} variant="secondary" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Education */}
          {displayData.educations && displayData.educations.length > 0 && (
            <>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Education</h3>
                <div className="space-y-3">
                  {displayData.educations.map((education: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{education.qualification}</h4>
                          <p className="text-sm text-primary">{education.provider}</p>
                          {education.location && (
                            <p className="text-sm text-muted-foreground">{education.location}</p>
                          )}
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {education.dates?.start} - {education.dates?.end}
                          </div>
                        </div>
                      </div>
                      {education.description && (
                        <p className="text-sm text-muted-foreground">{education.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Projects */}
          {displayData.projects && displayData.projects.length > 0 && (
            <>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Projects</h3>
                <div className="space-y-3">
                  {displayData.projects.map((project: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{project.title}</h4>
                          {project.url && (
                            <a 
                              href={project.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline flex items-center gap-1"
                            >
                              View Project <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {project.dates?.start} - {project.dates?.end}
                          </div>
                        </div>
                      </div>
                      {project.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                          {project.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Publications */}
          {displayData.publications && displayData.publications.length > 0 && (
            <>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Publications</h3>
                <div className="space-y-3">
                  {displayData.publications.map((publication: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{publication.name}</h4>
                          <p className="text-sm text-primary">{publication.publisher}</p>
                          {publication.url && (
                            <a 
                              href={publication.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline flex items-center gap-1"
                            >
                              Read Publication <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {publication.date}
                          </div>
                        </div>
                      </div>
                      {publication.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {publication.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
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

          {/* Certificates */}
          {displayData.certificates && displayData.certificates.length > 0 && (
            <>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Certificates</h3>
                <div className="space-y-2">
                  {displayData.certificates.map((certificate: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <span>{certificate.name || certificate}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Languages */}
          {displayData.languages && displayData.languages.length > 0 && (
            <>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {displayData.languages.map((language: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {language}
                    </Badge>
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
              {displayData.degree && (
                <div>
                  <span className="font-medium">Education: </span>
                  <span className="text-muted-foreground">{displayData.degree}</span>
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