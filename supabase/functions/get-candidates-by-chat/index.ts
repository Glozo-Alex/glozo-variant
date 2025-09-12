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
  project_id: string;
  session_id?: string;
  user_name: string;
  user_id: string;
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
    const { message, count = 200, similarRoles = false, project_id, session_id, user_name, user_id } = body;

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!project_id) {
      return new Response(JSON.stringify({ error: 'Project ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!user_name || !user_id) {
      return new Response(JSON.stringify({ error: 'User name and ID are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('📝 Request details:', { message, count, similarRoles, project_id, session_id, user_name, user_id });

    let searchId: string;

    // Check if project exists and user has access
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('id, session_id')
      .eq('id', project_id)
      .eq('user_id', user.id)
      .single();

    if (projectError || !projectData) {
      console.error('❌ Project not found:', project_id, projectError);
      return new Response(JSON.stringify({ error: 'Project not found or access denied' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (session_id && session_id !== "") {
      // Find existing search for this session
      const { data: searchData, error: searchError } = await supabase
        .from('searches')
        .select('id')
        .eq('session_id', session_id)
        .eq('project_id', project_id)
        .single();

      if (searchError || !searchData) {
        console.error('❌ Search not found for session:', session_id, searchError);
        return new Response(JSON.stringify({ error: 'Search not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      searchId = searchData.id;
    } else {
      // Create new search for this project
      const newSessionId = crypto.randomUUID();
      const { data: newSearch, error: newSearchError } = await supabase
        .from('searches')
        .insert({
          session_id: newSessionId,
          prompt: message,
          user_id: user.id,
          project_id: project_id,
          similar_roles: similarRoles,
          status: 'pending'
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

      // Update project with the new session_id
      await supabase
        .from('projects')
        .update({ session_id: newSessionId })
        .eq('id', project_id);
    }

    console.log('👤 User details:', { user_name, user_id });

    // Prepare request data for external API
    const requestData = {
      user_id,
      user_name,
      message,
      count,
      similarRoles,
      project_id,
      session_id: session_id || null
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
            status: 'failed', 
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

      // Save candidates to search_results table
      if (apiData?.candidates && Array.isArray(apiData.candidates)) {
        const searchResultRecords = apiData.candidates.map((candidate: any) => ({
          search_id: searchId,
          user_id: user.id,
          candidate_data: candidate,
          match_percentage: candidate.match_score || candidate.match_percentage || 0
        }));

        const { error: insertError } = await supabase
          .from('search_results')
          .insert(searchResultRecords);

        if (insertError) {
          console.error('❌ Failed to save search results:', insertError);
        } else {
          console.log('✅ Saved search results to database:', searchResultRecords.length, 'candidates');
        }
      }

      // Update search status to completed and store session_id if provided
      const updateData: any = {
        status: 'completed',
        completed_at: new Date().toISOString(),
        raw_response: apiData,
        candidate_count: apiData?.candidates?.length || 0
      };

      if (apiData.session_id) {
        // Update project with session_id for future use
        await supabase
          .from('projects')
          .update({ session_id: apiData.session_id })
          .eq('id', project_id);
      }

      await supabase
        .from('searches')
        .update(updateData)
        .eq('id', searchId);

      console.log('✅ Search completed successfully');

      // Return response with session_id for first search
      const responseData = { ...apiData };
      if (!sessionId || sessionId === "") {
        // Get the session_id from the created search for first request
        const { data: searchData } = await supabase
          .from('searches')
          .select('session_id')
          .eq('id', searchId)
          .single();
        
        if (searchData?.session_id) {
          responseData.session_id = searchData.session_id;
        }
      }

      return new Response(JSON.stringify(responseData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (apiError) {
      console.error('❌ API call failed:', apiError);
      
      // Update search status to error
        await supabase
          .from('searches')
          .update({ 
            status: 'failed', 
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