import React, { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus } from "lucide-react";

interface EmailSequence {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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

const EmailSequences: React.FC = () => {
  const location = useLocation();
  const canonical = useMemo(() => `${window.location.origin}${location.pathname}`, [location.pathname]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sequences = [], isLoading } = useEmailSequences();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const createMutation = useMutation({
    mutationFn: async ({ name, description }: { name: string; description?: string }) => {
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userRes.user) throw new Error("Not authenticated");
      const user_id = userRes.user.id;
      const { data, error } = await supabase
        .from("email_sequences")
        .insert([{ user_id, name, description: description || null, is_active: false }])
        .select("*")
        .single();
      if (error) throw error;
      return data as EmailSequence;
    },
    onSuccess: () => {
      toast({ title: "Sequence created", description: "You can now add templates and recipients." });
      setOpen(false);
      setName("");
      setDescription("");
      queryClient.invalidateQueries({ queryKey: ["email_sequences"] });
    },
    onError: (err: any) => {
      toast({ title: "Failed to create sequence", description: err.message ?? "Please try again.", variant: "destructive" });
    },
  });

  return (
    <>
      <Helmet>
        <title>Email Sequences – Candidate Outreach</title>
        <meta name="description" content="Create and manage email sequences for candidate outreach." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <header className="px-6 pt-4">
        <h1 className="text-2xl font-semibold tracking-tight">Email Sequences</h1>
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
                    <DialogTitle>Create sequence</DialogTitle>
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
                  </div>
                  <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={() => createMutation.mutate({ name, description })} disabled={!name.trim() || createMutation.isPending}>
                      {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sequences.map((seq) => (
                      <TableRow 
                        key={seq.id} 
                        className="hover:bg-muted/50 cursor-pointer"
                        onClick={() => window.location.href = `/email-sequences/${seq.id}`}
                      >
                        <TableCell className="font-medium">{seq.name}</TableCell>
                        <TableCell>
                          {seq.is_active ? (
                            <Badge>Active</Badge>
                          ) : (
                            <Badge variant="secondary">Paused</Badge>
                          )}
                        </TableCell>
                        <TableCell>{new Date(seq.created_at).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
};

export default EmailSequences;
