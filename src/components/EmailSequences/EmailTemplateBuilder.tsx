import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Eye, Save, X, ChevronDown } from "lucide-react";

interface EmailTemplate {
  id?: string;
  name: string;
  subject: string;
  content: string;
  delay_days: number;
  delay_hours: number;
  order_index: number;
}

interface EmailTemplateBuilderProps {
  template?: EmailTemplate;
  onSave: (template: Omit<EmailTemplate, 'id'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const EMAIL_VARIABLES = [
  { key: "{{firstName}}", description: "Candidate's first name" },
  { key: "{{lastName}}", description: "Candidate's last name" },
  { key: "{{fullName}}", description: "Candidate's full name" },
  { key: "{{position}}", description: "Job position" },
  { key: "{{company}}", description: "Your company name" },
  { key: "{{recruiterName}}", description: "Your name" },
];

const TEMPLATE_PRESETS = {
  initial_outreach: {
    name: "Initial Outreach",
    subject: "Exciting {{position}} opportunity at {{company}}",
    content: `Hi {{firstName}},

I hope this message finds you well. I came across your profile and was impressed by your background in [specific skill/experience].

We have an exciting {{position}} opportunity at {{company}} that I think would be a great fit for your skills and career goals.

Would you be open to a brief conversation to discuss this opportunity?

Best regards,
{{recruiterName}}`
  },
  follow_up: {
    name: "Follow-up",
    subject: "Following up on {{position}} opportunity",
    content: `Hi {{firstName}},

I wanted to follow up on my previous message regarding the {{position}} role at {{company}}.

I understand you're probably busy, but I'd love to share more details about this opportunity when you have a moment.

Looking forward to hearing from you.

Best regards,
{{recruiterName}}`
  },
  final_outreach: {
    name: "Final Outreach",
    subject: "Last chance: {{position}} at {{company}}",
    content: `Hi {{firstName}},

This will be my final message regarding the {{position}} opportunity at {{company}}.

If you're interested or know someone who might be, please don't hesitate to reach out.

Thank you for your time.

Best regards,
{{recruiterName}}`
  }
};

const EmailTemplateBuilder: React.FC<EmailTemplateBuilderProps> = ({
  template,
  onSave,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<Omit<EmailTemplate, 'id'>>({
    name: template?.name || "",
    subject: template?.subject || "",
    content: template?.content || "",
    delay_days: template?.delay_days || 0,
    delay_hours: template?.delay_hours || 0,
    order_index: template?.order_index || 0,
  });

  const [showPreview, setShowPreview] = useState(false);
  const [activeField, setActiveField] = useState<'subject' | 'content' | null>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const handlePresetSelect = (presetKey: string) => {
    const preset = TEMPLATE_PRESETS[presetKey as keyof typeof TEMPLATE_PRESETS];
    if (preset) {
      setFormData(prev => ({
        ...prev,
        name: preset.name,
        subject: preset.subject,
        content: preset.content,
      }));
    }
  };

  const insertVariable = (variable: string) => {
    if (!activeField) return;
    
    const ref = activeField === 'subject' ? subjectRef.current : contentRef.current;
    
    if (ref) {
      const start = ref.selectionStart || 0;
      const end = ref.selectionEnd || 0;
      const currentValue = formData[activeField];
      const newValue = currentValue.slice(0, start) + variable + currentValue.slice(end);
      
      setFormData(prev => ({
        ...prev,
        [activeField]: newValue
      }));
      
      // Restore cursor position after the inserted variable
      setTimeout(() => {
        if (ref) {
          ref.focus();
          ref.setSelectionRange(start + variable.length, start + variable.length);
        }
      }, 0);
    }
  };

  const renderPreview = () => {
    let previewContent = formData.content;
    EMAIL_VARIABLES.forEach(variable => {
      const placeholder = variable.key.replace('{{', '').replace('}}', '');
      previewContent = previewContent.replace(
        new RegExp(variable.key.replace(/[{}]/g, '\\$&'), 'g'),
        `[${placeholder}]`
      );
    });

    return (
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Subject Preview</Label>
          <div className="mt-1 p-3 bg-muted rounded-md">
            {formData.subject.replace(/\{\{(\w+)\}\}/g, '[$1]')}
          </div>
        </div>
        <div>
          <Label className="text-sm font-medium">Content Preview</Label>
          <div className="mt-1 p-3 bg-muted rounded-md whitespace-pre-wrap">
            {previewContent}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {template ? 'Edit Template' : 'Create Email Template'}
        </h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="mr-2 h-4 w-4" />
            {showPreview ? 'Edit' : 'Preview'}
          </Button>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {showPreview ? (
        renderPreview()
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                placeholder="e.g. Initial Outreach"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-subject">Email Subject</Label>
              <Input
                ref={subjectRef}
                id="template-subject"
                placeholder="e.g. Exciting opportunity at {{company}}"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                onFocus={() => setActiveField('subject')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-content">Email Content</Label>
              <Textarea
                ref={contentRef}
                id="template-content"
                placeholder="Write your email content here..."
                rows={12}
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                onFocus={() => setActiveField('content')}
              />
            </div>

            <Collapsible defaultOpen={false}>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium">Delay Settings</h4>
                    <Badge variant="outline" className="text-xs">
                      {formData.delay_days}d {formData.delay_hours}h
                    </Badge>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="delay-days">Delay (Days)</Label>
                    <Input
                      id="delay-days"
                      type="number"
                      min="0"
                      value={formData.delay_days}
                      onChange={(e) => setFormData(prev => ({ ...prev, delay_days: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="delay-hours">Additional Hours</Label>
                    <Input
                      id="delay-hours"
                      type="number"
                      min="0"
                      max="23"
                      value={formData.delay_hours}
                      onChange={(e) => setFormData(prev => ({ ...prev, delay_hours: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Start</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Label className="text-xs">Use a preset:</Label>
                <Select onValueChange={handlePresetSelect}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Choose preset" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="initial_outreach">Initial Outreach</SelectItem>
                    <SelectItem value="follow_up">Follow-up</SelectItem>
                    <SelectItem value="final_outreach">Final Outreach</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Variables</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  {activeField ? 
                    `Click to insert at cursor in ${activeField}` : 
                    'Focus on a field to insert variables'
                  }
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {EMAIL_VARIABLES.map((variable) => (
                    <div key={variable.key}>
                      <Badge
                        variant="outline"
                        className={`w-full justify-start cursor-pointer hover:bg-accent text-xs ${
                          activeField ? 'hover:bg-primary hover:text-primary-foreground' : 'opacity-50'
                        }`}
                        onClick={() => activeField && insertVariable(variable.key)}
                      >
                        {variable.key}
                      </Badge>
                      <p className="text-muted-foreground mt-1 text-xs pl-2">{variable.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button 
          onClick={() => onSave(formData)}
          disabled={!formData.name || !formData.subject || !formData.content || isLoading}
        >
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? 'Saving...' : 'Save Template'}
        </Button>
      </div>
    </div>
  );
};

export default EmailTemplateBuilder;