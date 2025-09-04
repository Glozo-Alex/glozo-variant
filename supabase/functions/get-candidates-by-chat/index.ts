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

    // Create search record with pending status (keep all previous searches for chat history)
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
    const requestBody = {
      message,
      count,
      // send both casing variants just in case
      similarRoles: !!similarRoles,
      similar_roles: !!similarRoles,
      session_id: project.session_id || '',
      user_name: userName,
      user_id: user.id,
      project_id: projectId
    };

    const apiUrl = 'http://104.196.13.228:8888/api/get-candidates-by-chat';

    console.log('API URL:', apiUrl);
    console.log('API request body:', JSON.stringify(requestBody));

    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('External API error:', apiResponse.status, errorText);

      // Build fallback response so the app can show a bot message and persist chat history
      const fallbackResponse = {
        session: {
          message: `Sorry, the search service is temporarily unavailable (HTTP ${apiResponse.status}). Please try again in a moment.`,
          session_id: project.session_id || ''
        },
        candidates: [] as any[]
      };

      // Store as completed with empty candidates so chat history and UI stay consistent
      await supabase
        .from('searches')
        .update({
          status: 'completed',
          candidate_count: 0,
          raw_response: fallbackResponse,
          error_message: `API error: ${apiResponse.status}`,
          completed_at: new Date().toISOString()
        })
        .eq('id', searchRecord.id);

      return new Response(JSON.stringify(fallbackResponse), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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