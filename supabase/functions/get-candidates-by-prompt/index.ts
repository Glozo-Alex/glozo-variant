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

      const extRes = await fetch("http://104.196.13.228:8888/api/get-candidates-by-prompt", {
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

      // Handle both array and object responses and persist full JSON
      const isArray = Array.isArray(data);
      const candidatesArray = isArray
        ? (data as any[])
        : (Array.isArray((data as any)?.candidates) ? (data as any).candidates : []);

      if (extRes.ok && (isArray || typeof data === 'object')) {
        // Update search as completed and store the full raw response
        const candidateCount = candidatesArray.length;

        // 1) Update the searches table (backward compatibility for UI)
        const { error: updateError } = await supabase
          .from('searches')
          .update({ 
            status: 'completed', 
            completed_at: new Date().toISOString(),
            candidate_count: candidateCount,
            raw_response: data
          })
          .eq('id', searchId);

        if (updateError) {
          console.error('Failed to update search with raw_response:', updateError);
        }

        // 2) Insert the full API payload into search_results as a single row (no per-candidate rows)
        const { error: insertError } = await supabase
          .from('search_results')
          .insert({
            search_id: searchId,
            user_id: user.id,
            candidate_data: data, // store full JSON payload here
            match_percentage: null
          });

        if (insertError) {
          console.error('Failed to insert raw payload into search_results:', insertError);
        }

      } else {
        // Update search status to failed, store snippet/raw data for debugging
        const errorMessage = `${status}: ${snippet || (data?.error ?? 'External API request failed')}`;
        await supabase
          .from('searches')
          .update({ 
            status: 'failed', 
            completed_at: new Date().toISOString(),
            error_message: errorMessage,
            raw_response: data
          })
          .eq('id', searchId);
      }

      const responsePayload = extRes.ok && (isArray || typeof data === 'object')
        ? { data, searchId }
        : { error: (data as any)?.error || 'External API request failed', status, data, searchId };

      return new Response(JSON.stringify(responsePayload), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
