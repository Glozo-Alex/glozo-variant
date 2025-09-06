import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, GripVertical, Save, ArrowLeft, ChevronDown, ChevronUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
  const [collapsedEmails, setCollapsedEmails] = useState<Set<number>>(new Set());
  const [activeField, setActiveField] = useState<{ emailIndex: number; field: 'subject' | 'content' } | null>(null);
  const subjectRefs = useRef<(HTMLInputElement | null)[]>([]);
  const contentRefs = useRef<(HTMLTextAreaElement | null)[]>([]);
  const { toast } = useToast();

  // Sync local state when initialData loads (fixes editing showing only one email)
  useEffect(() => {
    if (!initialData) return;

    setTemplateName(initialData.name || '');
    setTemplateDescription(initialData.description || '');
    setEmails(
      initialData.emails && initialData.emails.length > 0
        ? initialData.emails
        : [
            {
              name: 'Initial Outreach',
              subject: '',
              content: '',
              order_index: 0,
              schedule_type: 'delay',
              schedule_config: { delay: { days: 0, hours: 0 } },
            },
          ]
    );
  }, [initialData]);

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

  const insertVariable = (variable: string) => {
    if (!activeField) return;
    
    const { emailIndex, field } = activeField;
    const ref = field === 'subject' ? subjectRefs.current[emailIndex] : contentRefs.current[emailIndex];
    
    if (ref) {
      const start = ref.selectionStart || 0;
      const end = ref.selectionEnd || 0;
      const currentValue = emails[emailIndex][field];
      const newValue = currentValue.slice(0, start) + variable + currentValue.slice(end);
      
      updateEmail(emailIndex, field, newValue);
      
      // Restore cursor position after the inserted variable
      setTimeout(() => {
        if (ref) {
          ref.focus();
          ref.setSelectionRange(start + variable.length, start + variable.length);
        }
      }, 0);
    }
  };

  const toggleEmailCollapse = (index: number) => {
    const newCollapsed = new Set(collapsedEmails);
    if (newCollapsed.has(index)) {
      newCollapsed.delete(index);
    } else {
      newCollapsed.add(index);
    }
    setCollapsedEmails(newCollapsed);
  };

  const isEmailComplete = (email: TemplateEmail) => {
    return email.name.trim() && email.subject.trim() && email.content.trim();
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
              <Collapsible 
                key={index} 
                open={!collapsedEmails.has(index)} 
                onOpenChange={() => toggleEmailCollapse(index)}
              >
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {index + 1}
                            </Badge>
                            <CardTitle className="text-base">
                              {email.name || `Email ${index + 1}`}
                            </CardTitle>
                            {isEmailComplete(email) ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-amber-500" />
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {emails.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeEmail(index);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                          {collapsedEmails.has(index) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronUp className="h-4 w-4" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
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
                          ref={(el) => (subjectRefs.current[index] = el)}
                          id={`email-subject-${index}`}
                          value={email.subject}
                          onChange={(e) => updateEmail(index, 'subject', e.target.value)}
                          onFocus={() => setActiveField({ emailIndex: index, field: 'subject' })}
                          placeholder="Enter email subject"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`email-content-${index}`}>Email Content</Label>
                        <Textarea
                          ref={(el) => (contentRefs.current[index] = el)}
                          id={`email-content-${index}`}
                          value={email.content}
                          onChange={(e) => updateEmail(index, 'content', e.target.value)}
                          onFocus={() => setActiveField({ emailIndex: index, field: 'content' })}
                          placeholder="Enter email content..."
                          rows={6}
                        />
                      </div>

                      <Separator />

                      <Collapsible defaultOpen={false}>
                        <CollapsibleTrigger asChild>
                          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-medium">Schedule Settings</h4>
                              <Badge variant="outline" className="text-xs">
                                {email.schedule_type === 'delay' && 
                                  `${email.schedule_config.delay?.days || 0}d ${email.schedule_config.delay?.hours || 0}h`}
                                {email.schedule_type === 'specific_date' && 'Specific Date'}
                                {email.schedule_type === 'days_of_week' && 'Weekly'}
                                {email.schedule_type === 'trigger_based' && 'Trigger Based'}
                              </Badge>
                            </div>
                            <ChevronDown className="h-4 w-4" />
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-4">
                          <AdvancedScheduler
                            scheduleType={email.schedule_type}
                            scheduleConfig={email.schedule_config}
                            triggerConfig={email.trigger_config}
                            onScheduleTypeChange={(type) => updateEmail(index, 'schedule_type', type)}
                            onScheduleConfigChange={(config) => updateEmail(index, 'schedule_config', config)}
                            onTriggerConfigChange={(config) => updateEmail(index, 'trigger_config', config)}
                          />
                        </CollapsibleContent>
                      </Collapsible>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Available Variables</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                {activeField ? 
                  `Click to insert at cursor in Email ${activeField.emailIndex + 1} ${activeField.field}` : 
                  'Focus on a field to insert variables'
                }
              </p>
              <div className="grid grid-cols-1 gap-2">
                {EMAIL_VARIABLES.map(({ variable, description }) => (
                  <div key={variable}>
                    <Badge
                      variant="outline"
                      className={`w-full justify-start cursor-pointer hover:bg-accent text-xs ${
                        activeField ? 'hover:bg-primary hover:text-primary-foreground' : 'opacity-50'
                      }`}
                      onClick={() => activeField && insertVariable(variable)}
                    >
                      {variable}
                    </Badge>
                    <p className="text-muted-foreground mt-1 text-xs pl-2">{description}</p>
                  </div>
                ))}
              </div>
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