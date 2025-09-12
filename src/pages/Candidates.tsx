import { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, Grid, List, Filter, Users, Briefcase, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { candidateManager, type CandidateData } from '@/services/candidateManager';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { CandidateProfile } from '@/components/CandidateProfile';
import { ContactInfo } from '@/components/ContactInfo';
import { getSocialIcon } from '@/utils/socialIcons';

export default function Candidates() {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<CandidateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'shortlisted' | 'in_sequence' | 'contacts_revealed'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  useEffect(() => {
    if (user) {
      fetchCandidates();
    }
  }, [user, filterStatus]);

  const fetchCandidates = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await candidateManager.getCandidates({
        userId: user.id,
        filterStatus,
        includeRelationships: true,
      });
      setCandidates(data);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCandidates = useMemo(() => {
    if (!searchQuery) return candidates;
    
    const query = searchQuery.toLowerCase();
    return candidates.filter(candidate => {
      const name = candidate.basicData?.name?.toLowerCase() || '';
      const title = candidate.basicData?.title?.toLowerCase() || '';
      const employer = candidate.basicData?.employer?.toLowerCase() || '';
      
      return name.includes(query) || title.includes(query) || employer.includes(query);
    });
  }, [candidates, searchQuery]);

  const getRelationshipBadges = (candidate: CandidateData) => {
    const badges = [];
    const relationships = candidate.relationships || [];
    
    // Check for active shortlist
    const shortlistRels = relationships.filter(rel => rel.relationshipType === 'project_shortlist');
    if (shortlistRels.length > 0) {
      badges.push(
        <Badge key="shortlisted" variant="secondary" className="text-xs">
          <Briefcase className="w-3 h-3 mr-1" />
          Shortlisted ({shortlistRels.length})
        </Badge>
      );
    }
    
    // Check for active sequences
    const sequenceRels = relationships.filter(rel => rel.relationshipType === 'sequence_active');
    if (sequenceRels.length > 0) {
      badges.push(
        <Badge key="sequence" variant="outline" className="text-xs">
          <Mail className="w-3 h-3 mr-1" />
          In Sequence
        </Badge>
      );
    }
    
    // Check for revealed contacts
    if (candidate.hasDetailedContacts) {
      badges.push(
        <Badge key="contacts" variant="default" className="text-xs">
          <Users className="w-3 h-3 mr-1" />
          Contacts Revealed
        </Badge>
      );
    }
    
    return badges;
  };

  const CandidateCard = ({ candidate }: { candidate: CandidateData }) => {
    const [showDetails, setShowDetails] = useState(false);
    const basicData = candidate.basicData || {};
    const detailedData = candidate.detailedData || {};
    
    return (
      <>
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setShowDetails(true)}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={basicData.profile_picture_url} />
                  <AvatarFallback>
                    {basicData.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'N/A'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-base">{basicData.name || 'Unknown Name'}</h3>
                  <p className="text-sm text-muted-foreground">{basicData.title || 'No title'}</p>
                </div>
              </div>
              <div className="flex gap-1">
                {detailedData.social_links?.map((link: any, index: number) => {
                  const Icon = getSocialIcon(link.platform);
                  return (
                    <a 
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground space-y-1">
              {basicData.employer && (
                <div className="flex items-center gap-2">
                  <Briefcase className="h-3 w-3" />
                  <span>{basicData.employer}</span>
                </div>
              )}
              {basicData.location && (
                <div className="flex items-center gap-2">
                  <span className="text-xs">📍</span>
                  <span>{basicData.location}</span>
                </div>
              )}
            </div>

            {basicData.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {basicData.description}
              </p>
            )}

            {basicData.skills && basicData.skills.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {basicData.skills.slice(0, 3).map((skill: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {basicData.skills.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{basicData.skills.length - 3} more
                  </Badge>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-1 mt-2">
              {getRelationshipBadges(candidate)}
            </div>

            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-xs text-muted-foreground">
                Added: {new Date(candidate.firstSeenAt).toLocaleDateString()}
              </span>
              <ContactInfo 
                candidate={candidate.detailedData || candidate.basicData}
                size="sm"
              />
            </div>
          </CardContent>
        </Card>

        {showDetails && (
          <CandidateProfile
            candidateData={candidate.basicData}
            socialLinks={candidate.detailedData?.social_links || []}
            projectId={candidate.relationships?.[0]?.relatedObjectId || ''}
          >
            <div></div>
          </CandidateProfile>
        )}
      </>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Candidates | CRM</title>
        <meta name="description" content="Manage all your candidates in one centralized location" />
      </Helmet>

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">All Candidates</h1>
            <p className="text-muted-foreground">
              {filteredCandidates.length} candidates found
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('table')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search candidates by name, title, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
            <SelectTrigger className="w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Candidates</SelectItem>
              <SelectItem value="shortlisted">Shortlisted</SelectItem>
              <SelectItem value="in_sequence">In Sequence</SelectItem>
              <SelectItem value="contacts_revealed">Contacts Revealed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Content */}
        {filteredCandidates.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No candidates found</h3>
            <p className="text-muted-foreground">
              {searchQuery || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Start by creating a project and adding candidates to your shortlist'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCandidates.map((candidate) => (
              <CandidateCard key={candidate.id} candidate={candidate} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}