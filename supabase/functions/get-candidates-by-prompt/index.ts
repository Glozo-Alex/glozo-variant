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
      status: 200,
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
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Get user from JWT
  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', '')
  );
  
  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Invalid authorization" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { prompt, projectId, count = 200, similarRoles = false } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "'prompt' is required and must be a string" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!projectId || typeof projectId !== "string") {
      return new Response(JSON.stringify({ error: "'projectId' is required and must be a string" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // Create search record
    const { data: searchData, error: searchError } = await supabase
      .from('searches')
      .insert({
        project_id: projectId,
        user_id: user.id,
        prompt,
        similar_roles: Boolean(similarRoles),
        status: 'pending'
      })
      .select()
      .single();

    if (searchError) {
      console.error("Failed to create search record:", searchError);
      return new Response(JSON.stringify({ error: "Failed to create search record" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const searchId = searchData.id;

    try {
      const payload = {
        prompt,
        count: typeof count === "number" ? count : 200,
        similarRoles: Boolean(similarRoles),
      };

      const extRes = await fetch("http://34.75.197.68:8888/api/get-candidates-by-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const status = extRes.status;
      const responseText = await extRes.text();
      const snippet = responseText ? responseText.slice(0, 300) : "";

      console.log("External API status:", status);
      if (snippet) {
        console.log("External API response snippet:", snippet);
      }

      let data: any = null;
      try {
        data = responseText ? JSON.parse(responseText) : null;
      } catch (parseErr) {
        console.error("Failed to parse external API JSON:", parseErr);
        data = { error: "Invalid JSON from external API" };
      }

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

      } else {
        // Update search status to failed
        const errorMessage = `${status}: ${snippet || (data?.error ?? "External API request failed")}`;
        await supabase
          .from('searches')
          .update({ 
            status: 'failed', 
            completed_at: new Date().toISOString(),
            error_message: errorMessage
          })
          .eq('id', searchId);
      }

      const responsePayload = extRes.ok && Array.isArray(data)
        ? { data, searchId }
        : { error: data?.error || "External API request failed", status: extRes.status, data, searchId };

      return new Response(JSON.stringify(responsePayload), {
        status: 200,
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

      return new Response(JSON.stringify({ error: apiError.message || "API call failed" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (err) {
    console.error("get-candidates-by-prompt edge function error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
