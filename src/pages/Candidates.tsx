import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Filter, Users, Clock, Eye, MessageSquare } from 'lucide-react';
import { getCandidatesForCRM, type CandidateForCRM } from '@/services/candidates';
import { CandidateProfile } from '@/components/CandidateProfile';
import { toast } from '@/hooks/use-toast';

export default function Candidates() {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<CandidateForCRM[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');

  useEffect(() => {
    if (user) {
      loadCandidates();
    }
  }, [user]);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      const data = await getCandidatesForCRM();
      setCandidates(data);
    } catch (error) {
      console.error('Error loading candidates:', error);
      toast({
        title: "Error",
        description: "Failed to load candidates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCandidates = candidates
    .filter(candidate => {
      const matchesSearch = searchTerm === '' || 
        candidate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.employer?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'recent':
          return new Date(b.last_interaction_at || 0).getTime() - new Date(a.last_interaction_at || 0).getTime();
        case 'interactions':
          return (b.interaction_count || 0) - (a.interaction_count || 0);
        default:
          return 0;
      }
    });

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'N/A';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading candidates...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Candidates</h1>
          <p className="text-muted-foreground">
            Manage your candidate database and interactions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Users className="h-3 w-3" />
            {candidates.length} candidates
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search candidates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recent Activity</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="interactions">Interactions</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCandidates.map((candidate) => (
          <CandidateProfile
            key={candidate.id}
            candidateData={{
              id: candidate.candidate_id,
              name: candidate.name,
              role: candidate.role,
              employer: candidate.employer,
              location: candidate.location,
              skills: candidate.skills || []
            }}
            projectId={null}
          >
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={candidate.avatar_url || ''} />
                      <AvatarFallback>{getInitials(candidate.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{candidate.name || 'Unknown'}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {candidate.role || 'No role'} at {candidate.employer || 'Unknown company'}
                      </p>
                    </div>
                  </div>
                  <Badge variant={candidate.status === 'active' ? 'default' : 'secondary'}>
                    {candidate.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {candidate.location && (
                  <p className="text-sm text-muted-foreground">{candidate.location}</p>
                )}
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Last activity: {formatDate(candidate.last_interaction_at)}
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {candidate.interaction_count || 0} interactions
                  </div>
                </div>

                {candidate.contact_details_requested_at && (
                  <div className="flex items-center gap-1 text-xs text-primary">
                    <Eye className="h-3 w-3" />
                    Contact details requested
                  </div>
                )}

                {candidate.tags && candidate.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {candidate.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {candidate.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{candidate.tags.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </CandidateProfile>
        ))}
      </div>

      {filteredCandidates.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No candidates found</h3>
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Start adding candidates to your shortlists to see them here'
            }
          </p>
        </div>
      )}
    </div>
  );
}