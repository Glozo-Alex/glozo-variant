import { memo } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, Mail, Phone, MapPin, Calendar, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ContactInfo } from "@/components/ContactInfo";

interface ShortlistCandidateRowProps {
  candidate: {
    id: string;
    name: string;
    title: string;
    company: string;
    location: string;
    match: number;
    rating: number;
    skills: string[];
    experience: string;
    contacts: any;
    addedAt: string;
    avatar: string;
  };
  onRemove: (candidateId: string, candidateName: string) => void;
  getMatchColor: (match: number) => string;
}

const ShortlistCandidateRow = memo(({ candidate, onRemove, getMatchColor }: ShortlistCandidateRowProps) => {
  return (
    <TableRow key={candidate.id} className="hover:bg-muted/50">
      <TableCell className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 ring-2 ring-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
              {candidate.avatar}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="font-medium truncate">{candidate.name}</div>
            <div className="text-sm text-muted-foreground truncate">{candidate.title}</div>
          </div>
        </div>
      </TableCell>
      
      <TableCell className="p-4">
        <div className="text-sm">
          <div className="font-medium">{candidate.company}</div>
          <div className="text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {candidate.location}
          </div>
        </div>
      </TableCell>
      
      <TableCell className="p-4">
        <Badge className={`${getMatchColor(candidate.match)} text-white font-semibold`}>
          {candidate.match}%
        </Badge>
      </TableCell>
      
      <TableCell className="p-4">
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="font-medium">{candidate.rating}</span>
        </div>
      </TableCell>
      
      <TableCell className="p-4 max-w-[200px]">
        <div className="flex flex-wrap gap-1">
          {candidate.skills.slice(0, 3).map((skill, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
          {candidate.skills.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{candidate.skills.length - 3}
            </Badge>
          )}
        </div>
      </TableCell>
      
      <TableCell className="p-4">
        <ContactInfo candidate={candidate} size="sm" />
      </TableCell>
      
      <TableCell className="p-4">
        <div className="text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 inline mr-1" />
          {format(new Date(candidate.addedAt), 'MMM d, yyyy')}
        </div>
      </TableCell>
      
      <TableCell className="p-4">
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
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
      </TableCell>
    </TableRow>
  );
});

ShortlistCandidateRow.displayName = "ShortlistCandidateRow";

export default ShortlistCandidateRow;