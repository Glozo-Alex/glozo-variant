import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { saveSearchToProject } from "@/services/search";
import { useNavigate } from "react-router-dom";
import { FolderPlus } from "lucide-react";

interface SaveToProjectDialogProps {
  sessionId: string;
  searchQuery: string;
  candidateCount: number;
}

export default function SaveToProjectDialog({ 
  sessionId, 
  searchQuery, 
  candidateCount 
}: SaveToProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectNotes, setProjectNotes] = useState("");
  const [projectClient, setProjectClient] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSave = async () => {
    if (!projectName.trim()) {
      toast({
        title: "Project name required",
        description: "Please enter a name for your project.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const project = await saveSearchToProject({
        sessionId,
        projectName: projectName.trim(),
        projectNotes: projectNotes.trim() || undefined,
        projectClient: projectClient.trim() || undefined,
      });

      toast({
        title: "Project created successfully",
        description: `"${project.name}" has been created with ${candidateCount} search results.`,
      });

      setOpen(false);
      navigate(`/project/${project.id}`);
    } catch (error) {
      console.error("Failed to save project:", error);
      toast({
        title: "Failed to create project",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setProjectName("");
    setProjectNotes("");
    setProjectClient("");
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2">
          <FolderPlus className="h-4 w-4" />
          Save to Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Search to Project</DialogTitle>
          <DialogDescription>
            Create a new project from this search with {candidateCount} candidates found.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name *</Label>
            <Input
              id="project-name"
              placeholder="Enter project name..."
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="project-client">Client</Label>
            <Input
              id="project-client"
              placeholder="Client name (optional)"
              value={projectClient}
              onChange={(e) => setProjectClient(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="project-notes">Notes</Label>
            <Textarea
              id="project-notes"
              placeholder="Additional notes about this project..."
              value={projectNotes}
              onChange={(e) => setProjectNotes(e.target.value)}
              disabled={loading}
              rows={3}
            />
          </div>
          
          <div className="bg-muted p-3 rounded-lg text-sm">
            <div className="font-medium mb-1">Search Query:</div>
            <div className="text-muted-foreground">{searchQuery}</div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Creating..." : "Create Project"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}