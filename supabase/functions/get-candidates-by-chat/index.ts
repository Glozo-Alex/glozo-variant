import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  message: string;
  count?: number;
  similarRoles?: boolean;
  projectId: string;
}

serve(async (req) => {
  console.log('get-candidates-by-chat function called');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get and verify user authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response('Authorization required', { 
        status: 401, 
        headers: corsHeaders 
      });
    }

    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    
    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return new Response('Invalid authentication', { 
        status: 401, 
        headers: corsHeaders 
      });
    }

    console.log('User authenticated:', user.id);

    // Parse request body
    const body: RequestBody = await req.json();
    const { message, count = 200, similarRoles = false, projectId } = body;

    if (!message || !projectId) {
      return new Response('Missing required fields: message, projectId', { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    // Get project and session_id from database
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('session_id, name')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (projectError || !project) {
      console.error('Project not found:', projectError);
      return new Response('Project not found', { 
        status: 404, 
        headers: corsHeaders 
      });
    }

    // Get user name from metadata
    const userName = user.user_metadata?.full_name || 
                    user.user_metadata?.name || 
                    user.email?.split('@')[0] || 
                    'User';

    console.log('Making API request with:', {
      message,
      count,
      similarRoles,
      projectId,
      userId: user.id,
      userName,
      sessionId: project.session_id
    });

    // Clean up previous results for this project: delete search_results then searches
    const { data: prevSearches, error: prevSearchesError } = await supabase
      .from('searches')
      .select('id')
      .eq('project_id', projectId)
      .eq('user_id', user.id);

    if (prevSearchesError) {
      console.error('Failed to load previous searches:', prevSearchesError);
    }

    const prevIds = Array.isArray(prevSearches) ? prevSearches.map((s: any) => s.id) : [];
    console.log('Previous search IDs to delete:', prevIds);

    if (Array.isArray(prevIds) && prevIds.length > 0) {
      const { error: delResultsErr } = await supabase
        .from('search_results')
        .delete()
        .in('search_id', prevIds);
      if (delResultsErr) console.error('Failed to delete previous search_results:', delResultsErr);

      const { error: delSearchesErr } = await supabase
        .from('searches')
        .delete()
        .in('id', prevIds);
      if (delSearchesErr) console.error('Failed to delete previous searches:', delSearchesErr);
    }

    // Create search record with pending status
    const { data: searchRecord, error: searchError } = await supabase
      .from('searches')
      .insert({
        user_id: user.id,
        project_id: projectId,
        prompt: message,
        similar_roles: similarRoles,
        status: 'pending'
      })
      .select()
      .single();

    if (searchError) {
      console.error('Failed to create search record:', searchError);
      return new Response('Failed to create search record', { 
        status: 500, 
        headers: corsHeaders 
      });
    }

    // Make request to external API
    const apiResponse = await fetch('http://104.196.13.228:8888/api/get-candidates-by-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        count,
        similarRoles,
        session_id: project.session_id || '',
        user_name: userName,
        user_id: user.id,
        project_id: projectId
      }),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('External API error:', apiResponse.status, errorText);
      
      // Update search record with failed status
      await supabase
        .from('searches')
        .update({
          status: 'failed',
          error_message: `API error: ${apiResponse.status} - ${errorText}`,
          completed_at: new Date().toISOString()
        })
        .eq('id', searchRecord.id);

      return new Response(`External API error: ${apiResponse.status}`, { 
        status: 500, 
        headers: corsHeaders 
      });
    }

    const responseData = await apiResponse.json();
    console.log('API response received:', {
      candidatesCount: responseData.candidates?.length || 0,
      sessionId: responseData.session?.session_id,
      message: responseData.session?.message?.substring(0, 100) + '...'
    });

    // Update project with session_id if provided
    if (responseData.session?.session_id) {
      await supabase
        .from('projects')
        .update({ session_id: responseData.session.session_id })
        .eq('id', projectId);
    }

    // Update search record with completed status and results
    await supabase
      .from('searches')
      .update({
        status: 'completed',
        candidate_count: responseData.candidates?.length || 0,
        raw_response: responseData,
        completed_at: new Date().toISOString()
      })
      .eq('id', searchRecord.id);

    // Store search results
    if (responseData.candidates && responseData.candidates.length > 0) {
      const searchResults = responseData.candidates.map((candidate: any) => ({
        search_id: searchRecord.id,
        user_id: user.id,
        candidate_data: candidate,
        match_percentage: candidate.match_score || 0
      }));

      const { error: resultsError } = await supabase
        .from('search_results')
        .insert(searchResults);

      if (resultsError) {
        console.error('Failed to store search results:', resultsError);
      }
    }

    console.log('Search completed successfully');

    // Return the full response data
    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-candidates-by-chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});