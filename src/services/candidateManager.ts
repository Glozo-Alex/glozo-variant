import { supabase } from "@/integrations/supabase/client";

export interface CandidateData {
  id: string;
  candidateId: string;
  basicData: any;
  detailedData?: any;
  firstSeenAt: string;
  lastUpdatedAt: string;
  dataCompletenessScore: number;
  hasDetailedContacts: boolean;
  relationships?: CandidateRelationship[];
}

export interface CandidateRelationship {
  id: string;
  relationshipType: 'project_shortlist' | 'sequence_active' | 'sequence_completed' | 'contact_revealed';
  relatedObjectId: string;
  relatedObjectData: any;
  status: string;
  createdAt: string;
  endedAt?: string;
}

export interface GetCandidatesParams {
  userId: string;
  searchQuery?: string;
  filterStatus?: 'all' | 'shortlisted' | 'in_sequence' | 'contacts_revealed';
  includeRelationships?: boolean;
}

export interface UpsertCandidateParams {
  candidateId: string;
  basicData?: any;
  detailedData?: any;
  hasDetailedContacts?: boolean;
}

class CandidateManager {
  /**
   * Get all candidates for a user with optional filtering and relationships
   */
  async getCandidates({ 
    userId, 
    searchQuery, 
    filterStatus = 'all',
    includeRelationships = true 
  }: GetCandidatesParams): Promise<CandidateData[]> {
    try {
      let query = supabase
        .from('candidates')
        .select(`
          id,
          candidate_id,
          basic_data,
          detailed_data,
          first_seen_at,
          last_updated_at,
          data_completeness_score,
          has_detailed_contacts
        `)
        .eq('user_id', userId)
        .order('last_updated_at', { ascending: false });

      const { data: candidates, error } = await query;

      if (error) throw error;

      let candidatesData: CandidateData[] = candidates?.map(candidate => ({
        id: candidate.id,
        candidateId: candidate.candidate_id,
        basicData: candidate.basic_data,
        detailedData: candidate.detailed_data,
        firstSeenAt: candidate.first_seen_at,
        lastUpdatedAt: candidate.last_updated_at,
        dataCompletenessScore: candidate.data_completeness_score,
        hasDetailedContacts: candidate.has_detailed_contacts,
      })) || [];

      // Get relationships if requested
      if (includeRelationships && candidatesData.length > 0) {
        const candidateUuids = candidatesData.map(c => c.id);
        
        const { data: relationships, error: relError } = await supabase
          .from('candidate_relationships')
          .select('*')
          .eq('user_id', userId)
          .in('candidate_uuid', candidateUuids)
          .eq('status', 'active');

        if (relError) throw relError;

        // Group relationships by candidate
        const relationshipMap = new Map<string, CandidateRelationship[]>();
        relationships?.forEach(rel => {
          if (!relationshipMap.has(rel.candidate_uuid)) {
            relationshipMap.set(rel.candidate_uuid, []);
          }
          relationshipMap.get(rel.candidate_uuid)!.push({
            id: rel.id,
            relationshipType: rel.relationship_type as any,
            relatedObjectId: rel.related_object_id,
            relatedObjectData: rel.related_object_data,
            status: rel.status,
            createdAt: rel.created_at,
            endedAt: rel.ended_at,
          });
        });

        // Add relationships to candidates
        candidatesData = candidatesData.map(candidate => ({
          ...candidate,
          relationships: relationshipMap.get(candidate.id) || [],
        }));
      }

      // Apply filters
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        candidatesData = candidatesData.filter(candidate => {
          const name = candidate.basicData?.name?.toLowerCase() || '';
          const title = candidate.basicData?.title?.toLowerCase() || '';
          const employer = candidate.basicData?.employer?.toLowerCase() || '';
          
          return name.includes(query) || title.includes(query) || employer.includes(query);
        });
      }

      if (filterStatus !== 'all') {
        candidatesData = candidatesData.filter(candidate => {
          const relationships = candidate.relationships || [];
          
          switch (filterStatus) {
            case 'shortlisted':
              return relationships.some(rel => rel.relationshipType === 'project_shortlist');
            case 'in_sequence':
              return relationships.some(rel => rel.relationshipType === 'sequence_active');
            case 'contacts_revealed':
              return candidate.hasDetailedContacts;
            default:
              return true;
          }
        });
      }

      return candidatesData;
    } catch (error) {
      console.error('Error fetching candidates:', error);
      throw error;
    }
  }

  /**
   * Upsert a candidate with data merging
   */
  async upsertCandidate(userId: string, params: UpsertCandidateParams): Promise<CandidateData> {
    try {
      const { candidateId, basicData, detailedData, hasDetailedContacts } = params;

      // Check if candidate exists
      const { data: existing } = await supabase
        .from('candidates')
        .select('*')
        .eq('user_id', userId)
        .eq('candidate_id', candidateId)
        .single();

      let mergedBasicData = (existing?.basic_data as any) || {};
      let mergedDetailedData = (existing?.detailed_data as any) || {};
      
      // Merge basic data
      if (basicData) {
        mergedBasicData = {
          ...mergedBasicData,
          ...basicData
        };
      }

      // Merge detailed data
      if (detailedData) {
        mergedDetailedData = {
          ...mergedDetailedData,
          ...detailedData
        };
      }

      // Update completeness score
      const completenessScore = this.calculateCompletenessScore(mergedBasicData, mergedDetailedData);

      const upsertData = {
        user_id: userId,
        candidate_id: candidateId,
        basic_data: mergedBasicData,
        detailed_data: mergedDetailedData,
        has_detailed_contacts: hasDetailedContacts !== undefined ? hasDetailedContacts : existing?.has_detailed_contacts || false,
        data_completeness_score: completenessScore,
        last_updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('candidates')
        .upsert(upsertData, { onConflict: 'user_id,candidate_id' })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        candidateId: data.candidate_id,
        basicData: data.basic_data,
        detailedData: data.detailed_data,
        firstSeenAt: data.first_seen_at,
        lastUpdatedAt: data.last_updated_at,
        dataCompletenessScore: data.data_completeness_score,
        hasDetailedContacts: data.has_detailed_contacts,
      };
    } catch (error) {
      console.error('Error upserting candidate:', error);
      throw error;
    }
  }

  /**
   * Add a relationship for a candidate
   */
  async addRelationship(
    userId: string,
    candidateUuid: string,
    relationshipType: CandidateRelationship['relationshipType'],
    relatedObjectId: string,
    relatedObjectData: any = {}
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('candidate_relationships')
        .upsert({
          user_id: userId,
          candidate_uuid: candidateUuid,
          relationship_type: relationshipType,
          related_object_id: relatedObjectId,
          related_object_data: relatedObjectData,
          status: 'active',
        }, { onConflict: 'candidate_uuid,relationship_type,related_object_id' });

      if (error) throw error;
    } catch (error) {
      console.error('Error adding candidate relationship:', error);
      throw error;
    }
  }

  /**
   * Remove a relationship for a candidate
   */
  async removeRelationship(
    userId: string,
    candidateUuid: string,
    relationshipType: CandidateRelationship['relationshipType'],
    relatedObjectId: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('candidate_relationships')
        .update({ 
          status: 'ended',
          ended_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('candidate_uuid', candidateUuid)
        .eq('relationship_type', relationshipType)
        .eq('related_object_id', relatedObjectId);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing candidate relationship:', error);
      throw error;
    }
  }

  /**
   * Get candidate by external ID
   */
  async getCandidateByExternalId(userId: string, candidateId: string): Promise<CandidateData | null> {
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('user_id', userId)
        .eq('candidate_id', candidateId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return {
        id: data.id,
        candidateId: data.candidate_id,
        basicData: data.basic_data,
        detailedData: data.detailed_data,
        firstSeenAt: data.first_seen_at,
        lastUpdatedAt: data.last_updated_at,
        dataCompletenessScore: data.data_completeness_score,
        hasDetailedContacts: data.has_detailed_contacts,
      };
    } catch (error) {
      console.error('Error getting candidate by external ID:', error);
      throw error;
    }
  }

  /**
   * Calculate data completeness score
   */
  private calculateCompletenessScore(basicData: any, detailedData: any): number {
    let score = 0;
    
    // Basic data scoring (0-50 points)
    if (basicData?.name) score += 10;
    if (basicData?.title) score += 10;
    if (basicData?.employer) score += 10;
    if (basicData?.location) score += 5;
    if (basicData?.skills?.length > 0) score += 10;
    if (basicData?.description) score += 5;

    // Detailed data scoring (0-50 points)
    if (detailedData?.contacts?.emails?.length > 0) score += 15;
    if (detailedData?.contacts?.phones?.length > 0) score += 10;
    if (detailedData?.education?.length > 0) score += 5;
    if (detailedData?.employment?.length > 0) score += 10;
    if (detailedData?.projects?.length > 0) score += 5;
    if (detailedData?.bio || detailedData?.ai_summary) score += 5;

    return Math.min(score, 100);
  }
}

export const candidateManager = new CandidateManager();