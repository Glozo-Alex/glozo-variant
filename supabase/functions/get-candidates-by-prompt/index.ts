import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Initialize Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Get the authorization header
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Missing authorization" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Get user from JWT
  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', '')
  );
  
  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Invalid authorization" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { prompt, count, similarRoles, projectId } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "'prompt' is required and must be a string" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!projectId || typeof projectId !== "string") {
      return new Response(JSON.stringify({ error: "'projectId' is required and must be a string" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Normalize defaults
    const safeCount = (typeof count === "number" && !Number.isNaN(count)) ? count : 200;
    const similarRolesBool = (typeof similarRoles === "string"
      ? similarRoles.toUpperCase() === "TRUE"
      : !!similarRoles);
    const similarRolesFlag = similarRolesBool ? "TRUE" : "FALSE";
    // Create search record
    const { data: searchData, error: searchError } = await supabase
      .from('searches')
      .insert({
        project_id: projectId,
        user_id: user.id,
        prompt,
        similar_roles: similarRolesBool,
        status: 'pending'
      })
      .select()
      .single();

    if (searchError) {
      console.error("Failed to create search record:", searchError);
      return new Response(JSON.stringify({ error: "Failed to create search record" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const searchId = searchData.id;

    try {
      const payload: Record<string, unknown> = {
        prompt,
        count: safeCount,
        similarRoles: similarRolesFlag,
      };

      console.log("Forwarding to external API /get-candidates-by-prompt with payload:", payload);
      const extRes = await fetch("http://34.75.197.68:8888/api/get-candidates-by-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await extRes.json().catch(() => ({ error: "Invalid JSON from external API" }));

      if (extRes.ok && data && Array.isArray(data)) {
        // Save successful results
        const candidateResults = data.map((candidate: any) => ({
          search_id: searchId,
          user_id: user.id,
          candidate_data: candidate,
          match_percentage: candidate.match_percentage || null
        }));

        const { error: resultsError } = await supabase
          .from('search_results')
          .insert(candidateResults);

        if (resultsError) {
          console.error("Failed to save search results:", resultsError);
        }

        // Update search status to completed
        await supabase
          .from('searches')
          .update({ 
            status: 'completed', 
            completed_at: new Date().toISOString(),
            candidate_count: data.length 
          })
          .eq('id', searchId);

        console.log(`Successfully saved ${data.length} candidates for search ${searchId}`);
      } else {
        // Update search status to failed
        const errorMessage = data?.error || "External API request failed";
        await supabase
          .from('searches')
          .update({ 
            status: 'failed', 
            completed_at: new Date().toISOString(),
            error_message: errorMessage
          })
          .eq('id', searchId);

        console.error("External API error:", errorMessage);
      }

      return new Response(JSON.stringify(data), {
        status: extRes.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } catch (apiError) {
      console.error("API call failed:", apiError);
      
      // Update search status to failed
      await supabase
        .from('searches')
        .update({ 
          status: 'failed', 
          completed_at: new Date().toISOString(),
          error_message: apiError.message || "API call failed"
        })
        .eq('id', searchId);

      throw apiError;
    }
  } catch (err) {
    console.error("get-candidates-by-prompt edge function error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
