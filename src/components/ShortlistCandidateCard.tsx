import { memo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, Mail, Phone, MapPin, Trash2 } from "lucide-react";
import { ContactInfo } from "@/components/ContactInfo";
import { CandidateProfile } from "@/components/CandidateProfile";

interface ShortlistCandidateCardProps {
  candidate: {
    id: string;
    numericId: number;
    name: string;
    title: string;
    company: string;
    location: string;
    match: number;
    rating: number;
    skills: string[];
    experience: string;
    email: string;
    phone: string;
    contacts: any;
    socialLinks: any[];
    addedAt: string;
    avatar: string;
  };
  onRemove: (candidateId: string, candidateName: string) => void;
  getMatchColor: (match: number) => string;
}

const ShortlistCandidateCard = memo(({ candidate, onRemove, getMatchColor }: ShortlistCandidateCardProps) => {
  return (
    <Card key={candidate.id} className="glass-card hover-lift h-[440px] flex flex-col">
      <CardHeader className="pb-4 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="w-12 h-12 ring-2 ring-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {candidate.avatar}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg truncate">{candidate.name}</CardTitle>
              <CardDescription className="truncate" title={candidate.title}>
                {candidate.title}
              </CardDescription>
            </div>
          </div>
          <Badge className={`${getMatchColor(candidate.match)} text-white font-semibold flex-shrink-0`}>
            {candidate.match}%
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-4 flex-1">
          {/* Company & Location */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium truncate">{candidate.company}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{candidate.location}</span>
            </div>
          </div>

          {/* Rating & Experience */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{candidate.rating}</span>
            </div>
            <span className="text-muted-foreground truncate">{candidate.experience}</span>
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Skills</h4>
            <div className="flex flex-wrap gap-1">
              {candidate.skills.slice(0, 4).map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {candidate.skills.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{candidate.skills.length - 4} more
                </Badge>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Contact</h4>
            <ContactInfo candidate={candidate} size="sm" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" size="sm" className="flex-1">
            <Mail className="h-4 w-4 mr-1" />
            Message
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onRemove(candidate.id, candidate.name)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>

      {/* Detailed Profile */}
      <CandidateProfile 
        candidateData={{
          id: candidate.numericId.toString(),
          ...candidate
        }}
        socialLinks={candidate.socialLinks}
        projectId=""
      >
        <div />
      </CandidateProfile>
    </Card>
  );
});

ShortlistCandidateCard.displayName = "ShortlistCandidateCard";

export default ShortlistCandidateCard;