import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  candidateIds: number[];
  projectId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('get-candidate-details function called');
    console.log('Headers:', {
      authorization: req.headers.get('Authorization') ? 'Present' : 'Missing',
      contentType: req.headers.get('Content-Type'),
      userAgent: req.headers.get('User-Agent')
    });
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey
    });
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    
    if (authError || !user) {
      throw new Error('Invalid or expired token');
    }

    const { candidateIds, projectId }: RequestBody = await req.json();
    console.log('Request data:', { candidateIds, projectId, userId: user.id });

    if (!candidateIds || !Array.isArray(candidateIds) || candidateIds.length === 0) {
      throw new Error('candidateIds must be a non-empty array of numbers');
    }

    if (!projectId) {
      throw new Error('projectId is required');
    }

    // Check if we already have cached data for these candidates
    const { data: existingDetails, error: queryError } = await supabase
      .from('candidate_details')
      .select('candidate_id, detailed_data, created_at')
      .eq('user_id', user.id)
      .eq('project_id', projectId)
      .in('candidate_id', candidateIds);

    if (queryError) {
      console.error('Error querying existing details:', queryError);
      throw new Error('Failed to query existing candidate details');
    }

    console.log('Found existing details for candidates:', existingDetails?.map(d => d.candidate_id) || []);

    // Determine which candidates need fresh data (cache older than 24 hours or missing)
    const now = new Date();
    const cacheExpiryHours = 24;
    const candidatesNeedingUpdate = candidateIds.filter(candidateId => {
      const existing = existingDetails?.find(d => d.candidate_id === candidateId);
      if (!existing) return true;
      
      const createdAt = new Date(existing.created_at);
      const hoursSinceCreated = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
      return hoursSinceCreated > cacheExpiryHours;
    });

    console.log('Candidates needing API update:', candidatesNeedingUpdate);

    let apiResponse = null;
    
    // Call external API only if we need fresh data
    if (candidatesNeedingUpdate.length > 0) {
      console.log('Calling external API for candidates:', candidatesNeedingUpdate);
      
      const apiUrl = 'http://34.75.197.68:8888/api/get-candidates-by-ids';
      const requestBody = {
        ids: candidatesNeedingUpdate
      };

      console.log('API request:', { url: apiUrl, body: requestBody });

      const apiResponseRaw = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!apiResponseRaw.ok) {
        const errorText = await apiResponseRaw.text();
        console.error('API error response:', { status: apiResponseRaw.status, text: errorText });
        throw new Error(`API request failed: ${apiResponseRaw.status} ${errorText}`);
      }

      apiResponse = await apiResponseRaw.json();
      console.log('API response received:', { 
        candidatesCount: apiResponse?.candidates?.length || 0,
        apiVersion: apiResponse?.api_version 
      });

      // Save new data to database
      if (apiResponse && apiResponse.candidates && Array.isArray(apiResponse.candidates)) {
        for (const candidate of apiResponse.candidates) {
          if (candidate.id && candidatesNeedingUpdate.includes(candidate.id)) {
            console.log('Saving candidate details for ID:', candidate.id);
            
            // Upsert candidate details
            const { error: upsertError } = await supabase
              .from('candidate_details')
              .upsert({
                candidate_id: candidate.id,
                user_id: user.id,
                project_id: projectId,
                detailed_data: candidate,
                updated_at: new Date().toISOString()
              }, {
                onConflict: 'candidate_id,user_id,project_id'
              });

            if (upsertError) {
              console.error('Error upserting candidate details:', upsertError);
            }
          }
        }
      }
    }

    // Fetch all requested candidate details from database (including newly saved ones)
    const { data: finalDetails, error: finalQueryError } = await supabase
      .from('candidate_details')
      .select('candidate_id, detailed_data')
      .eq('user_id', user.id)
      .eq('project_id', projectId)
      .in('candidate_id', candidateIds);

    if (finalQueryError) {
      console.error('Error fetching final details:', finalQueryError);
      throw new Error('Failed to fetch candidate details');
    }

    // Create response mapping candidate_id to detailed_data
    const detailsMap: Record<number, any> = {};
    finalDetails?.forEach(detail => {
      detailsMap[detail.candidate_id] = detail.detailed_data;
    });

    console.log('Returning details for candidates:', Object.keys(detailsMap));

    return new Response(JSON.stringify({
      success: true,
      details: detailsMap,
      cached_count: candidateIds.length - candidatesNeedingUpdate.length,
      api_fetched_count: candidatesNeedingUpdate.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-candidate-details function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});