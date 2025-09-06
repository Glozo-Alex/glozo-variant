import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { GlobalTemplateBuilder } from '@/components/GlobalTemplates/GlobalTemplateBuilder';

interface TemplateEmail {
  id?: string;
  name: string;
  subject: string;
  content: string;
  order_index: number;
  schedule_type: string;
  schedule_config: any;
  trigger_config?: any;
}

interface GlobalTemplate {
  id: string;
  name: string;
  description: string;
  emails: TemplateEmail[];
}

const useGlobalTemplate = (templateId?: string) => {
  return useQuery({
    queryKey: ['global-template', templateId],
    queryFn: async () => {
      if (!templateId) return null;

      const { data: template, error: templateError } = await supabase
        .from('global_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (templateError) throw templateError;

      const { data: emails, error: emailsError } = await supabase
        .from('global_template_emails')
        .select(`
          *,
          global_template_schedules(*)
        `)
        .eq('global_template_id', templateId)
        .order('order_index');

      if (emailsError) throw emailsError;

      const processedEmails = emails.map(email => {
        const schedule = Array.isArray(email.global_template_schedules) ? email.global_template_schedules[0] : null;
        return {
          id: email.id,
          name: email.name,
          subject: email.subject,
          content: email.content,
          order_index: email.order_index,
          schedule_type: schedule?.schedule_type || 'delay',
          schedule_config: schedule?.schedule_config || { delay: { days: 0, hours: 0 } },
          trigger_config: schedule?.trigger_config,
        };
      });

      return {
        ...template,
        emails: processedEmails,
      };
    },
    enabled: !!templateId,
  });
};

export default function GlobalTemplateBuilderPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: template, isLoading } = useGlobalTemplate(templateId);

  const saveTemplateMutation = useMutation({
    mutationFn: async (templatePayload: {
      name: string;
      description: string;
      emails: TemplateEmail[];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      if (templateId) {
        // Update existing template
        const { error: templateError } = await supabase
          .from('global_templates')
          .update({
            name: templatePayload.name,
            description: templatePayload.description,
            updated_at: new Date().toISOString(),
          })
          .eq('id', templateId);

        if (templateError) throw templateError;

        // Delete existing emails and schedules
        const { error: deleteError } = await supabase
          .from('global_template_emails')
          .delete()
          .eq('global_template_id', templateId);

        if (deleteError) throw deleteError;

        // Insert updated emails
        for (const email of templatePayload.emails) {
          const { data: emailData, error: emailError } = await supabase
            .from('global_template_emails')
            .insert({
              global_template_id: templateId,
              user_id: user.id,
              name: email.name,
              subject: email.subject,
              content: email.content,
              order_index: email.order_index,
            })
            .select()
            .single();

          if (emailError) throw emailError;

          // Insert schedule
          const { error: scheduleError } = await supabase
            .from('global_template_schedules')
            .insert({
              global_template_email_id: emailData.id,
              schedule_type: email.schedule_type,
              schedule_config: email.schedule_config,
              trigger_config: email.trigger_config,
            });

          if (scheduleError) throw scheduleError;
        }

        return { id: templateId };
      } else {
        // Create new template
        const { data: newTemplate, error: templateError } = await supabase
          .from('global_templates')
          .insert({
            name: templatePayload.name,
            description: templatePayload.description,
            user_id: user.id,
          })
          .select()
          .single();

        if (templateError) throw templateError;

        // Insert emails
        for (const email of templatePayload.emails) {
          const { data: emailData, error: emailError } = await supabase
            .from('global_template_emails')
            .insert({
              global_template_id: newTemplate.id,
              user_id: user.id,
              name: email.name,
              subject: email.subject,
              content: email.content,
              order_index: email.order_index,
            })
            .select()
            .single();

          if (emailError) throw emailError;

          // Insert schedule
          const { error: scheduleError } = await supabase
            .from('global_template_schedules')
            .insert({
              global_template_email_id: emailData.id,
              schedule_type: email.schedule_type,
              schedule_config: email.schedule_config,
              trigger_config: email.trigger_config,
            });

          if (scheduleError) throw scheduleError;
        }

        return newTemplate;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['global-templates'] });
      queryClient.invalidateQueries({ queryKey: ['global-template', templateId] });
      
      toast({
        title: templateId ? 'Template updated' : 'Template created',
        description: templateId ? 'Your template has been updated successfully.' : 'Your template has been created successfully.',
      });
      
      navigate('/outreach/templates');
    },
    onError: (error) => {
      console.error('Error saving template:', error);
      toast({
        title: 'Error',
        description: 'Failed to save template. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSave = async (templateData: {
    name: string;
    description: string;
    emails: TemplateEmail[];
  }) => {
    await saveTemplateMutation.mutateAsync(templateData);
  };

  const handleCancel = () => {
    navigate('/outreach/templates');
  };

  const canonical = `${window.location.origin}/outreach/templates/${templateId || 'new'}`;

  return (
    <>
      <Helmet>
        <title>{templateId ? 'Edit Template' : 'Create Template'} – Global Templates</title>
        <meta name="description" content="Create and edit reusable email templates with advanced scheduling." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <GlobalTemplateBuilder
        templateId={templateId}
        initialData={template ? {
          name: template.name,
          description: template.description || '',
          emails: template.emails || [],
        } : undefined}
        onSave={handleSave}
        onCancel={handleCancel}
        isLoading={saveTemplateMutation.isPending}
      />
    </>
  );
}