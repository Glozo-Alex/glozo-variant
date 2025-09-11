import React, { useState, useCallback } from "react";
import { Star, MessageSquare, MoreHorizontal, ArrowUpDown, ExternalLink, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { addToShortlist, removeFromShortlist } from "@/services/shortlist";
import { useToast } from "@/hooks/use-toast";
import { CandidateProfile } from "./CandidateProfile";
import { getSocialIcon } from '@/utils/socialIcons';

interface SocialLink {
  platform: string;
  url: string;
}

interface CandidateTableData {
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

interface CandidateTableProps {
  candidates: CandidateTableData[];
  onSort?: (column: string) => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
}

const CandidateTable = ({ candidates, onSort, sortColumn, sortDirection }: CandidateTableProps) => {
  const [loadingCandidates, setLoadingCandidates] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleShortlistClick = useCallback(async (candidate: CandidateTableData) => {
    if (loadingCandidates.has(candidate.candidateId)) return;
    
    setLoadingCandidates(prev => new Set(prev).add(candidate.candidateId));
    try {
      if (candidate.isShortlisted) {
        await removeFromShortlist(candidate.projectId, candidate.candidateId);
        toast({
          title: "Removed from shortlist",
          description: `${candidate.name} removed from shortlist`,
        });
      } else {
        const candidateData = {
          id: candidate.candidateId,
          name: candidate.name,
          title: candidate.title,
          location: candidate.location,
          experience: candidate.experience,
          match_percentage: candidate.matchPercentage,
          description: candidate.description,
          skills: candidate.skills,
          open_to_offers: candidate.openToOffers,
        };
        await addToShortlist(candidate.projectId, candidate.candidateId, candidateData);
        toast({
          title: "Added to shortlist",
          description: `${candidate.name} added to shortlist`,
        });
      }
      candidate.onShortlistToggle?.(candidate.candidateId, !candidate.isShortlisted);
    } catch (error) {
      console.error('Shortlist operation failed:', error);
      toast({
        title: "Error",
        description: "Failed to update shortlist",
        variant: "destructive",
      });
    } finally {
      setLoadingCandidates(prev => {
        const newSet = new Set(prev);
        newSet.delete(candidate.candidateId);
        return newSet;
      });
    }
  }, [loadingCandidates, toast]);

  const handleSort = (column: string) => {
    onSort?.(column);
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) return <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />;
    return <ArrowUpDown className={`ml-1 h-3 w-3 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />;
  };

  return (
    <div className="border-0 bg-background">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border hover:bg-transparent">
            <TableHead 
              className="h-8 px-2 text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground w-3/5"
              onClick={() => handleSort('name')}
            >
              Candidate {getSortIcon('name')}
            </TableHead>
            <TableHead className="h-8 px-2 text-xs font-medium text-muted-foreground w-2/5">
              Details & Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {candidates.map((candidate, index) => (
            <TableRow
              key={candidate.candidateId}
              className="border-b border-border hover:bg-muted/30 transition-none group h-16"
            >
              {/* Left column - Candidate info */}
              <TableCell className="p-2 text-xs w-3/5">
                <div className="grid grid-rows-2 h-full">
                  {/* Top row - Name and Match Score */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{candidate.name}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <CandidateProfile 
                          candidateData={candidate.fullCandidateData} 
                          socialLinks={candidate.socialLinks} 
                          projectId={candidate.projectId}
                        >
                          <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-primary cursor-pointer" />
                        </CandidateProfile>
                        {candidate.socialLinks?.slice(0, 2).map((link, idx) => {
                          const IconComponent = getSocialIcon(link.platform);
                          return (
                            <IconComponent
                              key={idx}
                              className="h-3 w-3 text-muted-foreground hover:text-primary cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(link.url, '_blank');
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-success" />
                      <span className="font-medium text-success">{candidate.matchPercentage}%</span>
                    </div>
                  </div>
                  {/* Bottom row - Title, Location, Experience */}
                  <div className="flex items-center text-muted-foreground">
                    <span className="font-medium truncate max-w-48">{candidate.title}</span>
                    <span className="mx-1">•</span>
                    <span className="font-medium truncate max-w-32">{candidate.location}</span>
                    <span className="mx-1">•</span>
                    <span className="font-medium">{candidate.experience}</span>
                  </div>
                </div>
              </TableCell>
              
              {/* Right column - Details and Actions */}
              <TableCell className="p-2 text-xs w-2/5">
                <div className="grid grid-rows-2 h-full">
                  {/* Top row - Standout info and Open to offers status */}
                  <div className="flex items-center justify-between">
                    <div className="text-muted-foreground italic truncate max-w-48">
                      {candidate.description ? candidate.description.substring(0, 50) + '...' : 'Standout information'}
                    </div>
                    {candidate.openToOffers && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap" style={{ backgroundColor: 'hsl(142 76% 95%)', color: 'hsl(142 76% 30%)' }}>
                        Open to offers
                      </span>
                    )}
                  </div>
                  {/* Bottom row - Skills and Shortlist button */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1 flex-1 min-w-0 mr-2">
                      {candidate.skills.slice(0, 3).map((skill, idx) => (
                        <Badge 
                          key={idx} 
                          variant="secondary" 
                          className="text-[10px] px-1 py-0 h-4 bg-muted text-muted-foreground border-0 truncate"
                        >
                          {skill.name}
                        </Badge>
                      ))}
                      {candidate.skills.length > 3 && (
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">+{candidate.skills.length - 3}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-muted/50"
                        onClick={() => handleShortlistClick(candidate)}
                        disabled={loadingCandidates.has(candidate.candidateId)}
                      >
                        {loadingCandidates.has(candidate.candidateId) ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Star className={`h-3 w-3 ${candidate.isShortlisted ? 'fill-current text-warning' : 'text-muted-foreground'}`} />
                        )}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-muted/50">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32">
                          <DropdownMenuItem className="text-xs">
                            <MessageSquare className="h-3 w-3 mr-2" />
                            Message
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-xs">
                            <ExternalLink className="h-3 w-3 mr-2" />
                            View Profile
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default React.memo(CandidateTable);