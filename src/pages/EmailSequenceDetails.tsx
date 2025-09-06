import React, { useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Edit, Plus, Play, Pause, Trash2, Users, Clock } from "lucide-react";
import EmailTemplateBuilder from "@/components/EmailSequences/EmailTemplateBuilder";

interface EmailSequence {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface EmailTemplate {
  id: string;
  sequence_id: string;
  name: string;
  subject: string;
  content: string;
  delay_days: number;
  delay_hours: number;
  order_index: number;
  created_at: string;
  updated_at: string;
}

const useEmailSequence = (sequenceId: string) => {
  return useQuery<EmailSequence>({
    queryKey: ["email_sequence", sequenceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_sequences")
        .select("*")
        .eq("id", sequenceId)
        .single();
      if (error) throw error;
      return data as EmailSequence;
    },
  });
};

const useEmailTemplates = (sequenceId: string) => {
  return useQuery<EmailTemplate[]>({
    queryKey: ["email_templates", sequenceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .eq("sequence_id", sequenceId)
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
};

const EmailSequenceDetails: React.FC = () => {
  const { sequenceId } = useParams<{ sequenceId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const canonical = useMemo(() => `${window.location.origin}${location.pathname}`, [location.pathname]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showTemplateBuilder, setShowTemplateBuilder] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);

  if (!sequenceId) {
    navigate('/email-sequences');
    return null;
  }

  const { data: sequence, isLoading: sequenceLoading } = useEmailSequence(sequenceId);
  const { data: templates = [], isLoading: templatesLoading } = useEmailTemplates(sequenceId);

  const createTemplateMutation = useMutation({
    mutationFn: async (templateData: Omit<EmailTemplate, 'id' | 'sequence_id' | 'created_at' | 'updated_at'>) => {
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userRes.user) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("email_templates")
        .insert([{ 
          ...templateData, 
          sequence_id: sequenceId,
          user_id: userRes.user.id,
          order_index: templates.length 
        }])
        .select("*")
        .single();
      if (error) throw error;
      return data as EmailTemplate;
    },
    onSuccess: () => {
      toast({ title: "Template created", description: "Email template has been added to the sequence." });
      setShowTemplateBuilder(false);
      queryClient.invalidateQueries({ queryKey: ["email_templates", sequenceId] });
    },
    onError: (err: any) => {
      toast({ title: "Failed to create template", description: err.message, variant: "destructive" });
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: async ({ templateId, templateData }: { templateId: string, templateData: Partial<EmailTemplate> }) => {
      const { data, error } = await supabase
        .from("email_templates")
        .update(templateData)
        .eq("id", templateId)
        .select("*")
        .single();
      if (error) throw error;
      return data as EmailTemplate;
    },
    onSuccess: () => {
      toast({ title: "Template updated", description: "Email template has been updated successfully." });
      setShowTemplateBuilder(false);
      setEditingTemplate(null);
      queryClient.invalidateQueries({ queryKey: ["email_templates", sequenceId] });
    },
    onError: (err: any) => {
      toast({ title: "Failed to update template", description: err.message, variant: "destructive" });
    },
  });

  const toggleSequenceStatus = useMutation({
    mutationFn: async (isActive: boolean) => {
      const { data, error } = await supabase
        .from("email_sequences")
        .update({ is_active: isActive })
        .eq("id", sequenceId)
        .select("*")
        .single();
      if (error) throw error;
      return data as EmailSequence;
    },
    onSuccess: (data) => {
      toast({ 
        title: data.is_active ? "Sequence activated" : "Sequence paused",
        description: data.is_active ? "Emails will start sending to recipients." : "Email sending has been paused."
      });
      queryClient.invalidateQueries({ queryKey: ["email_sequence", sequenceId] });
    },
    onError: (err: any) => {
      toast({ title: "Failed to update sequence", description: err.message, variant: "destructive" });
    },
  });

  const handleSaveTemplate = (templateData: Omit<EmailTemplate, 'id' | 'sequence_id' | 'created_at' | 'updated_at'>) => {
    if (editingTemplate) {
      updateTemplateMutation.mutate({ 
        templateId: editingTemplate.id, 
        templateData 
      });
    } else {
      createTemplateMutation.mutate(templateData);
    }
  };

  const formatDelay = (days: number, hours: number) => {
    if (days === 0 && hours === 0) return "Immediately";
    if (days === 0) return `${hours}h`;
    if (hours === 0) return `${days}d`;
    return `${days}d ${hours}h`;
  };

  if (sequenceLoading) {
    return <div className="p-6">Loading sequence...</div>;
  }

  if (!sequence) {
    return <div className="p-6">Sequence not found</div>;
  }

  return (
    <>
      <Helmet>
        <title>{sequence.name} – Email Sequence</title>
        <meta name="description" content={`Manage email templates and recipients for ${sequence.name} sequence.`} />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <header className="px-6 pt-4">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/email-sequences')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to sequences
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{sequence.name}</h1>
            {sequence.description && (
              <p className="text-sm text-muted-foreground mt-1">{sequence.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={sequence.is_active ? "default" : "secondary"}>
              {sequence.is_active ? "Active" : "Paused"}
            </Badge>
            <Button
              variant={sequence.is_active ? "destructive" : "default"}
              size="sm"
              onClick={() => toggleSequenceStatus.mutate(!sequence.is_active)}
            >
              {sequence.is_active ? (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Activate
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6">
        <Tabs defaultValue="templates" className="space-y-6">
          <TabsList>
            <TabsTrigger value="templates">Email Templates</TabsTrigger>
            <TabsTrigger value="recipients">Recipients</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-6">
            {showTemplateBuilder ? (
              <Card>
                <CardContent className="pt-6">
                  <EmailTemplateBuilder
                    template={editingTemplate || undefined}
                    onSave={handleSaveTemplate}
                    onCancel={() => {
                      setShowTemplateBuilder(false);
                      setEditingTemplate(null);
                    }}
                    isLoading={createTemplateMutation.isPending || updateTemplateMutation.isPending}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle className="text-lg">Email Templates</CardTitle>
                    <CardDescription>Configure the sequence of emails that will be sent to candidates.</CardDescription>
                  </div>
                  <Button size="sm" onClick={() => setShowTemplateBuilder(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Template
                  </Button>
                </CardHeader>
                <Separator />
                <CardContent>
                  {templatesLoading ? (
                    <div className="py-10 text-center text-muted-foreground">Loading templates...</div>
                  ) : templates.length === 0 ? (
                    <div className="py-10 text-center text-muted-foreground">
                      No templates yet. Add your first email template to get started.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          <TableHead>Template Name</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Delay</TableHead>
                          <TableHead className="w-24">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {templates.map((template, index) => (
                          <TableRow key={template.id}>
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell>{template.name}</TableCell>
                            <TableCell className="max-w-xs truncate">{template.subject}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDelay(template.delay_days, template.delay_hours)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingTemplate(template);
                                  setShowTemplateBuilder(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="recipients" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recipients</CardTitle>
                <CardDescription>Manage candidates enrolled in this sequence.</CardDescription>
              </CardHeader>
              <Separator />
              <CardContent>
                <div className="py-10 text-center text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  Recipients management coming soon...
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Analytics</CardTitle>
                <CardDescription>Track the performance of your email sequence.</CardDescription>
              </CardHeader>
              <Separator />
              <CardContent>
                <div className="py-10 text-center text-muted-foreground">
                  Analytics dashboard coming soon...
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
};

export default EmailSequenceDetails;