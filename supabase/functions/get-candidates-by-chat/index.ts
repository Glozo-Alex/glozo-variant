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
  projectId?: string;
  sessionId?: string;
  isTemporary?: boolean;
}

serve(async (req) => {
  console.log('🚀 get-candidates-by-chat function called');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the user from the auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ No authorization header');
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      console.error('❌ Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Invalid authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('✅ User authenticated:', user.id);

    // Parse request body
    const body: RequestBody = await req.json();
    const { message, count = 50, similarRoles = false, projectId, sessionId, isTemporary = false } = body;

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('📝 Request details:', { message, count, similarRoles, projectId, sessionId, isTemporary });

    let searchId: string;
    let userFullName = user.user_metadata?.full_name || user.user_metadata?.name || user.email || 'Unknown User';

    if (isTemporary && sessionId) {
      // For independent searches, find the search by session_id
      const { data: searchData, error: searchError } = await supabase
        .from('searches')
        .select('id')
        .eq('session_id', sessionId)
        .eq('user_id', user.id)
        .eq('is_temporary', true)
        .single();

      if (searchError || !searchData) {
        console.error('❌ Search not found for session:', sessionId, searchError);
        return new Response(JSON.stringify({ error: 'Search session not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      searchId = searchData.id;
    } else if (projectId) {
      // For project-based searches, verify project exists and create search record
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('id, name, session_id')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single();

      if (projectError || !projectData) {
        console.error('❌ Project not found:', projectId, projectError);
        return new Response(JSON.stringify({ error: 'Project not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Create a new search record for the project
      const { data: newSearch, error: newSearchError } = await supabase
        .from('searches')
        .insert({
          project_id: projectId,
          user_id: user.id,
          prompt: message,
          status: 'pending',
          similar_roles: similarRoles,
          is_temporary: false
        })
        .select('id')
        .single();

      if (newSearchError || !newSearch) {
        console.error('❌ Failed to create search record:', newSearchError);
        return new Response(JSON.stringify({ error: 'Failed to create search record' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      searchId = newSearch.id;
    } else {
      return new Response(JSON.stringify({ error: 'Either projectId or sessionId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user profile for additional context
    const { data: profileData } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    if (profileData?.full_name) {
      userFullName = profileData.full_name;
    }

    console.log('👤 User details:', { userFullName, userId: user.id });

    // Prepare request data for external API
    const requestData = {
      user_id: user.id,
      user_name: userFullName,
      message,
      count,
      similar_roles: similarRoles,
      project_id: projectId || null,
      session_id: sessionId || null,
      search_id: searchId
    };

    console.log('📤 Calling external API with:', requestData);

    // Call external API
    try {
      const apiResponse = await fetch('http://35.193.171.159:8888/api/get-candidates-by-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        console.error('❌ External API error:', apiResponse.status, errorText);
        
        // Update search status to error
        await supabase
          .from('searches')
          .update({ 
            status: 'error', 
            error_message: `API Error: ${apiResponse.status} - ${errorText}`,
            completed_at: new Date().toISOString()
          })
          .eq('id', searchId);

        return new Response(JSON.stringify({ 
          error: 'External API error',
          details: `Status: ${apiResponse.status}`,
          candidates: [] // Return empty array as fallback
        }), {
          status: 200, // Return 200 to avoid frontend errors
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const apiData = await apiResponse.json();
      console.log('✅ External API response received, candidates found:', apiData?.candidates?.length || 0);

      // Update search status to completed and store session_id if provided
      const updateData: any = {
        status: 'completed',
        completed_at: new Date().toISOString(),
        raw_response: apiData,
        candidate_count: apiData?.candidates?.length || 0
      };

      if (apiData.session_id && !isTemporary) {
        // Update project with session_id for future use
        await supabase
          .from('projects')
          .update({ session_id: apiData.session_id })
          .eq('id', projectId);
      }

      await supabase
        .from('searches')
        .update(updateData)
        .eq('id', searchId);

      console.log('✅ Search completed successfully');

      return new Response(JSON.stringify(apiData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (apiError) {
      console.error('❌ API call failed:', apiError);
      
      // Update search status to error
      await supabase
        .from('searches')
        .update({ 
          status: 'error', 
          error_message: apiError.message || 'API call failed',
          completed_at: new Date().toISOString()
        })
        .eq('id', searchId);

      return new Response(JSON.stringify({ 
        error: 'Failed to connect to search service',
        candidates: [] // Return empty array as fallback
      }), {
        status: 200, // Return 200 to avoid frontend errors
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('❌ Function error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});