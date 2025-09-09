import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MailgunTestRequest {
  from?: string;
  to?: string;
  subject?: string;
  text?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase env vars');
    }

    const mgApiKey = Deno.env.get('MAILGUN_API_KEY');
    const mgDomain = Deno.env.get('MAILGUN_DOMAIN');
    const mgBaseUrlRaw = Deno.env.get('MAILGUN_BASE_URL') || 'https://api.mailgun.net';
    const mgApiRoot = mgBaseUrlRaw.replace(/\/$/, '').endsWith('/v3')
      ? mgBaseUrlRaw.replace(/\/$/, '')
      : `${mgBaseUrlRaw.replace(/\/$/, '')}/v3`;

    if (!mgApiKey || !mgDomain) {
      throw new Error('Missing Mailgun env vars');
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Verify auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response('Authorization required', { status: 401, headers: corsHeaders });
    }

    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    if (authError || !user) {
      return new Response('Invalid authentication', { status: 401, headers: corsHeaders });
    }

    const body: MailgunTestRequest = await req.json();

    const from = body.from || `Mailgun Sandbox <postmaster@${mgDomain}>`;
    const to = body.to || `Alexey Vavilov <alex@glozo.com>`;
    const subject = body.subject || `Hello Alexey Vavilov`;
    const text = body.text || `Congratulations Alexey Vavilov, you just sent an email with Mailgun! You are truly awesome!`;

    const endpoint = `${mgApiRoot}/${mgDomain}/messages`;
    console.log('Mailgun test endpoint', endpoint);

    const params = new URLSearchParams();
    params.append('from', from);
    params.append('to', to);
    params.append('subject', subject);
    params.append('text', text);

    const auth = 'Basic ' + btoa(`api:${mgApiKey}`);

    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    const respText = await resp.text();

    console.log('Mailgun test response', { status: resp.status, body: respText });

    return new Response(JSON.stringify({ ok: resp.ok, status: resp.status, body: respText }), {
      status: resp.ok ? 200 : 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in mailgun-smoke-test function:', error);
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});