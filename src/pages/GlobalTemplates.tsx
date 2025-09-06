import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface GlobalTemplate {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  email_count?: number;
}

const useGlobalTemplates = () => {
  return useQuery({
    queryKey: ['global-templates'],
    queryFn: async () => {
      // First, get all templates
      const { data: templates, error: templatesError } = await supabase
        .from('global_templates')
        .select('*')
        .order('updated_at', { ascending: false });

      if (templatesError) throw templatesError;
      
      if (!templates || templates.length === 0) {
        return [];
      }

      // Then, get email counts for each template
      const templatesWithCounts = await Promise.all(
        templates.map(async (template) => {
          const { count, error: countError } = await supabase
            .from('global_template_emails')
            .select('*', { count: 'exact', head: true })
            .eq('global_template_id', template.id);

          if (countError) {
            console.error('Error counting emails for template:', template.id, countError);
            return { ...template, email_count: 0 };
          }

          return { ...template, email_count: count || 0 };
        })
      );

      return templatesWithCounts;
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export default function GlobalTemplates() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useGlobalTemplates();

  const createTemplateMutation = useMutation({
    mutationFn: async (templateData: { name: string; description: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('global_templates')
        .insert({
          name: templateData.name,
          description: templateData.description,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['global-templates'] });
      setDialogOpen(false);
      setTemplateName('');
      setTemplateDescription('');
      toast({
        title: 'Template created',
        description: 'Your global template has been created successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create template. Please try again.',
        variant: 'destructive',
      });
      console.error('Error creating template:', error);
    },
  });

  const handleCreateTemplate = () => {
    if (!templateName.trim()) {
      toast({
        title: 'Invalid input',
        description: 'Please enter a template name.',
        variant: 'destructive',
      });
      return;
    }

    createTemplateMutation.mutate({
      name: templateName.trim(),
      description: templateDescription.trim(),
    });
  };

  const canonical = `${window.location.origin}/outreach/templates`;

  return (
    <>
      <Helmet>
        <title>Global Templates – Outreach Management</title>
        <meta name="description" content="Create and manage reusable email templates for outreach sequences." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Global Templates</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Create reusable email templates with advanced scheduling and triggers.
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Global Template</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Enter template name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    placeholder="Describe what this template is for..."
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateTemplate}
                  disabled={createTemplateMutation.isPending || !templateName.trim()}
                >
                  {createTemplateMutation.isPending ? 'Creating...' : 'Create Template'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-5 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : templates && templates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card 
                key={template.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  window.location.href = `/outreach/templates/${template.id}`;
                }}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    {template.is_public && (
                      <Badge variant="secondary">Public</Badge>
                    )}
                  </div>
                  {template.description && (
                    <CardDescription>{template.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{template.email_count} emails</span>
                    <span>
                      Updated {new Date(template.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-muted rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No templates yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first global template to get started with reusable email sequences.
            </p>
            <Button onClick={() => window.location.href = '/outreach/templates/new'}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>
        )}
      </div>
    </>
  );
}