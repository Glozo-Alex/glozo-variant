import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Users, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface GlobalTemplate {
  id: string;
  name: string;
  description?: string;
}

interface ShortlistSequenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
  candidatesCount: number;
  globalTemplates: GlobalTemplate[];
}

export const ShortlistSequenceDialog = ({
  open,
  onOpenChange,
  projectId,
  projectName,
  candidatesCount,
  globalTemplates
}: ShortlistSequenceDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("scratch");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setName("");
      setDescription("");
      setSelectedTemplateId("scratch");
    }
  }, [open]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for the sequence",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userRes.user) throw new Error("Not authenticated");
      const user_id = userRes.user.id;
      
      // Create the sequence
      const { data: sequence, error: sequenceError } = await supabase
        .from("email_sequences")
        .insert([{ 
          user_id, 
          name, 
          description: description || null, 
          is_active: false,
          project_id: projectId,
          global_template_id: selectedTemplateId !== "scratch" ? selectedTemplateId : null
        }])
        .select("*")
        .single();

      if (sequenceError) throw sequenceError;

      // If a template is selected, copy its emails to the sequence
      if (selectedTemplateId !== "scratch") {
        const { data: templateEmails, error: templatesError } = await supabase
          .from("global_template_emails")
          .select("*")
          .eq("global_template_id", selectedTemplateId)
          .order("order_index");

        if (templatesError) throw templatesError;

        if (templateEmails && templateEmails.length > 0) {
          const emailsToCreate = templateEmails.map((email, index) => ({
            sequence_id: sequence.id,
            user_id,
            name: email.name,
            subject: email.subject,
            content: email.content,
            order_index: index,
            delay_days: 0,
            delay_hours: 0
          }));

          const { error: createEmailsError } = await supabase
            .from("email_templates")
            .insert(emailsToCreate);

          if (createEmailsError) throw createEmailsError;
        }
      }

      // Get all shortlisted candidates for this project
      const { data: shortlistCandidates, error: shortlistError } = await supabase
        .from("project_shortlist")
        .select("candidate_id")
        .eq("project_id", projectId)
        .eq("user_id", user_id);

      if (shortlistError) throw shortlistError;

      // Add all shortlisted candidates as recipients
      if (shortlistCandidates && shortlistCandidates.length > 0) {
        const recipientsToCreate = shortlistCandidates.map(candidate => ({
          sequence_id: sequence.id,
          project_id: projectId,
          user_id,
          candidate_id: candidate.candidate_id,
          status: 'active',
          current_template_index: 0,
          enrolled_at: new Date().toISOString()
        }));

        const { error: recipientsError } = await supabase
          .from("sequence_recipients")
          .insert(recipientsToCreate);

        if (recipientsError) throw recipientsError;
      }

      toast({
        title: "Sequence created",
        description: `Created "${name}" with ${candidatesCount} recipients from shortlist`
      });

      onOpenChange(false);
      navigate("/email-sequences");
    } catch (error) {
      console.error("Failed to create sequence:", error);
      toast({
        title: "Error",
        description: "Failed to create sequence. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Email Sequence from Shortlist</DialogTitle>
          <DialogDescription>
            Create a new email sequence with all shortlisted candidates from {projectName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
              <Users className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">{candidatesCount}</p>
                <p className="text-xs text-muted-foreground">Recipients</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
              <Badge variant="outline" className="text-xs">
                {projectName}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Sequence Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter sequence name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this sequence..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template">Start from Template (Optional)</Label>
            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scratch">Start from scratch</SelectItem>
                {globalTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900 dark:text-blue-100">
                All {candidatesCount} shortlisted candidates will be automatically added as recipients
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Creating..." : "Create Sequence"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};