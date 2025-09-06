import { useState, useEffect } from 'react';
import { Plus, Trash2, GripVertical, Save, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { AdvancedScheduler, ScheduleConfig, TriggerConfig } from './AdvancedScheduler';

interface TemplateEmail {
  id?: string;
  name: string;
  subject: string;
  content: string;
  order_index: number;
  schedule_type: string;
  schedule_config: ScheduleConfig;
  trigger_config?: TriggerConfig;
}

interface GlobalTemplateBuilderProps {
  templateId?: string;
  initialData?: {
    name: string;
    description: string;
    emails: TemplateEmail[];
  };
  onSave: (data: {
    name: string;
    description: string;
    emails: TemplateEmail[];
  }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const EMAIL_VARIABLES = [
  { variable: '{{firstName}}', description: 'Recipient first name' },
  { variable: '{{lastName}}', description: 'Recipient last name' },
  { variable: '{{fullName}}', description: 'Recipient full name' },
  { variable: '{{email}}', description: 'Recipient email address' },
  { variable: '{{company}}', description: 'Recipient company' },
  { variable: '{{position}}', description: 'Recipient position' },
  { variable: '{{senderName}}', description: 'Your name' },
  { variable: '{{senderCompany}}', description: 'Your company' },
];

export function GlobalTemplateBuilder({
  templateId,
  initialData,
  onSave,
  onCancel,
  isLoading = false,
}: GlobalTemplateBuilderProps) {
  const [templateName, setTemplateName] = useState(initialData?.name || '');
  const [templateDescription, setTemplateDescription] = useState(initialData?.description || '');
  const [emails, setEmails] = useState<TemplateEmail[]>(
    initialData?.emails || [
      {
        name: 'Initial Outreach',
        subject: '',
        content: '',
        order_index: 0,
        schedule_type: 'delay',
        schedule_config: { delay: { days: 0, hours: 0 } },
      }
    ]
  );
  const { toast } = useToast();

  const addEmail = () => {
    const newEmail: TemplateEmail = {
      name: `Follow-up ${emails.length}`,
      subject: '',
      content: '',
      order_index: emails.length,
      schedule_type: 'delay',
      schedule_config: { delay: { days: 2, hours: 0 } },
    };
    setEmails([...emails, newEmail]);
  };

  const removeEmail = (index: number) => {
    if (emails.length <= 1) {
      toast({
        title: 'Cannot delete',
        description: 'A template must have at least one email.',
        variant: 'destructive',
      });
      return;
    }
    setEmails(emails.filter((_, i) => i !== index));
  };

  const updateEmail = (index: number, field: keyof TemplateEmail, value: any) => {
    const updatedEmails = emails.map((email, i) => 
      i === index ? { ...email, [field]: value } : email
    );
    setEmails(updatedEmails);
  };

  const insertVariable = (emailIndex: number, field: 'subject' | 'content', variable: string) => {
    const email = emails[emailIndex];
    const currentValue = email[field];
    const updatedValue = currentValue + variable;
    updateEmail(emailIndex, field, updatedValue);
  };

  const handleSave = async () => {
    if (!templateName.trim()) {
      toast({
        title: 'Invalid input',
        description: 'Please enter a template name.',
        variant: 'destructive',
      });
      return;
    }

    if (emails.some(email => !email.subject.trim() || !email.content.trim())) {
      toast({
        title: 'Invalid input',
        description: 'All emails must have a subject and content.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await onSave({
        name: templateName.trim(),
        description: templateDescription.trim(),
        emails: emails.map((email, index) => ({
          ...email,
          order_index: index,
        })),
      });
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: 'Error',
        description: 'Failed to save template. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto px-6 py-4 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {templateId ? 'Edit Template' : 'Create Template'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Design a multi-email sequence with advanced scheduling.
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Saving...' : 'Save Template'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {/* Template Details */}
          <Card>
            <CardHeader>
              <CardTitle>Template Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Enter template name"
                />
              </div>
              <div>
                <Label htmlFor="template-description">Description</Label>
                <Textarea
                  id="template-description"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Describe what this template is for..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Email Sequence */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Email Sequence</h2>
              <Button onClick={addEmail} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Email
              </Button>
            </div>

            {emails.map((email, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-base">
                        Email {index + 1}: {email.name}
                      </CardTitle>
                    </div>
                    {emails.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEmail(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor={`email-name-${index}`}>Email Name</Label>
                    <Input
                      id={`email-name-${index}`}
                      value={email.name}
                      onChange={(e) => updateEmail(index, 'name', e.target.value)}
                      placeholder="Enter email name"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`email-subject-${index}`}>Subject Line</Label>
                    <Input
                      id={`email-subject-${index}`}
                      value={email.subject}
                      onChange={(e) => updateEmail(index, 'subject', e.target.value)}
                      placeholder="Enter email subject"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`email-content-${index}`}>Email Content</Label>
                    <Textarea
                      id={`email-content-${index}`}
                      value={email.content}
                      onChange={(e) => updateEmail(index, 'content', e.target.value)}
                      placeholder="Enter email content..."
                      rows={6}
                    />
                  </div>

                  <Separator />

                  <AdvancedScheduler
                    scheduleType={email.schedule_type}
                    scheduleConfig={email.schedule_config}
                    triggerConfig={email.trigger_config}
                    onScheduleTypeChange={(type) => updateEmail(index, 'schedule_type', type)}
                    onScheduleConfigChange={(config) => updateEmail(index, 'schedule_config', config)}
                    onTriggerConfigChange={(config) => updateEmail(index, 'trigger_config', config)}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Available Variables</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {EMAIL_VARIABLES.map(({ variable, description }) => (
                <div key={variable} className="text-sm">
                  <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                    {variable}
                  </code>
                  <p className="text-muted-foreground mt-1 text-xs">{description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Use variables to personalize your emails</p>
              <p>• Set appropriate delays between emails</p>
              <p>• Use triggers to respond to recipient behavior</p>
              <p>• Test your sequence before using it</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}