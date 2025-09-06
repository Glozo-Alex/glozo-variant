import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, MoreVertical, Edit, Trash2 } from "lucide-react";

interface EmailSequence {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  global_template_id: string | null;
}

interface GlobalTemplate {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  user_id: string;
}

const useEmailSequences = () => {
  return useQuery<EmailSequence[]>({
    queryKey: ["email_sequences"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_sequences")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
};

const useGlobalTemplates = () => {
  return useQuery<GlobalTemplate[]>({
    queryKey: ["global_templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("global_templates")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
};

const EmailSequences: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const canonical = useMemo(() => `${window.location.origin}${location.pathname}`, [location.pathname]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sequences = [], isLoading } = useEmailSequences();
  const { data: globalTemplates = [] } = useGlobalTemplates();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [editingSequence, setEditingSequence] = useState<EmailSequence | null>(null);
  const [deleteSequenceId, setDeleteSequenceId] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: async ({ name, description, templateId }: { name: string; description?: string; templateId?: string }) => {
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userRes.user) throw new Error("Not authenticated");
      const user_id = userRes.user.id;
      
      // Create the sequence
      const { data: sequence, error } = await supabase
        .from("email_sequences")
        .insert([{ 
          user_id, 
          name, 
          description: description || null, 
          is_active: false,
          global_template_id: templateId || null
        }])
        .select("*")
        .single();
      if (error) throw error;

      // If a template is selected, copy its emails to the sequence
      if (templateId) {
        const { data: templateEmails, error: templatesError } = await supabase
          .from("global_template_emails")
          .select("*")
          .eq("global_template_id", templateId)
          .order("order_index");
        
        if (templatesError) throw templatesError;

        if (templateEmails && templateEmails.length > 0) {
          const emailTemplates = templateEmails.map(email => ({
            user_id,
            sequence_id: sequence.id,
            name: email.name,
            subject: email.subject,
            content: email.content,
            order_index: email.order_index,
            delay_days: 0,
            delay_hours: 0,
            schedule_type: 'delay',
            schedule_config: {}
          }));

          const { error: insertError } = await supabase
            .from("email_templates")
            .insert(emailTemplates);
          
          if (insertError) throw insertError;
        }
      }

      return sequence as EmailSequence;
    },
    onSuccess: () => {
      toast({ title: "Sequence created", description: "You can now add templates and recipients." });
      setOpen(false);
      setName("");
      setDescription("");
      setSelectedTemplateId("");
      queryClient.invalidateQueries({ queryKey: ["email_sequences"] });
    },
    onError: (err: any) => {
      toast({ title: "Failed to create sequence", description: err.message ?? "Please try again.", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, name, description }: { id: string; name: string; description?: string }) => {
      const { data, error } = await supabase
        .from("email_sequences")
        .update({ name, description: description || null })
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw error;
      return data as EmailSequence;
    },
    onSuccess: () => {
      toast({ title: "Sequence updated", description: "Changes have been saved." });
      setEditingSequence(null);
      setName("");
      setDescription("");
      queryClient.invalidateQueries({ queryKey: ["email_sequences"] });
    },
    onError: (err: any) => {
      toast({ title: "Failed to update sequence", description: err.message ?? "Please try again.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("email_sequences")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Sequence deleted", description: "The sequence has been removed." });
      setDeleteSequenceId(null);
      queryClient.invalidateQueries({ queryKey: ["email_sequences"] });
    },
    onError: (err: any) => {
      toast({ title: "Failed to delete sequence", description: err.message ?? "Please try again.", variant: "destructive" });
    },
  });

  const handleCreateOrEdit = () => {
    if (editingSequence) {
      updateMutation.mutate({ id: editingSequence.id, name, description });
    } else {
      createMutation.mutate({ name, description, templateId: selectedTemplateId });
    }
  };

  const handleEdit = (sequence: EmailSequence) => {
    setEditingSequence(sequence);
    setName(sequence.name);
    setDescription(sequence.description || "");
    setOpen(true);
  };

  const handleCancelEdit = () => {
    setEditingSequence(null);
    setName("");
    setDescription("");
    setSelectedTemplateId("");
    setOpen(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <>
      <Helmet>
        <title>Outreach – Candidate Management</title>
        <meta name="description" content="Create and manage outreach sequences for candidate engagement." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <header className="px-6 pt-4">
        <h1 className="text-2xl font-semibold tracking-tight">Outreach</h1>
        <p className="text-sm text-muted-foreground mt-1">Create, manage, and track multi-step outreach campaigns.</p>
      </header>

      <main className="p-6 space-y-6">
        <section>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-lg">Your sequences</CardTitle>
                <CardDescription>Organize outreach for different roles and projects.</CardDescription>
              </div>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" /> New sequence
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingSequence ? "Edit sequence" : "Create sequence"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Name</label>
                      <Input placeholder="e.g. Senior Backend Engineer outreach" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Description</label>
                      <Textarea placeholder="Short description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                    {!editingSequence && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Template (optional)</label>
                        <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a global template or create from scratch" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Create from scratch</SelectItem>
                            {globalTemplates.map(template => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="ghost" onClick={handleCancelEdit}>Cancel</Button>
                    <Button 
                      onClick={handleCreateOrEdit} 
                      disabled={!name.trim() || createMutation.isPending || updateMutation.isPending}
                    >
                      {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {editingSequence ? "Save" : "Create"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <Separator />
            <CardContent>
              {isLoading ? (
                <div className="py-10 text-center text-muted-foreground">Loading sequences…</div>
              ) : sequences.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground">No sequences yet. Create your first one.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-16">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sequences.map((seq) => (
                      <TableRow 
                        key={seq.id} 
                        className="hover:bg-muted/50"
                      >
                        <TableCell 
                          className="font-medium cursor-pointer"
                          onClick={() => navigate(`/email-sequences/${seq.id}`)}
                        >
                          {seq.name}
                        </TableCell>
                        <TableCell>
                          {seq.is_active ? (
                            <Badge>Active</Badge>
                          ) : (
                            <Badge variant="secondary">Paused</Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(seq.created_at)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(seq)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => setDeleteSequenceId(seq.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
      
      <AlertDialog open={!!deleteSequenceId} onOpenChange={() => setDeleteSequenceId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete sequence</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the sequence and all its templates.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteSequenceId && deleteMutation.mutate(deleteSequenceId)}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EmailSequences;
