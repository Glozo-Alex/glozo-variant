import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  sequenceId: string;
  templateId?: string;
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
    const mgFrom = Deno.env.get('MAILGUN_FROM') || `Sequences Test <mailgun@${mgDomain}>`;
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

    const { sequenceId, templateId }: RequestBody = await req.json();
    if (!sequenceId) {
      return new Response('sequenceId is required', { status: 400, headers: corsHeaders });
    }

    // Ensure the sequence belongs to the user
    const { data: sequence, error: seqError } = await supabase
      .from('email_sequences')
      .select('id, name, user_id')
      .eq('id', sequenceId)
      .eq('user_id', user.id)
      .single();

    if (seqError || !sequence) {
      return new Response('Sequence not found', { status: 404, headers: corsHeaders });
    }

    // Get templates
    let query = supabase
      .from('email_templates')
      .select('id, name, subject, content, order_index')
      .eq('sequence_id', sequenceId)
      .eq('user_id', user.id)
      .order('order_index', { ascending: true });

    const { data: templates, error: tmplError } = await query;
    if (tmplError) {
      console.error('Failed to fetch templates:', tmplError);
      return new Response('Failed to fetch templates', { status: 500, headers: corsHeaders });
    }

    if (!templates || templates.length === 0) {
      return new Response('No templates in this sequence', { status: 400, headers: corsHeaders });
    }

    const template = templateId
      ? templates.find(t => t.id === templateId)
      : templates[0];

    if (!template) {
      return new Response('Template not found', { status: 404, headers: corsHeaders });
    }

    // Prepare email - using authorized recipients
    const authorizedRecipients = Deno.env.get('MAILGUN_AUTHORIZED_RECIPIENTS');
    const toEmails = authorizedRecipients || 'alex@glozo.com';
    const subject = template.subject || `${sequence.name} – Test Email`;
    const html = template.content || '<p>(empty content)</p>';

    // Send via Mailgun
    const endpoint = `${mgApiRoot}/${mgDomain}/messages`;
    console.log('Mailgun endpoint', endpoint);
    const params = new URLSearchParams();
    params.append('from', mgFrom);
    params.append('to', toEmails);
    params.append('subject', subject);
    params.append('html', html);

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
    const ok = resp.ok;

    console.log('Mailgun response', { status: resp.status, body: respText });

    if (!ok) {
      return new Response(JSON.stringify({ success: false, error: respText }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, message: 'Test email sent to alex@glozo.com' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in send-sequence-test function:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
