import { useState, useMemo, useCallback, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Grid, List, Users, Filter } from "lucide-react";
import { CandidateProfile } from "@/components/CandidateProfile";
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

    return (
      <Card className="hover:shadow-lg transition-all duration-300 hover-scale">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-card-foreground">
                  {snapshot?.name || 'Unknown Name'}
                </h3>
                {socialLinks.map((link: any, index: number) => {
                  const IconComponent = getSocialIcon(link.platform);
                  return (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <IconComponent className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
              <p className="text-sm text-muted-foreground mb-1">
                {snapshot?.title || 'Unknown Title'} at {snapshot?.employer || 'Unknown Company'}
              </p>
              <p className="text-xs text-muted-foreground">
                {snapshot?.location || 'Unknown Location'}
              </p>
            </div>
            <div className="text-right">
              {snapshot?.match_percentage && (
                <Badge variant="outline" className="mb-1">
                  {Math.round(snapshot.match_percentage)}% match
                </Badge>
              )}
              {candidate.sequenceStatus && (
                <Badge 
                  variant={candidate.sequenceStatus === 'active' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {candidate.sequenceStatus}
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Project: {candidate.projectName}</span>
              <span>Added: {new Date(candidate.addedAt).toLocaleDateString()}</span>
            </div>
            
            {snapshot?.skills && (
              <div className="flex flex-wrap gap-1">
                {snapshot.skills.flatMap((s: any) => s.skills || []).slice(0, 4).map((skill: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {snapshot.skills.flatMap((s: any) => s.skills || []).length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{snapshot.skills.flatMap((s: any) => s.skills || []).length - 4} more
                  </Badge>
                )}
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t">
            <CandidateProfile
              candidateData={snapshot}
              socialLinks={socialLinks}
              projectId={candidate.projectId}
            >
              <Button variant="outline" size="sm" className="w-full">
                View Details
              </Button>
            </CandidateProfile>
          </div>
        </CardContent>
      </Card>
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
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" 
              : "space-y-4"
            }>
              {filteredCandidates.map((candidate) => (
                <CandidateCard key={candidate.id} candidate={candidate} />
              ))}
            </div>
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