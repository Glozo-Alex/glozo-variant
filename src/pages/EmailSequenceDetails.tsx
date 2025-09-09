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
import { ArrowLeft, Edit, Plus, Play, Pause, Trash2, Users, Clock, Send } from "lucide-react";
import { SequenceTemplateBuilder } from "@/components/EmailSequences/SequenceTemplateBuilder";
import { ContactInfo } from "@/components/ContactInfo";

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

interface SequenceRecipient {
  id: string;
  candidate_id: string;
  status: string;
  current_template_index: number;
  enrolled_at: string;
  next_send_at: string | null;
  completed_at: string | null;
  candidate_snapshot?: any;
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

const useSequenceRecipients = (sequenceId: string) => {
  return useQuery<SequenceRecipient[]>({
    queryKey: ["sequence_recipients", sequenceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sequence_recipients")
        .select("*")
        .eq("sequence_id", sequenceId)
        .order("enrolled_at", { ascending: false });
      if (error) throw error;
      
      // Get candidate snapshots for each recipient
      const enrichedData = await Promise.all(
        (data ?? []).map(async (recipient) => {
          const { data: shortlistData } = await supabase
            .from("project_shortlist")
            .select("candidate_snapshot")
            .eq("candidate_id", recipient.candidate_id)
            .eq("project_id", recipient.project_id)
            .single();
          
          return {
            ...recipient,
            candidate_snapshot: shortlistData?.candidate_snapshot
          } as SequenceRecipient;
        })
      );
      
      return enrichedData;
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

  if (!sequenceId) {
    navigate('/email-sequences');
    return null;
  }

  const { data: sequence, isLoading: sequenceLoading } = useEmailSequence(sequenceId);
  const { data: templates = [], isLoading: templatesLoading } = useEmailTemplates(sequenceId);
  const { data: recipients = [], isLoading: recipientsLoading } = useSequenceRecipients(sequenceId);

  const saveTemplatesMutation = useMutation({
    mutationFn: async (emails: EmailTemplate[]) => {
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userRes.user) throw new Error("Not authenticated");
      
      // Delete existing templates for this sequence
      const { error: deleteError } = await supabase
        .from("email_templates")
        .delete()
        .eq("sequence_id", sequenceId);
      if (deleteError) throw deleteError;

      // Insert new templates
      if (emails.length > 0) {
        const templateData = emails.map(email => ({
          user_id: userRes.user.id,
          sequence_id: sequenceId,
          name: email.name,
          subject: email.subject,
          content: email.content,
          delay_days: email.delay_days,
          delay_hours: email.delay_hours,
          order_index: email.order_index,
          schedule_type: 'delay',
          schedule_config: {}
        }));

        const { error: insertError } = await supabase
          .from("email_templates")
          .insert(templateData);
        if (insertError) throw insertError;
      }

      return emails;
    },
    onSuccess: () => {
      toast({ title: "Templates saved", description: "Email templates have been updated successfully." });
      setShowTemplateBuilder(false);
      queryClient.invalidateQueries({ queryKey: ["email_templates", sequenceId] });
    },
    onError: (err: any) => {
      toast({ title: "Failed to save templates", description: err.message, variant: "destructive" });
    },
  });

  const sendTestMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('send-sequence-test', {
        body: { sequenceId }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Test email sent", description: "Delivered to alex@glozo.com and michael@glozo.com" });
    },
    onError: (err: any) => {
      toast({ title: "Failed to send test email", description: err.message, variant: "destructive" });
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

  const handleSaveTemplates = async (data: { emails: any[] }) => {
    const emailTemplates = data.emails.map(email => ({
      ...email,
      id: undefined, // Remove id to force new creation
    }));
    await saveTemplatesMutation.mutateAsync(emailTemplates);
  };

  const formatDelay = (days: number, hours: number) => {
    if (days === 0 && hours === 0) return "Immediately";
    if (days === 0) return `${hours}h`;
    if (hours === 0) return `${days}d`;
    return `${days}d ${hours}h`;
  };

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      case 'paused':
        return <Badge variant="outline">Paused</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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
              <SequenceTemplateBuilder
                sequenceId={sequenceId}
                sequenceName={sequence.name}
                initialData={{
                  emails: templates.map(t => ({
                    id: t.id,
                    name: t.name,
                    subject: t.subject,
                    content: t.content,
                    order_index: t.order_index,
                    delay_days: t.delay_days,
                    delay_hours: t.delay_hours,
                  }))
                }}
                onSave={handleSaveTemplates}
                onCancel={() => setShowTemplateBuilder(false)}
                isLoading={saveTemplatesMutation.isPending}
              />
            ) : (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle className="text-lg">Email Templates</CardTitle>
                    <CardDescription>Configure the sequence of emails that will be sent to candidates.</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => sendTestMutation.mutate()}
                      disabled={templatesLoading || templates.length === 0 || sendTestMutation.isPending}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {sendTestMutation.isPending ? "Sending..." : "Send Test"}
                    </Button>
                    <Button size="sm" onClick={() => setShowTemplateBuilder(true)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Templates
                    </Button>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent>
                  {templatesLoading ? (
                    <div className="py-10 text-center text-muted-foreground">Loading templates...</div>
                  ) : templates.length === 0 ? (
                    <div className="py-10 text-center text-muted-foreground">
                      No templates yet. Click "Edit Templates" to get started.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          <TableHead>Template Name</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Delay</TableHead>
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
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Recipients ({recipients.length})
                </CardTitle>
                <CardDescription>Manage candidates enrolled in this sequence.</CardDescription>
              </CardHeader>
              <Separator />
              <CardContent>
                {recipientsLoading ? (
                  <div className="py-10 text-center text-muted-foreground">Loading recipients...</div>
                ) : recipients.length === 0 ? (
                  <div className="py-10 text-center text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    No recipients enrolled yet. Create this sequence from a project shortlist to automatically add candidates.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Candidate</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Current Step</TableHead>
                        <TableHead>Enrolled</TableHead>
                        <TableHead>Next Send</TableHead>
                        <TableHead>Completed</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recipients.map((recipient) => (
                        <TableRow key={recipient.id}>
                          <TableCell className="font-medium">
                            {recipient.candidate_snapshot?.name || recipient.candidate_id}
                          </TableCell>
                          <TableCell>
                            <ContactInfo 
                              candidate={recipient.candidate_snapshot || {}} 
                              size="sm" 
                            />
                          </TableCell>
                          <TableCell>{getStatusBadge(recipient.status)}</TableCell>
                          <TableCell>
                            {recipient.current_template_index + 1} / {templates.length}
                          </TableCell>
                          <TableCell>
                            {formatShortDate(recipient.enrolled_at)}
                          </TableCell>
                          <TableCell>
                            {recipient.next_send_at 
                              ? formatShortDate(recipient.next_send_at)
                              : '-'
                            }
                          </TableCell>
                          <TableCell>
                            {recipient.completed_at 
                              ? formatShortDate(recipient.completed_at)
                              : '-'
                            }
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
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