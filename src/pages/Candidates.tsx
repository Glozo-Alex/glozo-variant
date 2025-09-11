import { useState, useMemo, useCallback, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Grid, List, Users, Filter, BrainCircuit, CheckCircle, ArrowUpRight, Mail, Phone, MapPin, Calendar } from "lucide-react";
import CandidateProfile from "@/components/CandidateProfile";
import { getSocialIcon } from "@/utils/socialIcons";

interface CandidateData {
  id: string;
  candidateId: string;
  candidateSnapshot: any;
  addedAt: string;
  projectName: string;
  projectId: string;
  sequenceStatus?: 'active' | 'paused' | 'completed';
  lastActivity?: string;
}

const Candidates = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [candidates, setCandidates] = useState<CandidateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');

  const fetchCandidates = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch all candidates from shortlist with project information
      const { data: shortlistData, error } = await supabase
        .from('project_shortlist')
        .select(`
          id,
          candidate_id,
          candidate_snapshot,
          added_at,
          projects!inner(id, name)
        `)
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      if (error) throw error;

      // Fetch sequence status for candidates
      const candidateIds = shortlistData?.map(item => item.candidate_id) || [];
      let sequenceStatusMap: Record<string, any> = {};

      if (candidateIds.length > 0) {
        const { data: sequenceData } = await supabase
          .from('sequence_recipients')
          .select('candidate_id, status, enrolled_at')
          .eq('user_id', user.id)
          .in('candidate_id', candidateIds);

        sequenceStatusMap = sequenceData?.reduce((acc, item) => {
          acc[item.candidate_id] = {
            status: item.status,
            lastActivity: item.enrolled_at
          };
          return acc;
        }, {} as Record<string, any>) || {};
      }

      // Transform data
      const transformedCandidates: CandidateData[] = shortlistData?.map(item => ({
        id: item.id,
        candidateId: item.candidate_id,
        candidateSnapshot: item.candidate_snapshot,
        addedAt: item.added_at,
        projectName: (item.projects as any)?.name || 'Unknown Project',
        projectId: (item.projects as any)?.id || '',
        sequenceStatus: sequenceStatusMap[item.candidate_id]?.status || undefined,
        lastActivity: sequenceStatusMap[item.candidate_id]?.lastActivity || item.added_at
      })) || [];

      setCandidates(transformedCandidates);
    } catch (error: any) {
      console.error('Error fetching candidates:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load candidates"
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  // Filter and search candidates
  const filteredCandidates = useMemo(() => {
    let filtered = candidates;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(candidate => {
        const snapshot = candidate.candidateSnapshot;
        const name = snapshot?.name?.toLowerCase() || '';
        const title = snapshot?.title?.toLowerCase() || '';
        const employer = snapshot?.employer?.toLowerCase() || '';
        const skills = snapshot?.skills?.flatMap((s: any) => s.skills || [])?.join(' ').toLowerCase() || '';
        
        return name.includes(query) || title.includes(query) || employer.includes(query) || skills.includes(query);
      });
    }

    // Filter by sequence status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(candidate => {
        if (filterStatus === 'active') {
          return candidate.sequenceStatus === 'active';
        }
        if (filterStatus === 'completed') {
          return candidate.sequenceStatus === 'completed';
        }
        return true;
      });
    }

    return filtered;
  }, [candidates, searchQuery, filterStatus]);

  const totalCandidates = candidates.length;
  const activeCandidates = candidates.filter(c => c.sequenceStatus === 'active').length;

  const CandidateCard = ({ candidate }: { candidate: CandidateData }) => {
    const snapshot = candidate.candidateSnapshot;
    const socialLinks = snapshot?.social?.map((social: any) => ({
      platform: social.platform || 'globe',
      url: social.url || '#'
    })) || [];

    // Get job title and company info, avoiding redundancy
    const title = snapshot?.title || snapshot?.role || 'Unknown Title';
    const company = snapshot?.employer || snapshot?.company;
    const location = snapshot?.location || 'Unknown Location';
    const experience = snapshot?.experience || 'Experience not specified';
    
    // Get skills in the right format
    const skills = snapshot?.skills?.flatMap((s: any) => s.skills || []) || [];
    const skillsFormatted = skills.map((skill: string) => ({ name: skill, type: 'primary' as const }));
    
    // Get description/summary
    const description = snapshot?.standout || snapshot?.summary || snapshot?.description || 'No summary available.';

    return (
      <article className="glass-card rounded-xl p-5 space-y-3 animate-fade-in hover:shadow-elegant hover:border-primary/30 transition-all duration-300 hover-lift">
        {/* Header */}
        <header className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <CandidateProfile
              candidateData={snapshot}
              socialLinks={socialLinks}
              projectId={candidate.projectId}
            >
              <h3 className="text-base font-semibold text-card-foreground cursor-pointer hover:text-primary transition-colors">
                {snapshot?.name || 'Unknown Name'}
              </h3>
            </CandidateProfile>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CandidateProfile candidateData={snapshot} socialLinks={socialLinks} projectId={candidate.projectId}>
                <ArrowUpRight className="h-4 w-4 cursor-pointer hover:text-primary transition-colors" />
              </CandidateProfile>
              {socialLinks.slice(0, 3).map((link: any, index: number) => {
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
            {snapshot?.open_to_offers && (
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full" style={{ backgroundColor: 'hsl(142 76% 95%)', color: 'hsl(142 76% 30%)' }}>
                Open to offers
              </span>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            {candidate.sequenceStatus && (
              <Badge 
                variant={candidate.sequenceStatus === 'active' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {candidate.sequenceStatus}
              </Badge>
            )}
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
            {description}
          </p>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-2">
          {skillsFormatted.slice(0, 6).map((skill, index) => (
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
          {skillsFormatted.length > 6 && (
            <CandidateProfile candidateData={snapshot} socialLinks={socialLinks} projectId={candidate.projectId}>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground cursor-pointer hover:bg-muted/80 transition-colors">
                + {skillsFormatted.length - 6} more skills
              </span>
            </CandidateProfile>
          )}
        </div>

        {/* Project and Contact Info */}
        <div className="pt-3 border-t border-border/50 space-y-2">
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span className="font-medium">Project: {candidate.projectName}</span>
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              Added {new Date(candidate.addedAt).toLocaleDateString()}
            </div>
          </div>
          
          {/* Contact indicators */}
          <div className="flex items-center gap-3">
            {snapshot?.contacts?.emails?.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-success">
                <Mail className="h-3 w-3" />
                Email available
              </div>
            )}
            {snapshot?.contacts?.phones?.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-success">
                <Phone className="h-3 w-3" />
                Phone available
              </div>
            )}
          </div>
        </div>
      </article>
    );
  };

  const TableView = () => {
    return (
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="h-10">
              <TableHead className="w-[200px]">Candidate</TableHead>
              <TableHead className="w-[180px]">Company/Project</TableHead>
              <TableHead className="w-[120px]">Sequence Status</TableHead>
              <TableHead className="w-[150px]">Skills</TableHead>
              <TableHead className="w-20 text-center">Contact</TableHead>
              <TableHead className="w-24 text-center">Added</TableHead>
              <TableHead className="w-24 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCandidates.map((candidate) => {
              const snapshot = candidate.candidateSnapshot;
              const socialLinks = snapshot?.social?.map((social: any) => ({
                platform: social.platform || 'globe',
                url: social.url || '#'
              })) || [];
              
              const title = snapshot?.title || snapshot?.role || 'Unknown Title';
              const company = snapshot?.employer || snapshot?.company || 'Unknown Company';
              const skills = snapshot?.skills?.flatMap((s: any) => s.skills || []) || [];
              const initials = snapshot?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'UK';

              return (
                <TableRow key={candidate.id} className="h-12 group hover:bg-muted/50">
                  <TableCell className="p-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <CandidateProfile
                          candidateData={snapshot}
                          socialLinks={socialLinks}
                          projectId={candidate.projectId}
                        >
                          <div className="font-medium text-sm truncate cursor-pointer hover:text-primary transition-colors" title={snapshot?.name}>
                            {snapshot?.name || 'Unknown Name'}
                          </div>
                        </CandidateProfile>
                        <div className="text-xs text-muted-foreground truncate" title={title}>
                          {title}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="p-2">
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate" title={company}>
                        {company}
                      </div>
                      <div className="text-xs text-muted-foreground truncate" title={candidate.projectName}>
                        <span className="font-medium">Project:</span> {candidate.projectName}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="p-2">
                    {candidate.sequenceStatus ? (
                      <Badge 
                        variant={candidate.sequenceStatus === 'active' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {candidate.sequenceStatus}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="p-2">
                    <div className="flex gap-1 overflow-hidden">
                      {skills.slice(0, 2).map((skill: string) => (
                        <Badge key={skill} variant="secondary" className="text-xs whitespace-nowrap" title={skill}>
                          {skill.length > 8 ? `${skill.substring(0, 8)}...` : skill}
                        </Badge>
                      ))}
                      {skills.length > 2 && (
                        <CandidateProfile 
                          candidateData={snapshot}
                          socialLinks={socialLinks}
                          projectId={candidate.projectId}
                        >
                          <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted whitespace-nowrap">
                            +{skills.length - 2}
                          </Badge>
                        </CandidateProfile>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="p-2 text-center">
                    <div className="flex justify-center gap-1">
                      {snapshot?.contacts?.emails?.length > 0 && (
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" title="Email available">
                          <Mail className="h-3 w-3" />
                        </Button>
                      )}
                      {snapshot?.contacts?.phones?.length > 0 && (
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" title="Phone available">
                          <Phone className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="p-2 text-center">
                    <div className="text-xs text-muted-foreground">
                      {new Date(candidate.addedAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="p-2 text-center">
                    <CandidateProfile 
                      candidateData={snapshot}
                      socialLinks={socialLinks}
                      projectId={candidate.projectId}
                    >
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" title="View Profile">
                        <Users className="h-3 w-3" />
                      </Button>
                    </CandidateProfile>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Candidates - CRM | GLOZO</title>
        <meta name="description" content="Manage all your shortlisted candidates across projects in one centralized CRM view." />
      </Helmet>

      <main className="flex-1 glass-surface flex flex-col animate-fade-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-card-foreground">Candidates</h1>
              <p className="text-sm text-muted-foreground">
                Manage all your shortlisted candidates across projects
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{totalCandidates} total</span>
                <span>•</span>
                <span>{activeCandidates} active</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search candidates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="text-sm border rounded px-2 py-1"
                >
                  <option value="all">All Candidates</option>
                  <option value="active">Active in Sequences</option>
                  <option value="completed">Completed Sequences</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">Loading candidates...</div>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                {candidates.length === 0 ? 'No candidates yet' : 'No candidates match your filters'}
              </h3>
              <p className="text-muted-foreground">
                {candidates.length === 0 
                  ? 'Start by adding candidates to your project shortlists'
                  : 'Try adjusting your search or filter criteria'
                }
              </p>
            </div>
          ) : (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredCandidates.map((candidate) => (
                  <CandidateCard key={candidate.id} candidate={candidate} />
                ))}
              </div>
            ) : (
              <TableView />
            )
          )}
        </div>

        {/* Footer */}
        {filteredCandidates.length > 0 && (
          <div className="px-6 py-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              Showing {filteredCandidates.length} of {totalCandidates} candidates
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default Candidates;